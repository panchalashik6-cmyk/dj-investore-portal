# DJ Immigration – Investor Portal

A modern, institutional-grade investor onboarding web application built with **React**, **Vite**, **JavaScript**, **React Router**, **Axios**, and **JSON Server**. 

The portal provides international immigration investors with an executive single-page workspace to track onboarding progress, complete configuration-driven Know Your Customer (K&Q) questionnaires, discover and select licensed immigration advisors, schedule mock consultations, and review a complete audit history.

> **Disclaimer & Fictional Notice:**  
> All investor profiles, advisor records, biographies, case files, and firm representations are **strictly fictional** and created for frontend evaluation, UI/UX demonstration, and REST API training. This project is not connected to any government immigration authority, production legal systems, or external calendar services.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Project Objectives](#2-project-objectives)
3. [Technology Stack](#3-technology-stack)
4. [Key Features](#4-key-features)
5. [Application Screens](#5-application-screens)
6. [Project Folder Structure](#6-project-folder-structure)
7. [Installation Instructions](#7-installation-instructions)
8. [Environment Configuration](#8-environment-configuration)
9. [How to Start React + Vite](#9-how-to-start-react--vite)
10. [How to Start JSON Server](#10-how-to-start-json-server)
11. [REST API Endpoints](#11-rest-api-endpoints)
12. [HTTP Methods Used](#12-http-methods-used)
13. [Sample API Requests](#13-sample-api-requests)
14. [Functional Testing Instructions](#14-functional-testing-instructions)
15. [Important Demo Limitations](#15-important-demo-limitations)

---

## 1. Project Overview

The **DJ Immigration Investor Portal** delivers a seamless digital onboarding experience for high-net-worth investors pursuing residency-by-investment and business immigration programs. 

The application solves key pain points of traditional legal onboarding by:
- Structuring complex immigration questionnaires into an intuitive, multi-stage application stepper.
- Dynamic rendering of form fields and conditional follow-up questions from backend configuration.
- Facilitating advisor discovery with real-time search, expertise filtering, and primary advisor assignment.
- Providing an integrated consultation scheduler with duplicate slot detection and full appointment lifecycle tracking.
- Maintaining an auditable activity history capturing all milestone events and status changes.

---

## 2. Project Objectives

- **Executive Aesthetic & User Experience:** Implement a cohesive visual system using deep navy (`#14243a`), warm champagne gold (`#c5a46d`), crisp typography (Manrope & DM Sans), subtle card elevations, and responsive layout grids.
- **Dynamic Configuration-Driven Forms:** Render form inputs dynamically based on JSON metadata with validation, draft saving, answer review, and conditional question logic.
- **Complete REST API Integration:** Demonstrate clean client-side implementation of all standard HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) against a mock REST backend.
- **Robust Error Handling & Resilience:** Gracefully handle API disconnections, provide clear retry mechanisms, accessible loading states, and contextual empty states without displaying misleading success messages on failed requests.
- **Production-Ready Frontend Code:** Write clean, modular, functional React code with custom hooks, single-responsibility components, zero build warnings, and complete keyboard accessibility.

---

## 3. Technology Stack

- **Frontend Library:** [React 18.3.1](https://react.dev/) (Functional components, Hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, `useContext`)
- **Build Tooling & Dev Server:** [Vite 6.0.5](https://vitejs.dev/) (Fast HMR, optimized production rollup build)
- **Client-Side Routing:** [React Router DOM 6.28.1](https://reactrouter.com/) (Declarative route hierarchy, nested layouts, active navigation state)
- **HTTP Client:** [Axios 1.7.9](https://axios-http.com/) (Centralized API client with response error handling)
- **Mock REST Backend:** [JSON Server 0.17.4](https://github.com/typicode/json-server) (Local zero-backend REST API running on port 5000)
- **Iconography:** [Lucide React 0.468.0](https://lucide.dev/) (Modern, consistent SVG icons)
- **Styling Architecture:** Pure CSS (CSS Variables, CSS Grid, Flexbox, responsive media queries, CSS animations)
- **Language:** JavaScript (ES6+)

---

## 4. Key Features

### 📋 Dynamic K&Q Questionnaire
- **Configuration-Driven:** Questions are fetched dynamically from the API and rendered according to their type.
- **8 Supported Field Types:** Text, Email, Dropdown Select, Date, Radio buttons, Number (USD), Checkbox groups, and Textarea.
- **Conditional Question Logic:** Sub-questions (e.g., Question `q10` explaining alternative funding sources) only appear dynamically when specific trigger conditions are met (e.g., checking `"Other"` in Question `q9`).
- **Section & Cross-Section Validation:** Real-time email syntax verification and required field validation. The `validateAll()` utility prevents submission from any section or modal if required fields are blank, automatically switching the stepper to the first errored section.
- **Progress Tracking & Persistence:** Calculates real-time completion percentages and persists draft responses to `db.json` with toast feedback.
- **Answer Review Modal:** Summarizes all investor responses before final submission.
- **Advisor Clarification & Approval Simulation:** Interactive demo controls allow simulating advisor requests for clarification (`PATCH`), resubmission workflows, approval states, and resetting to draft.

### 👔 Advisor Directory & Expert Selection
- **Multi-Vector Search:** Search advisors in real-time by **name**, **role**, or **specialty expertise tags** (e.g., "Investor Visa", "Family Relocation").
- **Specialty Filtering:** Filter advisors dynamically by unique expertise categories.
- **Profile Modal:** Detailed advisor biography, years of legal experience, and specialty tags.
- **Primary Advisor Assignment:** Persists selected advisor across the application. Disables redundant selection buttons for the currently active advisor.
- **Change Warning Notice:** Warns the user when switching advisors and alerts them if active scheduled meetings exist with their previous advisor.

### 📅 Consultation Planning & Meeting Lifecycle
- **Consultation Booking:** Select consultation purpose, future date (past dates automatically disabled), mock time slot, and optional notes.
- **Slot Conflict & Concurrency Prevention:** Checks for duplicate bookings for both the chosen advisor and the investor's schedule, preventing conflicting appointments.
- **Meeting Details Modal:** Displays appointment metadata with direct status actions.
- **Full Lifecycle Management:** Transitions meetings smoothly across statuses:
  $$\text{REQUESTED} \longrightarrow \text{CONFIRMED} \longrightarrow \text{COMPLETED} \quad \text{or} \quad \text{CANCELLED} \longrightarrow \text{DELETED}$$
- **Permanent Record Deletion:** Allows permanent removal of cancelled demo records with a dedicated confirmation modal (`DELETE`).

### 📜 Activity Audit Timeline
- Chronological timeline capturing onboarding milestones, draft saves, questionnaire submissions, advisor selections, meeting requests, and status transitions.

### 🔔 Unified Toast Feedback & Error Handling
- Contextual notification toasts with distinct styling for success (green checkmark) and errors (red alert circle with specific error text).
- Dedicated error state (`ErrorState`) with a "Try again" retry button when the mock backend is unreachable.

---

## 5. Application Screens

| Screen | Route | Description |
| :--- | :--- | :--- |
| **Overview Dashboard** | `/` | Executive snapshot of onboarding progress, quick-action cards, active advisor mini-card, next scheduled meeting, and recent activity. |
| **K&Q Questionnaire** | `/questionnaire` | 4-step stepper (Personal Info, Immigration Objectives, Investment Readiness, Source of Funds) with progress bar, review modal, and demo simulation tools. |
| **Advisor Directory** | `/advisors` | Grid of licensed advisors with real-time search, expertise filter, profile modal, and selection warning dialogs. |
| **Meetings** | `/meetings` | Consultation request form, status filter tabs, meeting cards, details modal, status progression actions, cancellation, and deletion modals. |
| **Activity Timeline** | `/activity` | Detailed chronological audit log of all account and application events. |

---

## 6. Project Folder Structure

```text
dj-immigration-investor-portal/
├── dist/                          # Production build output (generated by Vite)
├── node_modules/                  # Project dependencies
├── src/
│   ├── api/
│   │   └── client.js              # Centralized Axios REST client & error handler
│   ├── components/
│   │   ├── ActivityTimeline.jsx   # Chronological activity feed component
│   │   ├── Layout.jsx             # Shell layout (sidebar, topbar, mobile drawer, footer)
│   │   └── UI.jsx                 # Reusable UI primitives (PageTitle, Modal, Toast, StatusBadge, etc.)
│   ├── context/
│   │   └── AppContext.jsx         # Global state provider for advisors, meetings, submissions & activities
│   ├── pages/
│   │   ├── Activity.jsx           # Audit history timeline view
│   │   ├── Advisors.jsx           # Advisor network with search, filter & selection
│   │   ├── Meetings.jsx           # Consultation booking and appointment manager
│   │   ├── Overview.jsx           # Dashboard overview and onboarding summary
│   │   └── Questionnaire.jsx      # Multi-step dynamic K&Q form and advisor workflow simulator
│   ├── App.jsx                    # Route configuration and AppContext wrapper
│   ├── index.css                  # Global styles, variables, typography, and responsive media queries
│   └── main.jsx                   # React DOM root entry point
├── .gitignore                     # Git ignore rules (node_modules, dist, .env)
├── db.json                        # Mock REST API datastore for JSON Server
├── index.html                     # HTML document template
├── package.json                   # Project scripts and dependencies
├── README.md                      # Comprehensive project documentation
└── vite.config.js                 # Vite bundler configuration
```

---

## 7. Installation Instructions

### Prerequisites
- **Node.js:** Version 18.0.0 or higher
- **npm:** Version 9.0.0 or higher

### Steps
1. Open your terminal and navigate to the project directory:
   ```bash
   cd dj-immigration-investor-portal
   ```
2. Install the project dependencies:
   ```bash
   npm install
   ```

---

## 8. Environment Configuration

This project is configured out-of-the-box for local frontend development and REST API practice. 

- **Default Frontend Port:** `http://localhost:5173`
- **Default Mock REST API Port:** `http://localhost:5000`
- **Security & Privacy:** This is a zero-credential demo application. **No real passwords, API secrets, private keys, or external credentials are used, required, or stored.**

> **Notice Regarding JSON Server:**  
> JSON Server is strictly intended for local frontend development, prototyping, and REST API training. It does not provide production-grade authentication, encryption, role-based access control, or concurrent transaction locking.

---

## 9. How to Start React + Vite

In your terminal, start the Vite development server:

```bash
npm run dev
```

Once the development server starts, open your browser and navigate to:
```text
http://localhost:5173
```

---

## 10. How to Start JSON Server

Open a second terminal window in the project root directory and start the mock REST API:

```bash
npx json-server --watch db.json --port 5000
```
*(Alternatively, you can run the shorthand script: `npm run api`)*

JSON Server will watch `db.json` and serve the REST endpoints at:
```text
http://localhost:5000
```

---

## 11. REST API Endpoints

The mock REST API exposes the following endpoints through JSON Server:

| Resource | Endpoint | Description |
| :--- | :--- | :--- |
| **Questions** | `/questions` | Dynamic questionnaire configuration and field definitions |
| **Advisors** | `/advisors` | Advisor directory profiles and expertise specialties |
| **Submissions** | `/kq-submissions` | Investor K&Q questionnaire responses, progress, and review status |
| **Selections** | `/advisor-selections` | Primary advisor assignment records |
| **Meetings** | `/meetings` | Scheduled consultation requests and status tracking |
| **Activities** | `/activities` | Chronological audit trail events |

---

## 12. HTTP Methods Used

| Method | Purpose in Application | Example Operation |
| :---: | :--- | :--- |
| **`GET`** | Read data collections and individual records | Fetch questions, advisors, active meetings, and activity feed |
| **`POST`** | Create new records | Book consultation (`/meetings`), select advisor (`/advisor-selections`), add activity event (`/activities`) |
| **`PUT`** | Complete resource replacement | Save draft or submit questionnaire with complete answers array (`/kq-submissions/:id`) |
| **`PATCH`**| Partial field update | Update meeting status (`/meetings/:id`), simulate advisor clarification or approval (`/kq-submissions/:id`) |
| **`DELETE`**| Remove a resource | Permanently delete a cancelled consultation record (`/meetings/:id`) |

---

## 13. Sample API Requests

### 1. `POST /meetings` (Create Consultation)
```http
POST http://localhost:5000/meetings
Content-Type: application/json

{
  "advisorId": 2,
  "date": "2026-11-15",
  "time": "02:00 PM",
  "purpose": "Investment discussion",
  "message": "Discussing business expansion and capital readiness.",
  "status": "REQUESTED",
  "createdAt": "2026-11-03T10:00:00.000Z"
}
```

### 2. `PATCH /meetings/:id` (Confirm or Complete Meeting)
```http
PATCH http://localhost:5000/meetings/1
Content-Type: application/json

{
  "status": "CONFIRMED",
  "updatedAt": "2026-11-03T10:30:00.000Z"
}
```

### 3. `PUT /kq-submissions/:id` (Save Draft / Submit Questionnaire)
```http
PUT http://localhost:5000/kq-submissions/1
Content-Type: application/json

{
  "id": 1,
  "userId": "demo-investor-01",
  "answers": {
    "q1": "Jordan Smith",
    "q2": "jordan.smith@example.com",
    "q3": "Canada",
    "q4": "1988-06-15",
    "q5": "Permanent residency",
    "q6": "Within 3 months",
    "q7": 750000,
    "q8": "2027-01-01",
    "q9": ["Business income", "Other"],
    "q10": "Proceeds from private equity exit."
  },
  "progress": 100,
  "status": "Submitted",
  "updatedAt": "2026-11-03T11:00:00.000Z",
  "createdAt": "2026-11-03T09:00:00.000Z",
  "reviewHistory": [],
  "clarificationQuestions": []
}
```

### 4. `PATCH /kq-submissions/:id` (Simulate Advisor Clarification)
```http
PATCH http://localhost:5000/kq-submissions/1
Content-Type: application/json

{
  "status": "Clarification Required",
  "clarificationQuestions": [
    "Please provide documentary proof of funds for other assets.",
    "Verify projected investment start date."
  ],
  "updatedAt": "2026-11-03T11:15:00.000Z"
}
```

### 5. `DELETE /meetings/:id` (Delete Cancelled Meeting Record)
```http
DELETE http://localhost:5000/meetings/2
```

---

## 14. Functional Testing Instructions

Open your browser's Developer Tools (`F12`), switch to the **Network** tab (filter by `Fetch/XHR`), and perform the following testing flows:

### Test Flow A: Navigation & Mobile Responsiveness
1. Click between all 5 sidebar items: **Overview**, **K&Q Questionnaire**, **Advisors**, **Meetings**, and **Activity**.
2. Notice the active gold accent bar and chevron indicator on the selected route.
3. Resize the browser window to mobile width ($< 850\text{px}$). Verify the hamburger menu button appears, clicking it opens the slide-in drawer, and selecting any route automatically navigates and closes the drawer.

### Test Flow B: Dynamic Questionnaire & Advisor Simulation
1. Navigate to **K&Q Questionnaire** (`/questionnaire`).
2. Fill out Section 1 (Name, Email, Country, DOB). Test entering an invalid email format (e.g. `invalid-email`) and click "Next section" to verify inline validation.
3. In Section 4 (**Source of funds**), check `"Other"` to verify that conditional question `q10` renders dynamically. Uncheck `"Other"` to verify that it disappears cleanly.
4. Click "Save draft". Observe the `PUT` network request, the progress bar update, and the confirmation toast.
5. In Section 4, click "Review answers" to inspect your responses in the modal.
6. Click "Submit questionnaire". Notice that the modal closes automatically, the status updates to `"Submitted"`, and fields are locked.
7. Locate the **Demo Advisor Controls** bar at the top of the questionnaire:
   - Click **"Request clarification"**: Notice the `PATCH` request sent to port 5000. The banner turns gold, lists clarification bullet points, and displays the "Resubmit questionnaire" button.
   - Click **"Resubmit questionnaire"**: Status updates back to `"Submitted"`.
   - Click **"Approve questionnaire"**: Status transitions to `"Approved"`.
   - Click **"Reset to draft"**: Unlocks the questionnaire back to draft status for repeated testing.

### Test Flow C: Advisor Search, Filtering & Selection Warning
1. Navigate to **Advisors** (`/advisors`).
2. In the search bar, type `Investor Visa`. Notice advisors filter instantly by their expertise tags as well as by name or role.
3. Test the expertise dropdown filter.
4. Click "View profile" on an advisor to open the profile modal.
5. Click "Select advisor". Notice the `POST /advisor-selections` request and the confirmation toast. The chosen advisor's card now displays a disabled `"Selected"` button.
6. Attempt to select a different advisor: verify that the confirmation dialog explicitly shows the change warning (`Changing from [Current] to [New]`) and alerts you if active meetings exist.

### Test Flow D: Consultation Scheduling & Duplicate Slot Prevention
1. Navigate to **Meetings** (`/meetings`).
2. Attempt to book a meeting for the same date and time slot as an existing appointment. Verify that the system flags the collision and prevents the duplicate request.
3. Book a new consultation with a unique future date and mock time slot. Observe the `POST /meetings` request and confirmation toast.
4. Click the eye icon on the meeting card to open the **Meeting Details** modal.
5. Click **"Mock confirm"**: Watch the status change to `CONFIRMED` via `PATCH`.
6. Click **"Mark completed"**: Watch the status change to `COMPLETED` via `PATCH`.
7. Book another meeting and click the red cancel button: confirm cancellation in the modal to mark it `CANCELLED`.
8. On the cancelled meeting card, click the trash icon: confirm deletion in the modal to verify the permanent `DELETE /meetings/:id` request.

### Test Flow E: Error Handling & Retry Mechanism
1. Stop JSON Server in terminal 2 (`Ctrl + C`).
2. Refresh or navigate to any page in the portal.
3. Verify that the portal renders the friendly `ErrorState` component informing you that JSON Server is offline on port 5000.
4. Restart JSON Server: `npx json-server --watch db.json --port 5000`.
5. Click the **"Try again"** button. Verify that the application recovers immediately without needing a full page refresh.

---

## 15. Important Demo Limitations

1. **Fictional Data Only:** All investors, advisors, credentials, and scenarios are strictly fictional.
2. **Local Mock REST API:** JSON Server stores data directly in a local `db.json` file. It does not enforce schema constraints, relational integrity, or real authentication.
3. **Concurrency Simulation:** Duplicate slot validation checks against local in-memory records. Production deployment requires transactional database locking and server-side availability schedules.
4. **No External Integrations:** The scheduler does not sync with Microsoft Outlook, Google Calendar, or Zoom.
5. **Security Hygiene:** This practice repository contains zero real secrets, passwords, private tokens, or proprietary client data.

---

## 📄 License & Attribution
Created for educational and training purposes for **DJ Immigration** investor onboarding frontend evaluation. Designed and built with modern React and clean code practices.
