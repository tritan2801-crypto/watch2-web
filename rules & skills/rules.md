# SYSTEM SPECIFICATION & CODING BLUEPRINT FOR AI AGENTS

## 1. CORE SYSTEM OVERVIEW & TECH STACK
You are an expert full-stack developer. You must strictly adhere to the following technology stack and architectural rules for all upcoming development tasks. No exceptions are allowed unless explicitly instructed.

* **Frontend Ecosystem:** HTML5, CSS3, Vanilla JavaScript (ES6 Modules), Tailwind CSS, shadcn-style component designs.
* **Backend Ecosystem:** PHP (OOP / MVC or Controller-Service-Model architecture), RESTful API, MySQL.
* **Programming Languages:** HTML/CSS and JavaScript (JS) for frontend development, PHP for backend server-side operations, and standard SQL for relational database interactions.

---

## 2. SKILLS: PATTERN ANALYSIS & RECONSTRUCTION PROTOCOL
When given an input (sample image, text description, or reference website URL), you must follow this 3-step reverse-engineering process before writing code:

1.  **Layout Deconstruction:** Identify the overall page structure. Break the layout down into a hierarchical tree: `Page (Container) -> Sections (Visual Blocks) -> Components (Re-usable Elements)`.
2.  **Design System Extraction:** Extract design tokens from the sample. Define:
    * *Colors:* Primary, Secondary, Background, Accent colors (Tailwind classes).
    * *Typography:* Font family, font sizes for headings (H1-H4) and body text.
    * *Spacing:* Global padding and margin rules to maintain visual consistency.
3.  **Data Flow Mapping:** Identify which sections require dynamic data from the PHP backend and which sections are purely static.

---

## 3. RULES: FRONTEND ARCHITECTURE (VANILLA JAVASCRIPT & ES6 MODULES)
You must implement a **Component-Driven Architecture** based on strict file splitting rules using standard Vanilla JavaScript and ES6 modules.

* **Rule 3.1: Page-Level Directories:** Every web page must be represented by a folder under `src/pages/`. The main script and entry point must be named `index.js`.
* **Rule 3.2: The "Conductor" Pattern:** The `index.js` file acts strictly as an orchestrator. It must ONLY handle page-level states, event bindings, API fetch requests, and mounting components into the DOM. It **must not** contain inline HTML markup for individual content sections.
* **Rule 3.3: Section-Level Splitting:** Every distinct visual block of a page (e.g., Hero, Features, Pricing) must be written as a standalone JS module (e.g., `Hero.js`, `Features.js`) exporting standard DOM element templates, initialization code, and scoped event listeners.
* **Rule 3.4: Global Components:** Re-usable atomic elements (Buttons, Modals, Inputs, Navbar using shadcn-style styling and behaviors) must reside in `src/components/` as importable JS modules.

### Mandatory Frontend Folder Structure:
```text
frontend/src/
├── components/             # Re-usable global elements
│   ├── ui/                 # Shadcn-style vanilla components (Tailwind classes + JS behavior)
│   │   ├── button.js
│   │   └── dialog.js
│   ├── BaseButton.js
│   └── MainNavbar.js
└── pages/                  # Page-level directories
    └── Home/
        ├── index.js        # Page Orchestrator (Imports sections, fetches data, mounts DOM)
        ├── Hero.js         # Section 1: Hero Banner (Exports render() function/DOM node)
        ├── Features.js     # Section 2: Features Grid
        └── Pricing.js      # Section 3: Pricing Table
```

---

## 4. RULES: BACKEND ARCHITECTURE (PHP & MYSQL)
You must follow a clean **OOP MVC/Controller-Service-Model Architecture** to ensure absolute decoupling, modularity, security, and scalability.

* **Rule 4.1: Clean Decoupling of Concerns:**
    * **Controllers:** Handle HTTP request input parsing, session validation, input sanitization, and output JSON responses.
    * **Services:** Contain the business logic layer, calculate values, orchestrate external APIs, and execute checks.
    * **Models / DAOs:** Manage direct database access and execution of queries.
* **Rule 4.2: Strict Security & PDO for MySQL:**
    * You **must** use PHP PDO (PHP Data Objects) for all MySQL database queries.
    * You **must** use Prepared Statements with bound parameters (`bindValue` or `bindParam`) to prevent SQL Injection. Hardcoded variables in queries are strictly forbidden.
    * Sanitize and validate all incoming inputs using filter functions (e.g., `filter_input()`, `filter_var()`).
* **Rule 4.3: Standardized API Responses:**
    * All API endpoints must set HTTP headers to `Content-Type: application/json`.
    * Return standardized structures: `{ "success": true, "data": ... }` or `{ "success": false, "error": "Message" }`.

### Mandatory Backend Folder Structure:
```text
backend/
├── config/
│   └── Database.php        # PDO Database connection class (Singleton pattern)
├── public/
│   └── index.php           # API Router & Entry point (Handles CORS, Routing)
└── src/
    ├── Controllers/        # Request handling and JSON output
    │   └── AnalyticsController.php
    ├── Services/           # Core business logic
    │   └── AnalyticsService.php
    └── Models/             # Database access classes (Queries using PDO statements)
        └── BehaviorLog.php
```

---

## 5. RULES: EXTENSIBILITY & INTEGRATION LAYER

* **Rule 5.1: Zero-Conflict Styling:** You must use **Tailwind CSS** utility classes directly inside HTML and JS template strings. Avoid writing external scoped CSS files or custom global stylesheets that could break component portability. Use shadcn-style patterns for styling structures.
* **Rule 5.2: External Automation (n8n / Webhooks):** When integrating with workflow automation tools (like n8n or Google Sheets), the PHP Backend Service must act as a proxy.
    * *Data flow:* Frontend Client (`fetch`) -> PHP Controller -> PHP Service (Validates & transforms data) -> Forward payload to n8n Webhook URL using PHP `curl` functions or a lightweight HTTP library.
* **Rule 5.3: Future Microservice & Database Portability:** Ensure tables are properly normalized and reference constraints are correctly defined in MySQL. Keep domain tables independent to allow splitting them out into separate database instances or services if needed in the future.

---

## 6. EXECUTION DIRECTIVE
When I ask you to build or replicate a feature:
1.  Acknowledge these rules.
2.  Output your visual analysis breakdown first.
3.  Generate code by strictly following the directory and structural templates provided above. Write clean, modular, and well-commented JS and PHP code.
