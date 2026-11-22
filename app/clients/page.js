"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building2,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import Loading from "@/components/Loading";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatDate } from "@/lib/utils";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch clients from backend
  const fetchClients = async (searchTerm = "") => {
    try {
      setLoading(true);
      const url = searchTerm
        ? `/api/clients?search=${encodeURIComponent(searchTerm)}`
        : "/api/clients";

      const res = await fetch(url);
      const result = await res.json();

      if (result.success) {
        setClients(result.data || []);
      } else {
        toast.error(result.message || "Failed to load clients");
      }
    } catch (err) {
      console.error("Fetch clients error:", err);
      toast.error("Failed to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Handle Search input
  const handleSearch = (e) => {
    e.preventDefault();
    fetchClients(search);
  };

  // Safe delete client
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/clients/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Failed to delete client");
      }

      toast.success("Client deleted successfully");
      setClients((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete client error:", err);
      toast.error(err.message || "Could not delete client");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-border">
        <div>
          <h1 className="text-2xl font-bold text-textColor-primary tracking-tight">
            Client Directory
          </h1>
          <p className="text-xs text-textColor-secondary mt-1">
            Manage your freelance client contacts, view project histories, and track billing balances.
          </p>
        </div>

        <Link
          href="/clients/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 text-copper-light" />
          <span>Add New Client</span>
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-cream-border card-shadow flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-textColor-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, company, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-20 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-semibold rounded bg-forest text-white hover:bg-forest-light"
          >
            Search
          </button>
        </form>

        <div className="text-xs text-textColor-secondary font-medium">
          Showing <span className="text-textColor-primary font-bold">{clients.length}</span>{" "}
          {clients.length === 1 ? "client" : "clients"}
        </div>
      </div>

      {/* Main Content View */}
      {loading ? (
        <Loading message="Loading client directory from database..." />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "No clients match your search" : "No clients added yet"}
          description={
            search
              ? "Try adjusting your search keywords to find the client you are looking for."
              : "Register your first freelance client to start creating projects, tracking milestones, and recording payments."
          }
          actionText={search ? "Clear Search" : "Add Client"}
          onAction={search ? () => { setSearch(""); fetchClients(""); } : null}
          actionHref={search ? null : "/clients/new"}
        />
      ) : (
        <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Added Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-border/60">
                {clients.map((client) => (
                  <tr key={client._id} className="hover:bg-cream/20 transition-colors">
                    {/* Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/clients/${client._id}`}
                        className="font-semibold text-textColor-primary hover:text-forest flex items-center gap-2.5"
                      >
                        <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          {client.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p>{client.fullName}</p>
                          <span className="text-xs text-textColor-secondary font-normal sm:hidden">
                            {client.company || "Individual"}
                          </span>
                        </div>
                      </Link>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4 text-textColor-secondary">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-textColor-secondary" />
                        <span>{client.company || "Individual"}</span>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-4 text-textColor-secondary">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Mail className="w-3 h-3 text-textColor-secondary" />
                          <span>{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="w-3 h-3 text-textColor-secondary" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-xs text-textColor-secondary">
                      {formatDate(client.createdAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/projects/new?clientId=${client._id}`}
                          title="Create Project"
                          className="p-1.5 rounded text-forest hover:bg-forest/10 transition-colors"
                        >
                          <Briefcase className="w-4 h-4 text-forest" />
                        </Link>
                        <Link
                          href={`/clients/${client._id}`}
                          title="View Details"
                          className="p-1.5 rounded text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/clients/${client._id}/edit`}
                          title="Edit Client"
                          className="p-1.5 rounded text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(client)}
                          title="Delete Client"
                          className="p-1.5 rounded text-terracotta hover:bg-terracotta-light transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Client Record?"
        message={`Are you sure you want to delete "${deleteTarget?.fullName}"? If this client has active projects or payment history, deletion will be blocked.`}
        confirmText="Delete Client"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
