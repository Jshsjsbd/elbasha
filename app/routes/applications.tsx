import * as Route from "react-router";
import { json } from "../utils/response";
import { useState, useEffect } from "react";
import { APPLICATION_TYPES } from "../services/applications";

export async function loader() {
  return json({
    types: APPLICATION_TYPES,
  });
}

interface ApplicationType {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export default function ApplicationsPage({ loaderData }: Route.ComponentProps) {
  const { types } = loaderData as { types: ApplicationType[] };
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-orange-950 to-slate-950">
      {/* Header */}
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-white text-center mb-4">
          🎮 Join Our Team
        </h1>
        <p className="text-xl text-orange-200 text-center">
          Apply to join our Mystic Network community
        </p>
      </div>

      {/* Applications Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {types.map((type) => (
            <a
              key={type.id}
              href={`/applications/${type.id}`}
              className="group relative bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Background glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-4">{type.icon}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {type.label}
                </h2>
                <p className="text-orange-50 mb-4">{type.description}</p>
                <button className="inline-block bg-white text-orange-600 px-6 py-2 rounded-lg font-bold hover:bg-orange-50 transition-colors duration-200 group-hover:shadow-lg">
                  Apply Now →
                </button>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Requirements Section */}
      <div className="bg-slate-900 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Application Requirements
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-lg p-6 border border-orange-500">
              <h3 className="text-xl font-bold text-orange-400 mb-4">
                ✓ Discord Account
              </h3>
              <p className="text-slate-300">
                You must have a valid Discord account and be a member of our
                server.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-orange-500">
              <h3 className="text-xl font-bold text-orange-400 mb-4">
                ✓ Minecraft Account
              </h3>
              <p className="text-slate-300">
                Your Minecraft username will be verified during the application
                process.
              </p>
            </div>

            <div className="bg-slate-800 rounded-lg p-6 border border-orange-500">
              <h3 className="text-xl font-bold text-orange-400 mb-4">
                ✓ Active Participation
              </h3>
              <p className="text-slate-300">
                We look for active, respectful members of our community.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
