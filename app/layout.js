import "./globals.css";
import LayoutShell from "@/components/LayoutShell";

export const metadata = {
  title: "FreelanceFlow — Freelance Project & Client Management",
  description: "Manage freelance clients, projects, tasks, deliverables, payments and business reports in one simple workspace.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
