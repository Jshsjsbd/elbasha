import { json, type RequestHandler } from "react-router";
import {
  APPLICATION_TYPES,
  getApplicationQuestions,
  validateApplicationAnswers,
} from "../services/applications";
import { validateMinecraftUsername } from "../services/minecraft";
import { sendApplicationEmbed, sendApplicationResultDM } from "../services/bot";
import { v4 as uuidv4 } from "uuid";

// In-memory storage for applications (replace with Firebase/DB)
const applications = new Map();

/**
 * GET /api/applications/types
 * Get all available application types
 */
export const getApplicationTypes: RequestHandler = async () => {
  return json(APPLICATION_TYPES, { status: 200 });
};

/**
 * GET /api/applications/:type/form
 * Get application form for specific type
 */
export const getApplicationForm: RequestHandler = async ({
  params,
}) => {
  try {
    const { type } = params;

    if (!type) {
      return json({ error: "Application type is required" }, { status: 400 });
    }

    const appType = APPLICATION_TYPES.find((t) => t.id === type);

    if (!appType) {
      return json(
        { error: "Application type not found" },
        { status: 404 }
      );
    }

    const questions = getApplicationQuestions(type);

    return json(
      {
        type: appType.id,
        label: appType.label,
        description: appType.description,
        icon: appType.icon,
        questions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get form error:", error);
    return json({ error: "Failed to fetch application form" }, { status: 500 });
  }
};

/**
 * POST /api/applications/submit
 * Submit a new application
 */
export const submitApplication: RequestHandler = async ({
  request,
}) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const sessionToken = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!sessionToken) {
      return json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      discordId,
      discordUsername,
      avatarUrl,
      minecraftUsername,
      answers,
    } = body;

    // Validate required fields
    if (!type || !discordId || !discordUsername || !minecraftUsername || !answers) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate Minecraft username
    const validation = await validateMinecraftUsername(minecraftUsername);

    if (!validation.valid || !validation.uuid) {
      return json(
        { error: `Invalid Minecraft username: ${minecraftUsername}` },
        { status: 400 }
      );
    }

    // Get application questions
    const questions = getApplicationQuestions(type);

    // Validate answers
    const validation_result = validateApplicationAnswers(answers, questions);

    if (!validation_result.valid) {
      return json(
        { error: "Invalid answers", errors: validation_result.errors },
        { status: 400 }
      );
    }

    // Create application
    const applicationId = uuidv4();
    const application = {
      id: applicationId,
      type,
      discordId,
      discordUsername,
      avatarUrl,
      minecraftUsername,
      minecraftUuid: validation.uuid,
      answers,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    // Store application (replace with Firebase)
    applications.set(applicationId, application);

    // Send embed to Discord
    const messageId = await sendApplicationEmbed({
      id: applicationId,
      userId: discordId,
      discordId,
      username: discordUsername,
      avatarUrl,
      minecraftUsername,
      applicationType: type,
      answers,
      submittedAt: application.submittedAt,
      status: "pending",
      messageId,
    });

    if (messageId) {
      application.messageId = messageId;
      applications.set(applicationId, application);
    }

    return json(
      {
        success: true,
        applicationId,
        message: "Application submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submit application error:", error);
    return json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
};

/**
 * GET /api/applications/:id
 * Get application details
 */
export const getApplication: RequestHandler = async ({
  params,
}) => {
  try {
    const { id } = params;

    if (!id) {
      return json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    const application = applications.get(id);

    if (!application) {
      return json({ error: "Application not found" }, { status: 404 });
    }

    return json(application, { status: 200 });
  } catch (error) {
    console.error("Get application error:", error);
    return json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
};

/**
 * POST /api/applications/:id/review
 * Review application (accept/reject) - requires moderator role
 */
export const reviewApplication: RequestHandler = async ({
  request,
  params,
}) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { id } = params;
    const { action, reviewerId } = await request.json();

    if (!id || !action || !reviewerId) {
      return json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action !== "accept" && action !== "reject") {
      return json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const application = applications.get(id);

    if (!application) {
      return json({ error: "Application not found" }, { status: 404 });
    }

    // Update application status
    application.status = action === "accept" ? "accepted" : "rejected";
    application.reviewedAt = new Date().toISOString();
    application.reviewedBy = reviewerId;
    applications.set(id, application);

    // Send result DM to applicant
    const resultSent = await sendApplicationResultDM(
      application.discordId,
      action === "accept" ? "accepted" : "rejected",
      id
    );

    if (!resultSent) {
      console.error("Failed to send result DM");
    }

    return json(
      {
        success: true,
        message: `Application ${action === "accept" ? "accepted" : "rejected"} successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Review application error:", error);
    return json(
      { error: "Failed to review application" },
      { status: 500 }
    );
  }
};
