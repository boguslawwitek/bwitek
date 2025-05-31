import type { Metadata } from "next";
import AdminNewsletterClient from "@/components/admin/admin-newsletter-client";

export const metadata: Metadata = {
  title: "Newsletter - Admin Panel",
  description: "Manage newsletter subscriptions and send notifications",
};

export default function AdminNewsletterPage() {
  return <AdminNewsletterClient />;
}