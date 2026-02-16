"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProjectWithStatus } from "@/types/database";

export default function Home() {
  const [projects, setProjects] = useState<ProjectWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newEraLocation, setNewEraLocation] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject() {
    if (!newTitle.trim() || !newEraLocation.trim()) {
      alert("Please fill in both title and era/location");
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          era_location: newEraLocation.trim(),
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle("");
        setNewEraLocation("");
        loadProjects();
      } else {
        alert("Failed to create project");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project");
    }
  }

  async function handleDeleteProject(id: number) {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        loadProjects();
      } else {
        alert("Failed to delete project");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project");
    }
  }

  async function handleDuplicateProject(id: number) {
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, {
        method: "POST",
      });

      if (res.ok) {
        loadProjects();
      } else {
        alert("Failed to duplicate project");
      }
    } catch (error) {
      console.error("Failed to duplicate project:", error);
      alert("Failed to duplicate project");
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Cozy Crime Creator Suite
            </h1>
            <p className="text-slate-600">
              Transform historical research into publish-ready scripts
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Create New Project
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No projects yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-900 mb-1">
                    {project.title}
                  </h2>
                  <p className="text-sm text-slate-600">{project.era_location}</p>
                </div>

                <div className="mb-4 text-xs text-slate-500 space-y-1">
                  <div>Created: {formatDate(project.created_at)}</div>
                  <div>Updated: {formatDate(project.updated_at)}</div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {project.status.script_30min_generated && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      30-min
                    </span>
                  )}
                  {project.status.script_90min_generated && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      90-min
                    </span>
                  )}
                  {project.status.description_generated && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      Description
                    </span>
                  )}
                  {project.status.shorts_generated && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      Shorts
                    </span>
                  )}
                  {project.status.metadata_generated && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                      Metadata
                    </span>
                  )}
                  {project.status.image_prompt_generated && (
                    <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">
                      Image
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/project/${project.id}/research`}
                    className="flex-1 px-4 py-2 bg-slate-900 text-white text-center rounded hover:bg-slate-800 transition-colors text-sm"
                  >
                    Open
                  </Link>
                  <button
                    onClick={() => handleDuplicateProject(project.id)}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors text-sm"
                    title="Duplicate"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">
                Create New Project
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Case Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., The Mysterious Disappearance"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Era / Location
                  </label>
                  <input
                    type="text"
                    value={newEraLocation}
                    onChange={(e) => setNewEraLocation(e.target.value)}
                    placeholder="e.g., Victorian London, 1888"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTitle("");
                    setNewEraLocation("");
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
