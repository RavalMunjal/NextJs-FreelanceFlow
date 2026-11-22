import ProjectForm from "@/components/ProjectForm";

export const metadata = {
  title: "Create New Project — FreelanceFlow",
};

export default function NewProjectPage() {
  return (
    <div className="py-4">
      <ProjectForm />
    </div>
  );
}
