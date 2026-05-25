# MASTER AI AGENT SKILLS SPECIFICATION (.MB)
## SYSTEM INSTRUCTION FOR ADVANCED REVERSE-ENGINEERING & CODE GENERATION

This file serves as the core intelligence and skill-set framework for the AI Agent. It defines the exact execution protocols for analyzing images, text descriptions, and live website patterns, then translating them into a highly modular Vanilla JavaScript (ES6 Modules) + PHP & MySQL architecture.

---

## SKILL 1: ADVANCED VISION-TO-CODE ENGINEERING (IMAGE ANALYSIS)
When provided with a UI screenshot, wireframe, or mockup, the Agent must execute the following cognitive pipeline:

### 1.1 Layout Grid & Breakpoint Detection
* **Action:** Scan the image vertically and horizontally to detect the master layout structure (Sidebar, Navbar, Main Content, Footer).
* **Inference:** Determine if sections utilize a CSS Grid (for uniform card layouts) or Flexbox (for aligned, directional elements).
* **Rule:** Translate visual alignments directly into Tailwind CSS utility classes (e.g., `grid-cols-1 md:grid-cols-3`, `flex items-center justify-between`).

### 1.2 Interactive Element Profiling
* **Action:** Isolate interactive items such as Buttons, Input Fields, Dropdowns, and Modals.
* **Classification:**
    * If an element appears more than twice across the layout, classify it as a **Global Component** (`src/components/` using shadcn-style HTML/JS patterns).
    * If an element is unique to a specific block, classify it as a **Section Component** scoped inside the parent page directory (`src/pages/[PageName]/[SectionName].js`).

---

## SKILL 2: TEXT-TO-ARCHITECTURE SYNTHESIS (DESCRIPTION PROCESSING)
When provided with a textual prompt or product requirement document (PRD), the Agent must synthesize the technical requirements into a decoupled Vanilla JS frontend and PHP/MySQL backend architecture:

### 2.1 Entity-Relationship & Database Modeling
* **Action:** Extract nouns from the text to identify core data models (e.g., "User", "Behavior Log", "Product").
* **MySQL Database Mapping:** Define the corresponding MySQL table schemas, specifying relationships (one-to-many, many-to-many), indexes, primary keys, and appropriate column types.
* **PHP Model Mapping:** Generate the matching PHP Model class that utilizes PDO Prepared Statements to perform CRUD operations on that table.
* **Vanilla JS State Mapping:** Formulate state management requirements in Vanilla JS (e.g., state objects, reactive UI update functions, or custom DOM event dispatchers for component communication).

### 2.2 Event & Behavior Tracking Extraction
* **Action:** Identify behavioral triggers described in text (e.g., "when a user stops scrolling on a section for 3 seconds").
* **Implementation:** Synthesize custom DOM listeners or observers in Vanilla JS (e.g. `IntersectionObserver`) to capture DOM interaction metrics before forwarding them to the PHP backend API controllers.

---

## SKILL 3: LIVE WEB REVERSE-ENGINEERING (REFERENCE PATTERNS)
When analyzing an existing reference website or URL pattern, the Agent must simulate DOM tree inspection and state architecture tracking:

### 3.1 Structural Component Splitting
* **Action:** Deconstruct the target page into separate visual file blocks following the strict **Page-Section-Component** rule.
* **Orchestration Blueprint:**
    * The main entry file (`src/pages/[PageName]/index.js`) must contain NO hardcoded HTML markup elements.
    * It must only import and layout the self-contained section modules sequentially:
        ```js
        // Example Core Orchestrator Pattern
        import Hero from './Hero.js';
        import Features from './Features.js';
        import Pricing from './Pricing.js';

        export default class HomePage {
          constructor() {
            this.app = document.getElementById('app');
          }

          render() {
            this.app.innerHTML = '';
            this.app.appendChild(Hero.render());
            this.app.appendChild(Features.render());
            this.app.appendChild(Pricing.render());
          }
        }
        ```

### 3.2 State & Side-Effect Logic Inference
* **Action:** Deduce how data moves between components based on user interaction flows.
* **Rule:** Keep logic decoupled. Any side-effect (API calls, data analytics triggers) must be isolated within dedicated helper functions in standard JS, or passed down cleanly using function callbacks or CustomEvents in the DOM.

---

## SKILL 4: EXTENSIBILITY & AUTOMATION PROXYING
The Agent must maintain zero-lock-in capabilities for external services:

### 4.1 Webhook & n8n Forwarding Logic
* **Action:** When a requirement specifies logging data to external storage (like Google Sheets), the Agent must never code the direct API integration inside the frontend.
* **Workflow Integration Rule:**
    1.  Frontend captures the state mutation/behavior metric via standard JS fetch API (`fetch()`).
    2.  Frontend posts a clean JSON payload to the PHP Controller (e.g. `POST /api/analytics`).
    3.  PHP Controller validates input variables and calls the corresponding PHP Service.
    4.  PHP Service processes the request (enriches with server IP, timestamp, user-agent) and executes a background or asynchronous cURL request to forward the payload to the external Automation Webhook (n8n/Make).

---

## SKILL 5: PROJECT KICKOFF, ASSET SOURCING & ACCESS CONTROL PROTOCOLS

### 5.1 Project Initiation & Database Schema Design
* **Action:** At the beginning of any new project, construct the MySQL database schema directly aligned with the client's domain requirements.
* **Implementation:** Write complete database schema definition scripts (e.g., `schema.sql`), ensuring tables, primary/foreign keys, datatypes, and indexation are explicitly defined.

### 5.2 Access Control & Authorization (RBAC / RPAC)
* **Action:** Implement secure access control based on the Role-Based Access Control (RBAC) / Role-Permission Access Control (RPAC) model.
* **Implementation:** Design database schemas and server logic containing Users, Roles, Permissions, and their relational mappings. Enforce permission checks within the PHP controller or routing middleware before executing actions or serving endpoints.

### 5.3 Theme-Aligned Asset Sourcing (Pexels Integration)
* **Action:** When UI pages or elements require image placeholders, source high-quality assets matching the client's theme.
* **Rule:** Search and utilize relevant imagery matching the client's business theme from pexels.com. Do not use generic or unrelated default placeholders.

### 5.4 Object-Oriented CRUD API Generation
* **Action:** When creating a new object-oriented model/entity in the codebase, automatically generate the corresponding backend API endpoints.
* **Rule:** Expose RESTful JSON API routes to ADD (Create), EDIT (Update), and DELETE (CRUD) actions as needed by the client, integrated with PDO database operations.

---

## EXECUTION MANDATE FOR THE AI AGENT
You must read this file as your foundational technical manual. For every task assigned, prioritize extreme modularity, strict file-splitting by section, clean JavaScript definitions, robust PHP OOP architecture, PDO security practices, and clean MySQL database structuring. Do not combine multiple visual sections into a single file.
