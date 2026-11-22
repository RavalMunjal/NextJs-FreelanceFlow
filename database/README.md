# FreelanceFlow Database Architecture

The database layer of **FreelanceFlow** is powered by **MongoDB Atlas** using the **Mongoose ODM**.

## MongoDB Connection (`lib/mongodb.js`)
- Uses a cached Mongoose connection to prevent connection leakage across Next.js API serverless invocations.
- Reads `process.env.MONGODB_URI` securely.

## Mongoose Models (`models/`)
1. **Client (`models/Client.js`)**:
   - `fullName` (String, required)
   - `email` (String, required, trimmed)
   - `phone` (String, optional)
   - `company` (String, optional)
   - `address` (String, optional)
   - `notes` (String, optional)
   - Timestamps: `createdAt`, `updatedAt`

2. **Project (`models/Project.js`)**:
   - `title` (String, required)
   - `client` (ObjectId ref: 'Client', required)
   - `description` (String)
   - `budget` (Number, in paise/rupees)
   - `agreedAmount` (Number, in paise/rupees)
   - `startDate` (Date)
   - `deadline` (Date)
   - `priority` (Enum: 'Low', 'Medium', 'High')
   - `status` (Enum: 'Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled')
   - `progress` (Number, 0 to 100)
   - Timestamps: `createdAt`, `updatedAt`

3. **Task (`models/Task.js`)**:
   - `project` (ObjectId ref: 'Project', required)
   - `title` (String, required)
   - `description` (String)
   - `type` (Enum: 'Task', 'Milestone')
   - `priority` (Enum: 'Low', 'Medium', 'High')
   - `dueDate` (Date)
   - `status` (Enum: 'To Do', 'In Progress', 'Completed')
   - `completedAt` (Date)
   - Timestamps: `createdAt`, `updatedAt`

4. **Deliverable (`models/Deliverable.js`)**:
   - `project` (ObjectId ref: 'Project', required)
   - `title` (String, required)
   - `description` (String)
   - `dueDate` (Date)
   - `submissionDate` (Date)
   - `fileUrl` (String)
   - `status` (Enum: 'Pending', 'Submitted', 'Approved', 'Revision Required')
   - `revisionNotes` (String)
   - `history` (Array of status change records)
   - Timestamps: `createdAt`, `updatedAt`

5. **Payment (`models/Payment.js`)**:
   - `project` (ObjectId ref: 'Project', required)
   - `amount` (Number, stored in paise, formatted as rupees)
   - `paymentDate` (Date, required)
   - `paymentMethod` (Enum: 'Cash', 'UPI', 'Bank Transfer', 'Card', 'Other')
   - `paymentType` (Enum: 'Advance', 'Partial', 'Final')
   - `referenceNumber` (String)
   - `notes` (String)
   - Timestamps: `createdAt`, `updatedAt`

6. **Activity (`models/Activity.js`)**:
   - `project` (ObjectId ref: 'Project', optional)
   - `title` (String, required)
   - `description` (String, required)
   - `type` (String, e.g. 'CLIENT_CREATED', 'PROJECT_CREATED', 'PAYMENT_RECORDED', etc.)
   - Timestamps: `createdAt`
