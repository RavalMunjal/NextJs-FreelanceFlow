# FreelanceFlow Frontend Architecture

The frontend of **FreelanceFlow** is built with **Next.js 14 App Router**, **React 18**, and **Tailwind CSS**.

## Structure
- **Pages & Routes (`app/`)**: File-based App Router structure for all views:
  - `/` — Main Executive Dashboard with real-time statistics and charts
  - `/clients` — Client Directory, Client Creation, and Client Details with financial balance
  - `/projects` — Project Portfolio, Project Creation, and Project Workspace
  - `/tasks` — Tasks & Milestones with Kanban board view
  - `/deliverables` — Deliverable Review and Submission Pipeline
  - `/payments` — Payment History, Balance Tracking, and Receipt Downloads
  - `/reports` — Business Analytics and Financial Reports
- **Components (`components/`)**:
  - `Sidebar.jsx` — Dark Forest Green responsive sidebar navigation
  - `Header.jsx` — Top navigation header with quick actions and mobile toggle
  - `StatCard.jsx` — Reusable statistical overview card
  - `ProgressBar.jsx` — Dynamic Sage Green project progress indicators
  - `ConfirmDialog.jsx` — Accessible deletion confirmation modal
  - `EmptyState.jsx` — User-friendly empty state fallback
  - `Loading.jsx` — Smooth loading spinner
  - `DashboardCharts.jsx` — Interactive Recharts data visualizations
  - Form components for Clients, Projects, Tasks, Deliverables, and Payments
- **Styling**:
  - Color Theme: Forest Green (`#173D32`), Warm Cream (`#F7F5EF`), Copper Gold (`#C58B55`), and Sage Green (`#477960`)
  - Configured in `tailwind.config.js` and `app/globals.css`
