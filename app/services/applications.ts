import { v4 as uuidv4 } from "uuid";

export interface ApplicationForm {
  id: string;
  type: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  order: number;
  text: string;
  type: "text" | "textarea" | "select" | "multiselect";
  required: boolean;
  options?: string[];
}

export interface ApplicationSubmissionData {
  id: string;
  formId: string;
  discordId: string;
  discordUsername: string;
  avatarUrl: string;
  minecraftUsername: string;
  minecraftUuid: string;
  answers: Record<string, string>;
  status: "pending" | "accepted" | "rejected";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  messageId?: string;
}

/**
 * Application types configuration
 */
export const APPLICATION_TYPES = [
  {
    id: "staff",
    label: "Staff Application",
    icon: "👨‍⚖️",
    description: "Apply to join our staff team",
  },
  {
    id: "media",
    label: "Media Application",
    icon: "📹",
    description: "Apply to become a content creator",
  },
  {
    id: "youtube",
    label: "YouTube Partner",
    icon: "📺",
    description: "Partner with us as a YouTuber",
  },
  {
    id: "streamer",
    label: "Streamer Application",
    icon: "🎮",
    description: "Apply as an official streamer",
  },
  {
    id: "moderator",
    label: "Moderator Application",
    icon: "🛡️",
    description: "Apply to moderate our community",
  },
];

/**
 * Get predefined questions for application type
 */
export function getApplicationQuestions(
  applicationType: string
): Question[] {
  const commonQuestions: Question[] = [
    {
      id: "minecraft_username",
      order: 0,
      text: "What is your Minecraft username?",
      type: "text",
      required: true,
    },
  ];

  const typeSpecificQuestions: Record<string, Question[]> = {
    staff: [
      {
        id: "experience",
        order: 1,
        text: "How much experience do you have with server management?",
        type: "textarea",
        required: true,
      },
      {
        id: "timezone",
        order: 2,
        text: "What is your timezone?",
        type: "text",
        required: true,
      },
      {
        id: "hours",
        order: 3,
        text: "How many hours per week can you dedicate to this role?",
        type: "text",
        required: true,
      },
      {
        id: "why",
        order: 4,
        text: "Why do you want to join our staff team?",
        type: "textarea",
        required: true,
      },
    ],
    media: [
      {
        id: "platforms",
        order: 1,
        text: "Which platforms do you create content on?",
        type: "multiselect",
        required: true,
        options: ["YouTube", "TikTok", "Twitch", "Instagram", "Other"],
      },
      {
        id: "followers",
        order: 2,
        text: "How many followers/subscribers do you have?",
        type: "text",
        required: true,
      },
      {
        id: "content_type",
        order: 3,
        text: "What type of content do you create?",
        type: "textarea",
        required: true,
      },
      {
        id: "portfolio",
        order: 4,
        text: "Please share links to your content",
        type: "textarea",
        required: true,
      },
    ],
    youtube: [
      {
        id: "channel",
        order: 1,
        text: "Your YouTube channel link",
        type: "text",
        required: true,
      },
      {
        id: "subscribers",
        order: 2,
        text: "How many subscribers do you have?",
        type: "text",
        required: true,
      },
      {
        id: "avg_views",
        order: 3,
        text: "What is your average video view count?",
        type: "text",
        required: true,
      },
      {
        id: "upload_frequency",
        order: 4,
        text: "How often do you upload videos?",
        type: "select",
        required: true,
        options: [
          "Daily",
          "3-4 times a week",
          "Twice a week",
          "Weekly",
          "Bi-weekly",
          "Monthly",
        ],
      },
    ],
    streamer: [
      {
        id: "platform",
        order: 1,
        text: "Which platform do you stream on?",
        type: "select",
        required: true,
        options: ["Twitch", "YouTube", "Kick", "Other"],
      },
      {
        id: "followers",
        order: 2,
        text: "How many followers do you have?",
        type: "text",
        required: true,
      },
      {
        id: "avg_viewers",
        order: 3,
        text: "What is your average viewer count?",
        type: "text",
        required: true,
      },
      {
        id: "stream_schedule",
        order: 4,
        text: "What is your streaming schedule?",
        type: "textarea",
        required: true,
      },
    ],
    moderator: [
      {
        id: "experience",
        order: 1,
        text: "Do you have moderation experience? If yes, please describe",
        type: "textarea",
        required: true,
      },
      {
        id: "availability",
        order: 2,
        text: "How many hours per day can you moderate?",
        type: "text",
        required: true,
      },
      {
        id: "timezone",
        order: 3,
        text: "What is your timezone?",
        type: "text",
        required: true,
      },
      {
        id: "motivation",
        order: 4,
        text: "Why do you want to help moderate our community?",
        type: "textarea",
        required: true,
      },
    ],
  };

  return [
    ...commonQuestions,
    ...(typeSpecificQuestions[applicationType] || []),
  ];
}

/**
 * Create new application submission
 */
export function createApplicationSubmission(
  formId: string,
  discordId: string,
  discordUsername: string,
  avatarUrl: string,
  minecraftUsername: string,
  minecraftUuid: string,
  answers: Record<string, string>
): ApplicationSubmissionData {
  return {
    id: uuidv4(),
    formId,
    discordId,
    discordUsername,
    avatarUrl,
    minecraftUsername,
    minecraftUuid,
    answers,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Validate application answers
 */
export function validateApplicationAnswers(
  answers: Record<string, string>,
  questions: Question[]
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  questions.forEach((question) => {
    const answer = answers[question.id];

    if (question.required && (!answer || answer.trim() === "")) {
      errors[question.id] = "This field is required";
    }

    if (question.type === "text" && answer && answer.length > 500) {
      errors[question.id] = "Answer is too long (max 500 characters)";
    }

    if (question.type === "textarea" && answer && answer.length > 2000) {
      errors[question.id] = "Answer is too long (max 2000 characters)";
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
