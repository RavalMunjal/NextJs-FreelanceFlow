# FreelanceFlow — Freelance Project & Client Management System

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![React 18](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.js.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Mongoose_9-47A248?logo=mongodb)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A complete, responsive, full-stack web application designed for independent freelancers, digital agencies, and consultants to manage clients, contract projects, task milestones, deliverable submissions, and billing balances in one unified workspace.

Built strictly according to **Project No. 2 — Freelance Project & Client Management** of the official semester project guidelines:
[CodingGita NextJS Portfolio Project Specifications](https://github.com/codinggita/CGxSU_Semester_1/blob/main/Semester_3/NextJS/nextjs-portfolio-project.md).

---

## 📌 Project Overview & Objectives

FreelanceFlow solves the chaos of juggling client communications, disjointed spreadsheets, delivery links, and payment tracking. The application guides users through an intuitive, professional end-to-end operational workflow:

```
Create Client  ➜  Create Project Contract  ➜  Add Tasks & Milestones  ➜  Track Progress (0-100%)
      ➜  Submit Deliverables  ➜  Approve / Request Revision  ➜  Record Payments  ➜  Export PDF / CSV Reports
```

### Core Features
- **Executive Business Dashboard**: Real-time aggregated financial KPIs, monthly earnings bar chart, project status distribution pie chart, upcoming deadlines within 14 days, and audited system activity logs.
- **Client Relationship Management**: Client profiles, contact directory, associated project contracts, billing histories, and safe deletion guards.
- **Project Portfolio Workspace**: Tabbed workspaces tracking contract deliverables, milestones, payment records, scope, priority, and progress percentage.
- **Tasks & Milestones Kanban Board**: 3-column Kanban interface (`To Do` | `In Progress` | `Completed`) with automated progress formula recalculation.
- **Deliverable Submission Pipeline**: Track external client review links (Google Drive, Figma, GitHub), review approvals, revision feedback notes, and status transition history.
- **Financial & Payment Ledger**: Manual payment tracking for Advance, Partial, and Final settlements with strict overpayment prevention and balance recalculations.
- **Authentic PDF & CSV Downloads**:
  - Payment Receipt PDF (with computer-generated transaction reference)
  - Financial Analytics Summary PDF
  - Payment Report CSV export
- **Unique Visual Identity**: Custom **Forest Green** (`#173D32`), **Warm Cream** (`#F7F5EF`), and **Copper Gold** (`#C58B55`) aesthetic.

---

## 🛠️ Technology Stack

| Layer | Technologies | Description |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, Tailwind CSS | File-based routing, server and client components, responsive UI |
| **Backend** | Next.js API Route Handlers, Node.js Runtime | RESTful JSON endpoints, server-side data validation |
| **Database** | MongoDB Atlas, Mongoose ODM 9.x | Document-based persistence, cached connections, ObjectId references |
| **Icons & Charts**| Lucide React, Recharts | Accessible SVG iconography and responsive data visualization |
| **Document Export**| jsPDF | Real client-side vector PDF generation and CSV blobs |
| **Notifications** | React Hot Toast | Responsive toast feedback for user actions |
| **Deployment** | Vercel & GitHub | Continuous integration and serverless edge deployment ready |

---

## 📐 Application Architecture & Structure

Next.js handles both frontend and backend within a single repository, eliminating CORS and server synchronization issues:

```
freelance-flow/
|-- app/
|   |-- api/                          # Backend RESTful Route Handlers
|   |   |-- clients/                  # GET / POST clients
|   |   |   `-- [id]/                 # GET / PATCH / DELETE client
|   |   |-- projects/                 # GET / POST projects
|   |   |   `-- [id]/                 # GET / PATCH / DELETE project workspace
|   |   |-- tasks/                    # GET / POST tasks (triggers progress update)
|   |   |   `-- [id]/                 # GET / PATCH / DELETE task
|   |   |-- deliverables/             # GET / POST deliverables
|   |   |   `-- [id]/                 # GET / PATCH / DELETE deliverable (approvals)
|   |   |-- payments/                 # GET / POST payments (overpayment guard)
|   |   |   `-- [id]/                 # GET / PATCH / DELETE payment
|   |   |-- dashboard/route.js        # Aggregated KPI & chart metrics
|   |   |-- reports/route.js          # Filtered analytics data
|   |   `-- activities/route.js       # System audit timeline
|   |
|   |-- clients/                      # Client directory, detail views & forms
|   |-- projects/                     # Project portfolio & project workspaces
|   |-- tasks/page.js                 # 3-Column Kanban board
|   |-- deliverables/page.js          # Deliverable pipeline & review workflow
|   |-- payments/page.js              # Payment ledger & receipt downloads
|   |-- reports/page.js               # Analytics dashboard & export buttons
|   |-- layout.js                     # Root HTML shell & navigation wrapper
|   |-- page.js                       # Executive Business Dashboard
|   |-- loading.js                    # Global loading indicator
|   |-- error.js                      # Graceful error boundary
|   |-- not-found.js                  # 404 handler
|   `-- globals.css                   # Theme CSS variables & utilities
|
|-- components/                       # Modular React Functional Components
|   |-- Sidebar.jsx                   # Dark Forest Green responsive sidebar
|   |-- Header.jsx                    # Top bar with quick action buttons
|   |-- StatCard.jsx                  # Reusable KPI card with trend accents
|   |-- ClientForm.jsx                # Client registration form
|   |-- ProjectForm.jsx               # Project contract creator form
|   |-- TaskForm.jsx                  # Task / Milestone modal form
|   |-- DeliverableForm.jsx           # Deliverable submission modal
|   |-- PaymentForm.jsx               # Payment entry modal with dynamic balance
|   |-- DashboardCharts.jsx           # Recharts Bar & Donut chart components
|   |-- ProgressBar.jsx               # Sage green dynamic progress bar
|   |-- ConfirmDialog.jsx             # Accessible modal for safe deletions
|   |-- EmptyState.jsx                # Friendly fallback for zero records
|   `-- Loading.jsx                   # Animated spinner
|
|-- models/                           # Mongoose Database Schemas
|   |-- Client.js                     # Client profile model
|   |-- Project.js                    # Project contract model
|   |-- Task.js                       # Tasks and key milestones
|   |-- Deliverable.js                # Deliverables with review history
|   |-- Payment.js                    # Monetary transactions (in paise)
|   `-- Activity.js                   # Audited system activities
|
|-- lib/                              # Core Utilities & Business Rules
|   |-- mongodb.js                    # Cached Mongoose connection helper
|   |-- calculations.js               # Progress formula & currency logic
|   |-- utils.js                      # Date, badges, and response formatters
|   |-- activity.js                   # Audit log helper
|   |-- reports.js                    # Data series aggregators
|   |-- pdfReceipt.js                 # jsPDF Payment receipt generator
|   `-- exportReports.js              # jsPDF Financial summary & CSV exports
|
|-- scripts/
|   `-- seed.js                       # Database demo seeder
|-- tests/
|   |-- calculations.test.js          # Unit tests for calculations
|   `-- workflow.test.js              # End-to-end business rule test suite
|-- .env.example                      # Environment variables template
|-- README.md                         # Project documentation
`-- VIVA.md                           # 40+ College viva Q&A guide
```

---

## 📊 Database Models & Relationships

The MongoDB database maintains clean, relational integrity using Mongoose `ObjectId` references:

```
[ Client ] 1 ──< (Many) [ Project ]
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
[ Tasks & Milestones ] [ Deliverables ]     [ Payments ]
       │                    │                    │
       ▼                    ▼                    ▼
 Progress Recalc      Review History      Balance Update
```

- **Client**: 1 client has many projects. Protected by safe deletion rules (cannot delete clients with active projects or billing records).
- **Project**: Belongs to 1 client. Has multiple tasks, deliverables, payments, and activity records.
- **Task**: Belongs to 1 project. Type: `Task` or `Milestone`. Progress is recalculated upon any task create, update, or delete.
- **Payment**: Stored internally as integer paise (`rupeesToPaise`) to prevent floating-point rounding errors. Overpayment is strictly prevented.

---

## 🧮 Business Calculation Formulas

### 1. Project Progress Percentage
$$\text{Progress} = \min\left(100, \max\left(0, \operatorname{round}\left(\frac{\text{Completed Tasks \& Milestones}}{\text{Total Tasks \& Milestones}} \times 100\right)\right)\right)$$
- If total tasks = $0$, progress defaults to $0\%$.

### 2. Payment Balance & Status
$$\text{Total Paid} = \sum \text{Recorded Payments}$$
$$\text{Outstanding Balance} = \max(0, \text{Agreed Contract Amount} - \text{Total Paid})$$

- **Unpaid**: $\text{Total Paid} = 0$
- **Partially Paid**: $0 < \text{Total Paid} < \text{Agreed Amount}$
- **Fully Paid**: $\text{Outstanding Balance} = 0$

---

## 🚀 Installation & Local Setup

### 1. Prerequisites
- Node.js version 18.x or 20.x or 22.x
- MongoDB Atlas account or local MongoDB Community Server running on `mongodb://127.0.0.1:27017`

### 2. Clone Repository
```bash
git clone https://github.com/RavalMunjal/NextJs-FreelanceFlow.git
cd NextJs-FreelanceFlow/freelance-flow
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create `.env.local` based on `.env.example`:
```env
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/freelanceflow?retryWrites=true&w=majority

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Seed Demonstration Records (Optional)
To populate the database with realistic sample clients, projects, tasks, deliverables, and payments:
```bash
npm run seed
```

### 6. Run Automated Test Suite
```bash
npm test
```

### 7. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/clients` | List all clients with optional `?search=` filter |
| `POST` | `/api/clients` | Register a new client profile |
| `GET` | `/api/clients/[id]` | Fetch client details, project contracts, and billing summary |
| `PATCH` | `/api/clients/[id]` | Update client contact information |
| `DELETE` | `/api/clients/[id]` | Safe delete client (checks for dependent contracts) |
| `GET` | `/api/projects` | List projects with `?search=`, `?client=`, `?status=`, `?sort=` |
| `POST` | `/api/projects` | Create a new project contract |
| `GET` | `/api/projects/[id]` | Fetch complete workspace (client, tasks, deliverables, ledger) |
| `PATCH` | `/api/projects/[id]` | Update project details, status, or agreed fee |
| `DELETE` | `/api/projects/[id]` | Safe delete project (checks for linked records) |
| `GET` | `/api/tasks` | List tasks by project, status, priority, or type |
| `POST` | `/api/tasks` | Create task/milestone & recalculate project progress |
| `PATCH` | `/api/tasks/[id]` | Update task status & recalculate project progress |
| `DELETE` | `/api/tasks/[id]` | Delete task & recalculate project progress |
| `GET` | `/api/deliverables` | List deliverables with filters |
| `POST` | `/api/deliverables` | Create deliverable requirement |
| `PATCH` | `/api/deliverables/[id]` | Submit link, approve, or request revision with notes |
| `DELETE` | `/api/deliverables/[id]` | Remove deliverable |
| `GET` | `/api/payments` | List payments with project, method, and date filters |
| `POST` | `/api/payments` | Record payment with overpayment validation |
| `PATCH` | `/api/payments/[id]` | Edit payment record & balance |
| `DELETE` | `/api/payments/[id]` | Delete payment record & restore balance |
| `GET` | `/api/dashboard` | Aggregated executive KPIs, charts, and activity feeds |
| `GET` | `/api/reports` | Analytics datasets for charts, PDF summaries, and CSVs |
| `GET` | `/api/activities` | System audit timeline |

---

## 🧪 Production Build & Verification

To verify that the application compiles without errors:
```bash
npm run build
npm run start
```

---

## 🎓 Educational Demo Notice & Limitations

- This project is developed as an academic portfolio demonstration for the College Next.js Semester curriculum.
- In accordance with college guidelines, user authentication (passwords, JWT, OTP) has been intentionally omitted to keep the code accessible and focused on core business logic and full-stack integration.
- Demonstrative and fictional records should be used; do not store real confidential banking credentials.

---

## 👨‍💻 Author & Repository

- **Author**: Munjal Raval
- **GitHub Repository**: [https://github.com/RavalMunjal/NextJs-FreelanceFlow](https://github.com/RavalMunjal/NextJs-FreelanceFlow)
- **Official Problem Statement**: [Project No. 2 — Freelance Project & Client Management](https://github.com/codinggita/CGxSU_Semester_1/blob/main/Semester_3/NextJS/nextjs-portfolio-project.md)
