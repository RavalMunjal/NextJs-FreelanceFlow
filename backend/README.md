# FreelanceFlow Backend Architecture

The backend of **FreelanceFlow** is implemented using **Next.js 14 API Route Handlers** running on the **Node.js runtime**, providing a robust RESTful API layer.

## API Endpoints (`app/api/`)
- **/api/clients**:
  - `GET` — List clients with search and filter
  - `POST` — Create a new client with validation
  - `GET /api/clients/[id]` — Retrieve client details, projects, and billing stats
  - `PATCH /api/clients/[id]` — Update client details
  - `DELETE /api/clients/[id]` — Safe delete (prevents deleting clients with active projects/payments)
- **/api/projects**:
  - `GET` — List projects with status/client filters and sorting
  - `POST` — Create project linked to client
  - `GET /api/projects/[id]` — Project details with tasks, deliverables, payments, and activities
  - `PATCH /api/projects/[id]` — Update project details, status, or priority
  - `DELETE /api/projects/[id]` — Safe delete check
- **/api/tasks**:
  - `GET` — List tasks and milestones by project or status
  - `POST` — Add new task/milestone and automatically update project progress
  - `PATCH /api/tasks/[id]` — Update task status and trigger progress recalculation
  - `DELETE /api/tasks/[id]` — Delete task and update project progress
- **/api/deliverables**:
  - `GET` — List deliverables
  - `POST` — Add deliverable
  - `PATCH /api/deliverables/[id]` — Update submission, approve, or request revision
  - `DELETE /api/deliverables/[id]` — Remove deliverable
- **/api/payments**:
  - `GET` — List payment history
  - `POST` — Record advance, partial, or final payment (strictly validated against outstanding balance)
  - `PATCH /api/payments/[id]` — Edit payment and recalculate balance
  - `DELETE /api/payments/[id]` — Delete payment and recalculate balance
- **/api/dashboard**:
  - `GET` — Aggregated dashboard statistics and monthly earnings
- **/api/reports**:
  - `GET` — Analytics data for Recharts, PDF, and CSV downloads
- **/api/activities**:
  - `GET` — Recent business activity timeline
