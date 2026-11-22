"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Briefcase,
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react";
import Loading from "@/components/Loading";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import ProgressBar from "@/components/ProgressBar";
import { formatDate, getStatusBadgeClasses, getPriorityBadgeClasses } from "@/lib/utils";
import { formatINR } from "@/lib/calculations";

export default function ClientDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch client details with associated projects & payments
  const fetchClientDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients/${id}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.message || "Failed to load client details");
      }
    } catch (err) {
      console.error("Fetch client details error:", err);
      toast.error("Failed to load client data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id, fetchClientDetails]);

  // Handle client delete
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Cannot delete client");
      }

      toast.success("Client deleted successfully");
      router.push("/clients");
      router.refresh();
    } catch (err) {
      console.error("Delete client error:", err);
      toast.error(err.message || "Failed to delete client");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <Loading message="Loading client portfolio and billing details..." />;
  }

  if (!data?.client) {
    return (
      <EmptyState
        title="Client Not Found"
        description="The requested client record does not exist or may have been deleted."
        actionText="Back to Clients"
        actionHref="/clients"
      />
    );
  }

  const { client, projects = [], payments = [], financialSummary } = data;

  return (
    <div className="space-y-6">
      {/* Navigation header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-border">
        <div className="flex items-center gap-3">
          <Link
            href="/clients"
            className="p-2 rounded-lg text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-textColor-primary">
                {client.fullName}
              </h1>
              {client.company && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cream-dark text-textColor-primary border border-cream-border">
                  {client.company}
                </span>
              )}
            </div>
            <p className="text-xs text-textColor-secondary mt-0.5">
              Client registered on {formatDate(client.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/projects/new?clientId=${client._id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4 text-copper-light" />
            <span>Create Project</span>
          </Link>

          <Link
            href={`/clients/${client._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-cream-border bg-white text-textColor-primary hover:bg-cream-dark transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </Link>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-terracotta hover:bg-terracotta-light transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Total Projects
          </p>
          <p className="text-2xl font-bold text-textColor-primary">
            {financialSummary?.totalProjects || 0}
          </p>
          <span className="text-xs text-textColor-secondary mt-1 block">
            Associated contracts
          </span>
        </div>

        {/* Total Agreed Amount */}
        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Total Agreed Value
          </p>
          <p className="text-2xl font-bold text-textColor-primary">
            {formatINR(financialSummary?.totalAgreedPaise || 0)}
          </p>
          <span className="text-xs text-textColor-secondary mt-1 block">
            Combined budget
          </span>
        </div>

        {/* Total Received */}
        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Total Collected
          </p>
          <p className="text-2xl font-bold text-sage-dark">
            {formatINR(financialSummary?.totalPaidPaise || 0)}
          </p>
          <span className="text-xs text-sage-dark font-medium mt-1 block">
            Cleared payments
          </span>
        </div>

        {/* Outstanding Balance */}
        <div className="p-4 bg-white rounded-xl border border-cream-border card-shadow">
          <p className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary mb-1">
            Outstanding Due
          </p>
          <p className="text-2xl font-bold text-terracotta">
            {formatINR(financialSummary?.outstandingPaise || 0)}
          </p>
          <span className="text-xs text-terracotta font-medium mt-1 block">
            Pending clearance
          </span>
        </div>
      </div>

      {/* Client Profile Details Card */}
      <div className="p-6 bg-white rounded-xl border border-cream-border card-shadow">
        <h2 className="text-base font-bold text-textColor-primary mb-4 pb-2 border-b border-cream-border">
          Contact & Profile Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary block mb-1">
              Email Address
            </span>
            <div className="flex items-center gap-1.5 text-textColor-primary font-medium">
              <Mail className="w-4 h-4 text-textColor-secondary" />
              <a href={`mailto:${client.email}`} className="hover:text-forest underline">
                {client.email}
              </a>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary block mb-1">
              Phone Number
            </span>
            <div className="flex items-center gap-1.5 text-textColor-primary font-medium">
              <Phone className="w-4 h-4 text-textColor-secondary" />
              <span>{client.phone || "Not provided"}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary block mb-1">
              Company / Business
            </span>
            <div className="flex items-center gap-1.5 text-textColor-primary font-medium">
              <Building2 className="w-4 h-4 text-textColor-secondary" />
              <span>{client.company || "Independent Client"}</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-textColor-secondary block mb-1">
              Address
            </span>
            <div className="flex items-start gap-1.5 text-textColor-primary">
              <MapPin className="w-4 h-4 text-textColor-secondary mt-0.5" />
              <span className="text-xs leading-relaxed">{client.address || "No address on file"}</span>
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 pt-4 border-t border-cream-border text-xs">
            <span className="font-semibold uppercase tracking-wider text-textColor-secondary block mb-1">
              Notes
            </span>
            <p className="text-textColor-primary bg-cream/50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
              {client.notes}
            </p>
          </div>
        )}
      </div>

      {/* Associated Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-forest" />
            <h2 className="text-lg font-bold text-textColor-primary">
              Client Projects ({projects.length})
            </h2>
          </div>

          <Link
            href={`/projects/new?clientId=${client._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-light"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </Link>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No projects linked yet"
            description="Start working with this client by creating their first project contract."
            actionText="Create Project"
            actionHref={`/projects/new?clientId=${client._id}`}
          />
        ) : (
          <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                    <th className="py-3 px-4">Project Title</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Agreed Amount</th>
                    <th className="py-3 px-4 min-w-[140px]">Progress</th>
                    <th className="py-3 px-4">Deadline</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border/60">
                  {projects.map((proj) => (
                    <tr key={proj._id} className="hover:bg-cream/20 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-textColor-primary">
                        <Link href={`/projects/${proj._id}`} className="hover:text-forest">
                          {proj.title}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusBadgeClasses(proj.status)}`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityBadgeClasses(proj.priority)}`}>
                          {proj.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-textColor-primary">
                        {formatINR(proj.agreedAmount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <ProgressBar progress={proj.progress || 0} size="sm" />
                      </td>
                      <td className="py-3.5 px-4 text-xs text-textColor-secondary">
                        {formatDate(proj.deadline)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/projects/${proj._id}`}
                          className="px-2.5 py-1 text-xs font-medium rounded bg-cream-dark text-forest hover:bg-forest hover:text-white transition-colors"
                        >
                          Workspace
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Payment History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-forest" />
            <h2 className="text-lg font-bold text-textColor-primary">
              Payment History ({payments.length})
            </h2>
          </div>

          <Link
            href="/payments"
            className="text-xs font-semibold text-forest hover:text-forest-light"
          >
            Manage All Payments →
          </Link>
        </div>

        {payments.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-xl border border-cream-border card-shadow text-xs text-textColor-secondary">
            No payments have been recorded for this client yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-cream-border card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream/60 border-b border-cream-border text-xs uppercase font-semibold text-textColor-secondary">
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Ref Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-border/60">
                  {payments.map((pmt) => (
                    <tr key={pmt._id} className="hover:bg-cream/20 transition-colors">
                      <td className="py-3 px-4 text-xs text-textColor-secondary">
                        {formatDate(pmt.paymentDate)}
                      </td>
                      <td className="py-3 px-4 font-medium text-textColor-primary">
                        {pmt.project?.title || "N/A"}
                      </td>
                      <td className="py-3 px-4 font-bold text-sage-dark">
                        {formatINR(pmt.amount)}
                      </td>
                      <td className="py-3 px-4 text-xs font-medium">
                        <span className="px-2 py-0.5 rounded-full bg-cream-dark border border-cream-border">
                          {pmt.paymentType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-textColor-secondary">
                        {pmt.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-textColor-secondary">
                        {pmt.referenceNumber || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Client Record?"
        message={`Are you sure you want to permanently delete "${client.fullName}"? If active projects or financial records exist, deletion will be safely rejected.`}
        confirmText="Confirm Delete"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
