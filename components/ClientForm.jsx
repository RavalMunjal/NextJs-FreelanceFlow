"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Save, ArrowLeft, Building2, User, Mail, Phone, MapPin, FileText } from "lucide-react";
import Link from "next/link";

export default function ClientForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    address: initialData?.address || "",
    notes: initialData?.notes || "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error upon typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Basic client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the form errors");
      return;
    }

    setLoading(true);

    try {
      const url = isEdit ? `/api/clients/${initialData._id}` : "/api/clients";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Something went wrong");
      }

      toast.success(isEdit ? "Client updated successfully!" : "Client added successfully!");
      router.push("/clients");
      router.refresh();
    } catch (err) {
      console.error("Client form error:", err);
      toast.error(err.message || "Failed to save client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border border-cream-border card-shadow p-6 md:p-8">
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-cream-border">
        <div>
          <h2 className="text-xl font-bold text-textColor-primary">
            {isEdit ? "Edit Client Profile" : "Add New Client"}
          </h2>
          <p className="text-xs text-textColor-secondary mt-1">
            {isEdit
              ? "Update client contact details and business information."
              : "Register a new client to associate with freelance projects."}
          </p>
        </div>

        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-textColor-secondary hover:text-textColor-primary hover:bg-cream-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
            Full Name <span className="text-terracotta">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest ${
                errors.fullName ? "border-terracotta" : "border-cream-border"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-terracotta mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
            Email Address <span className="text-terracotta">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest ${
                errors.email ? "border-terracotta" : "border-cream-border"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-terracotta mt-1">{errors.email}</p>
          )}
        </div>

        {/* Phone & Company Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
              Company Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textColor-secondary">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Acme Corp"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
            Billing Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none text-textColor-secondary">
              <MapPin className="w-4 h-4" />
            </div>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              placeholder="Full mailing or invoice address..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-textColor-primary mb-1.5">
            Internal Notes
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-2.5 pointer-events-none text-textColor-secondary">
              <FileText className="w-4 h-4" />
            </div>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Important notes, preferred communication channel, budget discussions..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-cream-border bg-cream/30 focus:outline-none focus:ring-1 focus:ring-forest focus:border-forest"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-border">
          <Link
            href="/clients"
            className="px-4 py-2 text-sm font-medium rounded-lg border border-cream-border text-textColor-secondary bg-white hover:bg-cream-dark transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg bg-forest text-white hover:bg-forest-light transition-colors shadow-sm ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-copper-light" />
            )}
            <span>{isEdit ? "Update Client" : "Save Client"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
