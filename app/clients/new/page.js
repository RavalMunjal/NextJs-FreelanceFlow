import ClientForm from "@/components/ClientForm";

export const metadata = {
  title: "Add New Client — FreelanceFlow",
};

export default function NewClientPage() {
  return (
    <div className="py-4">
      <ClientForm />
    </div>
  );
}
