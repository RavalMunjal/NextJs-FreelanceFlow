import mongoose from "mongoose";
import Client from "../models/Client.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Deliverable from "../models/Deliverable.js";
import Payment from "../models/Payment.js";
import Activity from "../models/Activity.js";
import { rupeesToPaise, calculateProgress } from "../lib/calculations.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/freelanceflow";

async function seedDatabase() {
  console.log("==========================================");
  console.log("   FreelanceFlow — Demo Database Seeder   ");
  console.log("==========================================");
  console.log(`Connecting to MongoDB at: ${MONGODB_URI}...`);

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas / Local instance.");

    // Clean existing records if instructed
    console.log("Clearing previous demo records...");
    await Promise.all([
      Client.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      Deliverable.deleteMany({}),
      Payment.deleteMany({}),
      Activity.deleteMany({}),
    ]);

    // 1. Seed Clients
    console.log("Seeding Client accounts...");
    const clients = await Client.create([
      {
        fullName: "Aarav Sharma",
        email: "aarav.sharma@zenithretail.com",
        phone: "+91 98200 11223",
        company: "Zenith Retail India",
        address: "402 Corporate Tower, BKC, Mumbai 400051",
        notes: "Prefers communication over WhatsApp and weekly status summaries on Mondays.",
      },
      {
        fullName: "Priya Nair",
        email: "priya@horizoncreative.in",
        phone: "+91 98450 33445",
        company: "Horizon Media Labs",
        address: "12 Lavelle Road, Richmond Circle, Bengaluru 560001",
        notes: "High priority client with ongoing monthly UI design retainer.",
      },
      {
        fullName: "Rohan Patel",
        email: "rohan@apexlogistics.com",
        phone: "+91 97120 55667",
        company: "Apex Supply Chain",
        address: "701 Synergy Plaza, Bodakdev, Ahmedabad 380054",
        notes: "Requires milestone approvals before release of payment tranches.",
      },
    ]);

    console.log(`✅ Created ${clients.length} clients.`);

    // 2. Seed Projects
    console.log("Seeding Project contracts...");
    const now = new Date();
    const futureDate = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const pastDate = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const project1 = await Project.create({
      title: "E-Commerce Web Platform Redesign",
      client: clients[0]._id,
      description:
        "Full design and Next.js frontend rebuild for Zenith Retail catalog, shopping cart, and Razorpay payment workflow.",
      budget: rupeesToPaise(25000),
      agreedAmount: rupeesToPaise(20000), // Rs. 20,000 as per problem statement
      startDate: pastDate(20),
      deadline: futureDate(15),
      priority: "High",
      status: "In Progress",
      progress: 50,
    });

    const project2 = await Project.create({
      title: "Brand Identity & Design System",
      client: clients[1]._id,
      description:
        "Complete design system tokens, typography guide, Figma component library, and digital asset kit.",
      budget: rupeesToPaise(15000),
      agreedAmount: rupeesToPaise(15000),
      startDate: pastDate(35),
      deadline: pastDate(5),
      priority: "Medium",
      status: "Completed",
      progress: 100,
    });

    const project3 = await Project.create({
      title: "Fleet Tracking Mobile App MVP",
      client: clients[2]._id,
      description:
        "React Native hybrid application prototype with driver route logging and dispatch map dashboard.",
      budget: rupeesToPaise(40000),
      agreedAmount: rupeesToPaise(35000),
      startDate: pastDate(10),
      deadline: futureDate(30),
      priority: "High",
      status: "Planning",
      progress: 0,
    });

    console.log("✅ Created 3 projects.");

    // 3. Seed Tasks & Milestones
    console.log("Seeding Tasks and Milestones...");
    // Project 1 tasks (4 tasks, 2 completed = 50% progress)
    const p1Tasks = await Task.create([
      {
        project: project1._id,
        title: "Wireframe & Information Architecture",
        description: "Review desktop and mobile wireframes with Zenith product leads.",
        type: "Milestone",
        priority: "High",
        dueDate: pastDate(14),
        status: "Completed",
        completedAt: pastDate(12),
      },
      {
        project: project1._id,
        title: "Product Catalog & Search Filters",
        description: "Build Next.js product grid with facet filters and price sorting.",
        type: "Task",
        priority: "High",
        dueDate: pastDate(5),
        status: "Completed",
        completedAt: pastDate(4),
      },
      {
        project: project1._id,
        title: "Cart & Checkout Experience",
        description: "Implement interactive slide-over cart and shipping address inputs.",
        type: "Task",
        priority: "Medium",
        dueDate: futureDate(5),
        status: "In Progress",
      },
      {
        project: project1._id,
        title: "Final QA & Performance Optimization",
        description: "Run Lighthouse audits and verify mobile responsiveness across devices.",
        type: "Milestone",
        priority: "High",
        dueDate: futureDate(14),
        status: "To Do",
      },
    ]);

    // Update Project 1 progress using business formula
    const p1Progress = calculateProgress(p1Tasks);
    await Project.findByIdAndUpdate(project1._id, { progress: p1Progress });

    // Project 2 tasks (all completed)
    const p2Tasks = await Task.create([
      {
        project: project2._id,
        title: "Color Palette & Typography Tokens",
        type: "Task",
        priority: "Medium",
        dueDate: pastDate(25),
        status: "Completed",
        completedAt: pastDate(23),
      },
      {
        project: project2._id,
        title: "Figma Component Library Export",
        type: "Milestone",
        priority: "High",
        dueDate: pastDate(10),
        status: "Completed",
        completedAt: pastDate(8),
      },
    ]);
    await Project.findByIdAndUpdate(project2._id, { progress: 100 });

    console.log("✅ Tasks created and project progress recalculated.");

    // 4. Seed Deliverables
    console.log("Seeding Deliverables...");
    await Deliverable.create([
      {
        project: project1._id,
        title: "Catalog UI Component Library",
        description: "Modular React components for product cards, badges, and filters.",
        dueDate: pastDate(2),
        submissionDate: pastDate(1),
        fileUrl: "https://github.com/RavalMunjal/NextJs-FreelanceFlow",
        status: "Approved",
        revisionNotes: "Approved by Aarav Sharma after layout feedback.",
        history: [
          { status: "Pending", date: pastDate(15), notes: "Deliverable planned" },
          { status: "Submitted", date: pastDate(2), notes: "Submitted repo link" },
          { status: "Approved", date: pastDate(1), notes: "Approved by client" },
        ],
      },
      {
        project: project1._id,
        title: "Checkout Flow Prototype",
        description: "Interactive mock and component wiring for checkout.",
        dueDate: futureDate(8),
        submissionDate: null,
        fileUrl: "https://drive.google.com/drive/folders/sample-checkout-assets",
        status: "Submitted",
        revisionNotes: "",
        history: [
          { status: "Pending", date: pastDate(10), notes: "Initial creation" },
          { status: "Submitted", date: pastDate(0), notes: "Submitted preview link" },
        ],
      },
    ]);

    // 5. Seed Payments
    console.log("Seeding Payments...");
    // Project 1: Agreed Rs. 20,000 -> Rs. 5,000 Advance recorded -> Rs. 15,000 Outstanding
    await Payment.create({
      project: project1._id,
      amount: rupeesToPaise(5000), // Rs. 5,000 Advance
      paymentDate: pastDate(18),
      paymentMethod: "Bank Transfer",
      paymentType: "Advance",
      referenceNumber: "NEFT/HDFC/98712345",
      notes: "Advance project commencement deposit.",
    });

    // Project 2: Agreed Rs. 15,000 -> Paid in full
    await Payment.create([
      {
        project: project2._id,
        amount: rupeesToPaise(5000),
        paymentDate: pastDate(30),
        paymentMethod: "UPI",
        paymentType: "Advance",
        referenceNumber: "UPI/YESB/55443322",
        notes: "Brand identity advance payment.",
      },
      {
        project: project2._id,
        amount: rupeesToPaise(10000),
        paymentDate: pastDate(6),
        paymentMethod: "UPI",
        paymentType: "Final",
        referenceNumber: "UPI/YESB/99887766",
        notes: "Final settlement upon design asset delivery.",
      },
    ]);

    // 6. Seed Activities
    console.log("Seeding System Activity feed...");
    await Activity.create([
      {
        project: project1._id,
        title: "Client Added",
        description: `Added client "${clients[0].fullName}" (${clients[0].company})`,
        type: "CLIENT_CREATED",
      },
      {
        project: project1._id,
        title: "Project Created",
        description: `Created project "${project1.title}" with agreed fee of Rs. 20,000`,
        type: "PROJECT_CREATED",
      },
      {
        project: project1._id,
        title: "Advance Payment Recorded",
        description: "Received Rs. 5,000 advance payment via Bank Transfer",
        type: "PAYMENT_RECORDED",
      },
      {
        project: project1._id,
        title: "Milestone Completed",
        description: 'Completed "Wireframe & Information Architecture" (50% progress)',
        type: "MILESTONE_COMPLETED",
      },
      {
        project: project1._id,
        title: "Deliverable Approved",
        description: 'Deliverable "Catalog UI Component Library" marked as Approved',
        type: "DELIVERABLE_APPROVED",
      },
    ]);

    console.log("==========================================");
    console.log("✅ Demo seed completed successfully!");
    console.log("   - 3 Clients");
    console.log("   - 3 Projects");
    console.log("   - 6 Tasks / Milestones");
    console.log("   - 2 Deliverables");
    console.log("   - 3 Payment Transactions (Rs. 20,000 total cleared)");
    console.log("   - 5 Activity Events");
    console.log("==========================================");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedDatabase();
