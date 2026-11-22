"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ClientForm from "@/components/ClientForm";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";

export default function EditClientPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClient() {
      try {
        setLoading(true);
        const res = await fetch(`/api/clients/${id}`);
        const result = await res.json();

        if (result.success && result.data?.client) {
          setClient(result.data.client);
        } else {
          toast.error(result.message || "Failed to load client details");
        }
      } catch (err) {
        console.error("Error loading client:", err);
        toast.error("Network error while loading client");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadClient();
    }
  }, [id]);

  if (loading) {
    return <Loading message="Loading client details for editing..." />;
  }

  if (!client) {
    return (
      <EmptyState
        title="Client Not Found"
        description="Could not find the client record to edit."
        actionText="Back to Clients"
        actionHref="/clients"
      />
    );
  }

  return (
    <div className="py-4">
      <ClientForm initialData={client} isEdit={true} />
    </div>
  );
}
