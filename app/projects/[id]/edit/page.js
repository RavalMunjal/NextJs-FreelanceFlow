"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";

export default function EditProjectPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const res = await fetch(`/api/projects/${id}`);
        const result = await res.json();

        if (result.success && result.data?.project) {
          setProject(result.data.project);
        } else {
          toast.error(result.message || "Failed to load project details");
        }
      } catch (err) {
        console.error("Error loading project:", err);
        toast.error("Network error while loading project");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProject();
    }
  }, [id]);

  if (loading) {
    return <Loading message="Loading project details for editing..." />;
  }

  if (!project) {
    return (
      <EmptyState
        title="Project Not Found"
        description="Could not find the project record to edit."
        actionText="Back to Projects"
        actionHref="/projects"
      />
    );
  }

  return (
    <div className="py-4">
      <ProjectForm initialData={project} isEdit={true} />
    </div>
  );
}
