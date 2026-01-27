import type { Route } from "react-router";
import { json, redirect } from "react-router";
import { useState, useEffect } from "react";
import { getApplicationQuestions, APPLICATION_TYPES } from "../services/applications";
import { validateMinecraftUsername } from "../services/minecraft";

export async function loader({ params }: Route.LoaderArgs) {
  const { type } = params;

  if (!type) {
    return redirect("/applications");
  }

  const appType = APPLICATION_TYPES.find((t) => t.id === type);

  if (!appType) {
    return redirect("/applications");
  }

  const questions = getApplicationQuestions(type);

  return json({
    type: appType.id,
    label: appType.label,
    description: appType.description,
    icon: appType.icon,
    questions,
  });
}

interface Question {
  id: string;
  order: number;
  text: string;
  type: "text" | "textarea" | "select" | "multiselect";
  required: boolean;
  options?: string[];
}

interface FormData {
  minecraftUsername: string;
  [key: string]: string;
}

export default function ApplicationFormPage({
  loaderData,
}: Route.ComponentProps) {
  const { type, label, icon, questions } = loaderData as {
    type: string;
    label: string;
    icon: string;
    questions: Question[];
  };

  const [formData, setFormData] = useState<FormData>({ minecraftUsername: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [validatingUsername, setValidatingUsername] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (!userSession) {
      window.location.href = `/?redirect=/applications/${type}`;
    }
  }, [type]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateMinecraftUsernameAsync = async (username: string) => {
    setValidatingUsername(true);
    try {
      const result = await validateMinecraftUsername(username);
      if (!result.valid) {
        setErrors((prev) => ({
          ...prev,
          minecraftUsername: "Invalid Minecraft username",
        }));
        return false;
      }
      return true;
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        minecraftUsername: "Failed to validate username",
      }));
      return false;
    } finally {
      setValidatingUsername(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate Minecraft username
      const usernameValid = await validateMinecraftUsernameAsync(
        formData.minecraftUsername
      );
      if (!usernameValid) {
        setLoading(false);
        return;
      }

      const userSession = JSON.parse(
        localStorage.getItem("userSession") || "{}"
      );

      const response = await fetch("/api/applications/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userSession.token}`,
        },
        body: JSON.stringify({
          type,
          discordId: userSession.discordId,
          discordUsername: userSession.username,
          avatarUrl: userSession.avatar,
          minecraftUsername: formData.minecraftUsername,
          answers: Object.fromEntries(
            questions
              .filter((q) => q.id !== "minecraft_username")
              .map((q) => [q.id, formData[q.id] || ""])
          ),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setErrors({ submit: data.error || "Failed to submit application" });
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    } catch (error) {
      setErrors({
        submit: "An error occurred while submitting your application",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-green-400 mb-4">✓ Success!</h1>
          <p className="text-xl text-white mb-6">
            Your application has been submitted successfully.
          </p>
          <p className="text-orange-300">
            Our team will review it and contact you on Discord soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950 py-20">
      <div className="container mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h1 className="text-4xl font-bold text-white mb-2">{label}</h1>
          <p className="text-orange-200">Fill out the form below to apply</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 rounded-lg p-8 border border-orange-500 shadow-2xl"
        >
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-900 text-red-200 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Questions */}
          <div className="space-y-8">
            {questions.map((question) => (
              <div key={question.id}>
                <label className="block text-white font-bold mb-3">
                  {question.text}
                  {question.required && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </label>

                {question.type === "text" && (
                  <input
                    type="text"
                    name={question.id}
                    value={formData[question.id] || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg bg-slate-800 text-white border ${
                      errors[question.id]
                        ? "border-red-500"
                        : "border-orange-500"
                    } focus:outline-none focus:ring-2 focus:ring-orange-400`}
                    placeholder="Enter your answer..."
                    disabled={validatingUsername && question.id === "minecraft_username"}
                  />
                )}

                {question.type === "textarea" && (
                  <textarea
                    name={question.id}
                    value={formData[question.id] || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg bg-slate-800 text-white border ${
                      errors[question.id]
                        ? "border-red-500"
                        : "border-orange-500"
                    } focus:outline-none focus:ring-2 focus:ring-orange-400 h-32 resize-none`}
                    placeholder="Enter your answer..."
                  />
                )}

                {question.type === "select" && question.options && (
                  <select
                    name={question.id}
                    value={formData[question.id] || ""}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 rounded-lg bg-slate-800 text-white border ${
                      errors[question.id]
                        ? "border-red-500"
                        : "border-orange-500"
                    } focus:outline-none focus:ring-2 focus:ring-orange-400`}
                  >
                    <option value="">Select an option...</option>
                    {question.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === "multiselect" && question.options && (
                  <div className="flex flex-wrap gap-2">
                    {question.options.map((option) => (
                      <label
                        key={option}
                        className="flex items-center bg-slate-800 px-4 py-2 rounded-lg border border-orange-500 cursor-pointer hover:bg-slate-700 transition-colors"
                      >
                        <input
                          type="checkbox"
                          value={option}
                          checked={
                            formData[question.id]
                              ?.split(",")
                              ?.includes(option) || false
                          }
                          onChange={(e) => {
                            const currentValues = formData[question.id]
                              ? formData[question.id].split(",")
                              : [];
                            const newValues = e.target.checked
                              ? [...currentValues, option]
                              : currentValues.filter((v) => v !== option);
                            handleInputChange({
                              target: {
                                name: question.id,
                                value: newValues.join(","),
                              },
                            } as any);
                          }}
                          className="mr-2"
                        />
                        <span className="text-white">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {errors[question.id] && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors[question.id]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || validatingUsername}
            className="w-full mt-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-lg"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>

        {/* Info Box */}
        <div className="mt-12 bg-slate-800 rounded-lg p-6 border border-orange-500">
          <h3 className="text-lg font-bold text-orange-400 mb-3">
            ℹ️ Important Information
          </h3>
          <ul className="text-slate-300 space-y-2">
            <li>
              • Your Minecraft username will be verified before acceptance
            </li>
            <li>
              • Please provide accurate information in all fields
            </li>
            <li>
              • You will be notified on Discord about the status of your
              application
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
