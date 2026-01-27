import type { VercelRequest, VercelResponse } from "@vercel/node";
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  const { method, query, body } = req;
  const path = (query.path as string) || "";

  try {
    // GET /api/applications?path=types
    if (method === "GET" && path === "types") {
      return res.status(200).json(APPLICATION_TYPES);
    }

    // GET /api/applications?path=form&type=<type>
    if (method === "GET" && path === "form") {
      const type = query.type as string;

      if (!type) {
        return res.status(400).json({ error: "Application type is required" });
      }

      const appType = APPLICATION_TYPES.find((t) => t.id === type);

      if (!appType) {
        return res.status(404).json({ error: "Application type not found" });
      }

      const questions = getApplicationQuestions(type);

      return res.status(200).json({
        type: appType.id,
        label: appType.label,
        description: appType.description,
        icon: appType.icon,
        questions,
      });
    }

    // POST /api/applications?path=submit
    if (method === "POST" && path === "submit") {
      const {
        type,
        discordId,
        discordUsername,
        avatarUrl,
        minecraftUsername,
        answers,
      } = body as any;

      // Validate required fields
      if (
        !type ||
        !discordId ||
        !discordUsername ||
        !minecraftUsername ||
        !answers
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate Minecraft username
      const validation = await validateMinecraftUsername(minecraftUsername);

      if (!validation.valid || !validation.uuid) {
        return res.status(400).json({
          error: `Invalid Minecraft username: ${minecraftUsername}`,
        });
      }

      // Validate answers
      const answerValidation = validateApplicationAnswers(type, answers);
      if (!answerValidation.valid) {
        return res.status(400).json({ error: "Invalid answers", errors: answerValidation.errors });
      }

      // Create application
      const id = uuidv4();
      let messageId: string | undefined;

      try {
        messageId = await sendApplicationEmbed({
          id,
          type,
          discordId,
          discordUsername,
          avatarUrl,
          minecraftUsername,
          minecraftUuid: validation.uuid,
          answers,
        });
      } catch (botError) {
        console.error("Failed to send bot embed:", botError);
        // Continue without bot notification
      }

      // Store application
      const application = {
        id,
        type,
        discordId,
        discordUsername,
        avatarUrl,
        minecraftUsername,
        minecraftUuid: validation.uuid,
        answers,
        messageId,
        status: "submitted",
        submittedAt: new Date().toISOString(),
      };

      applications.set(id, application);

      return res.status(201).json({
        success: true,
        applicationId: id,
        message: "Application submitted successfully",
      });
    }

    // GET /api/applications?path=get&id=<id>
    if (method === "GET" && path === "get") {
      const id = query.id as string;

      if (!id) {
        return res.status(400).json({ error: "Application ID is required" });
      }

      const application = applications.get(id);

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      return res.status(200).json(application);
    }

    // POST /api/applications?path=review&id=<id>
    if (method === "POST" && path === "review") {
      const id = query.id as string;
      const { status, notes } = body as any;

      if (!id) {
        return res.status(400).json({ error: "Application ID is required" });
      }

      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const application = applications.get(id);

      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Update application
      application.status = status;
      application.reviewedAt = new Date().toISOString();
      application.reviewNotes = notes;

      // Send result DM
      try {
        await sendApplicationResultDM(
          application.discordId,
          status,
          id
        );
      } catch (error) {
        console.error("Failed to send result DM:", error);
      }

      applications.set(id, application);

      return res.status(200).json({
        success: true,
        message: `Application ${status}`,
        application,
      });
    }

    // Invalid path
    return res.status(404).json({ error: "Endpoint not found" });
  } catch (error) {
    console.error("Applications API error:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
