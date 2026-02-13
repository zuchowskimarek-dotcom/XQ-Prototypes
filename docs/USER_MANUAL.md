# XQ-Prototypes — User Manual & Feature Guide

> **XQ Policy Dashboard** — A visual editor for designing, validating, and exporting WES decision contracts.

**Version:** 1.1.0  
**Last Updated:** 2026-02-09

---

## Table of Contents

1. [Overview](#1-overview)
2. [Getting Started](#2-getting-started)
3. [Core Concepts](#3-core-concepts)
4. [Pages & Features](#4-pages--features)
   - [Domain List](#41-domain-list)
   - [Domain Overview](#42-domain-overview)
   - [Scope Editor](#43-scope-editor)
   - [Rule Editor Drawer](#44-rule-editor-drawer)
   - [Schema Editor](#45-schema-editor)
   - [Manifest Viewer](#46-manifest-viewer)
   - [Bulk Manifest Viewer](#47-bulk-manifest-viewer)
5. [Export Features](#5-export-features)
   - [JSON Manifest Export](#51-json-manifest-export)
   - [C# Code Export](#52-c-code-export)
   - [NuGet Package Build](#53-nuget-package-build)
6. [API Reference](#6-api-reference)
7. [Data Model](#7-data-model)
8. [Deployment](#8-deployment)

---

## 1. Overview

The **XQ Policy Dashboard** (XyronQ Prototypes) is a full-stack web application for designing, managing, and exporting **WES decision contracts**. It allows logistics architects and engineers to:

- **Define** decision domains, scopes, and rules through a visual editor
- **Configure** strategies, policies, and parameters per contextual rule
- **Validate** configurations against a JSON schema in real-time
- **Export** validated policy manifests as JSON or compilable C# contract packages
- **Generate** NuGet-ready .NET packages for downstream WMS integration

The application follows a **metadata-first** approach: decisions are defined as structured data in XyronQ, then exported as typed contracts that WMS implements.

---

## 2. Getting Started

### Prerequisites

| Component | Required Version |
|---|---|
| Node.js | 20+ |
| PostgreSQL | 15+ |
| .NET SDK (for NuGet builds) | 9.0+ |

### Local Setup

```bash
# Clone the repository
git clone https://github.com/zuchowskimarek-dotcom/XQ-Prototypes.git
cd XQ-Prototypes

# Backend setup
cd backend
cp .env.example .env
# Edit .env to set DATABASE_URL
npm install
npx prisma migrate deploy
npx prisma db seed
npm start

# Frontend setup (in a separate terminal)
cd frontend
npm install
npm run dev
```

### Accessing the Dashboard

Once both services are running:

- **Frontend:** `http://localhost:5173` (local Vite dev server)
- **Backend API:** `http://localhost:3005`
- **Production:** Your Railway deployment URL

---

## 3. Core Concepts

The dashboard models decisions using a **4-level hierarchy**:

```
DecisionDomain          → Versioned governance boundary (e.g. "Storage.Slotting")
  └─ DecisionScope      → Semantic decision name (e.g. "Decide.Storage.Location")
       └─ PolicyRule     → Contextual rule with filter + specificity
            ├─ Strategy  → Decision logic (exactly one per rule)
            ├─ Policy[]  → Constraints/permissions (zero or more)
            └─ RuleParameter[] → Static config values
```

### Key Terms

| Term | Description |
|---|---|
| **Domain** | Top-level grouping (e.g., Storage.Slotting, Failure.Resolution). Contains all scopes for a decision area. |
| **Scope** | A specific decision point (e.g., "Decide.Storage.Location"). Contains one or more rules. |
| **Rule** | A context-specific combination of strategy + policies. Matched at runtime by context filter specificity. |
| **Strategy** | The decision algorithm (e.g., WeightedScore, FIFO, NearestEmpty). Exactly one per rule. |
| **Policy** | A constraint applied before/during strategy execution (e.g., WeightLimit, ZoneEligibility). Zero or more per rule. |
| **Context Filter** | Key-value pairs (e.g., `plantArea=A1`, `zone=COLD`) that determine when a rule applies. |
| **Specificity Score** | Number of filter keys — higher = more specific. The most specific matching rule wins at runtime. |
| **Manifest** | The compiled JSON representation of a domain's complete configuration, validated against the schema. |

---

## 4. Pages & Features

### 4.1 Domain List

**Route:** `/`

The landing page showing all decision domains as a card grid.

**Features:**
- **Domain Cards** — Each card shows domain name, description, scope count, rule count, version, and health status (✅ / ⚠️)
- **Health Indicators** — ✅ green checkmark when all rules are valid; ⚠️ yellow warning with issue tags when problems are detected
- **Create Domain** — Click **+ New Domain** to open a modal for creating a new domain (name, description, version)
- **Edit Domain** — Click the pencil icon on any card to edit its name, description, or version
- **Delete Domain** — Click the trash icon to delete a domain and all its scopes/rules (with confirmation)
- **Export All** — Download all domain manifests as a single validated JSON file
- **Export All C#** — Generate and download a complete C# contract package (.zip) for all domains via native Save As dialog
- **Navigate** — Click any domain card to open its overview

### 4.2 Domain Overview

**Route:** `/domains/:domainId`

Detailed view of a single domain, showing all its decision scopes.

**Features:**
- **Scope Cards** — Each scope shows its name, description, rule count, and health status
- **Create Scope** — Click **+ New Scope** to add a decision scope (e.g., `Decide.Storage.Location`)
- **Delete Scope** — Remove a scope and all its rules
- **Export Manifest** — Export this domain's manifest as validated JSON
- **Export C#** — Generate C# contracts for this domain only, with native Save As dialog
- **Back Link** — Navigate back to the domain list

### 4.3 Scope Editor

**Route:** `/domains/:domainId/scopes/:scopeId`

The main editing interface for configuring rules within a decision scope.

**Features:**
- **Rule Table** — Displays all rules in a tabular format showing:
  - Context filter (presented as readable tags, e.g., `plantArea=A1 · zone=COLD`)
  - Specificity score
  - Assigned strategy name
  - Policy count
  - System parameter count
- **Add Rule** — Creates a new empty rule (global match by default)
- **Edit Rule** — Click any rule row to open the Rule Editor Drawer for detailed editing
- **Delete Rule** — Remove a specific rule with confirmation
- **Navigation** — Breadcrumb back to domain overview

### 4.4 Rule Editor Drawer

**Component:** `RuleEditorDrawer` (slide-out panel from the right)

The detailed editor for a single policy rule. Opened from the Scope Editor when clicking a rule.

**Sections:**

#### Context Filter
- Edit key-value pairs that define when this rule applies
- Each pair is a filter dimension (e.g., `plantArea: A1`, `zone: COLD`)
- The specificity score is auto-calculated from the number of filter keys

#### Strategy
- Select and configure the strategy for this rule
- Each rule must have **exactly one** strategy
- Edit strategy name, description, and typed parameters
- Parameters support types: `string`, `int`, `decimal`, `bool`, `enum`

#### Policies
- Add, edit, or remove policies (constraints) on this rule
- Each policy has a name, description, and typed parameters
- Multiple policies can be stacked on a single rule

#### System Parameters
- Define rule-level static configuration values
- Each parameter has: ID, type, description, and value
- Used for runtime configuration that doesn't change per execution

#### Inline Editing
- Strategy names, policy names, and parameter details can be edited inline by clicking on them
- Changes are auto-saved on blur or Enter key

### 4.5 Schema Editor

**Route:** `/schema`

A Monaco-powered JSON editor for viewing and editing the policy manifest validation schema.

**Features:**
- **Full Monaco Editor** — Syntax highlighting, bracket matching, minimap, inline validation
- **Dark Theme** — VS Code–style dark editor theme
- **Save** — Validates JSON syntax before saving; shows ✅ / ❌ feedback
- **Reset to Factory** — Two-step confirmation to restore the built-in default schema
- **Import** — Load a schema from a local `.json` file
- **Export** — Download the current schema as `policyManifestSchema.json`
- **Dirty Indicator** — Visual dot when unsaved changes exist
- **Badge** — Shows "Factory Default" or "Custom" to indicate schema origin

### 4.6 Manifest Viewer

**Route:** `/domains/:domainId/manifest`

Read-only viewer showing the compiled policy manifest for a single domain, validated against the schema.

**Features:**
- **Monaco Viewer** — Read-only JSON display with syntax highlighting
- **Validation Status** — ✅ Valid or ❌ N errors badge in the toolbar
- **Error Details** — Expandable/collapsible list of schema validation errors with JSON paths
- **Download JSON** — Download the manifest as `{DomainName}_manifest_v{version}.json`
- **Version Badge** — Shows the domain version

### 4.7 Bulk Manifest Viewer

**Route:** `/manifests/all`

Aggregated view of all domain manifests in a single JSON document.

**Features:**
- **All Domains Combined** — Shows manifests for every domain in one view
- **Aggregate Validation** — "All Valid" ✅ or total error count across all domains
- **Per-Domain Error Grouping** — Errors are grouped by domain name in the error list
- **Save As** — Native Save As dialog (File System Access API) with fallback for unsupported browsers
- **Domain Count** — Badge showing number of included domains
- **Toast Notifications** — Feedback on save success

---

## 5. Export Features

### 5.1 JSON Manifest Export

Export the compiled policy metadata as validated JSON. Available at:

- **Per Domain** — Domain Overview → **Export Manifest**
- **All Domains** — Domain List → **Export All** or the Bulk Manifest Viewer

The manifest structure includes:
```json
{
  "decisionDomain": "Storage.Slotting",
  "version": "1.0.0",
  "scopes": [
    {
      "name": "Decide.Storage.Location",
      "rules": [
        {
          "contextFilter": { "plantArea": "A1" },
          "specificityScore": 1,
          "strategy": { "name": "WeightedScore", "parameters": { ... } },
          "policies": [ ... ],
          "ruleParameters": [ ... ]
        }
      ]
    }
  ]
}
```

### 5.2 C# Code Export

Generate typed .NET contracts from the decision metadata. The export produces a `.zip` file containing:

```
LogisQ.Contracts.Decisions/
├── LogisQ.Contracts.Decisions.csproj   ← NuGet-ready project file
├── Directory.Build.props               ← C2 enforcement (TreatWarningsAsErrors)
├── README.md                           ← Auto-generated usage guide
├── StorageSlotting/
│   ├── IStorageSlottingDecision.cs      ← Domain façade interface
│   ├── StorageSlottingFilterShapes.cs   ← Context filter descriptors
│   ├── IStrategyWeightedScoreStrategy.cs
│   ├── StrategyWeightedScoreParameters.cs
│   ├── StrategyWeightedScoreParameterSchema.cs
│   ├── IPolicyWeightLimitPolicy.cs
│   ├── PolicyWeightLimitParameters.cs
│   ├── PolicyWeightLimitParameterSchema.cs
│   └── _Generated.g.cs                 ← Assembly-level metadata
├── FailureResolution/
│   └── ...
└── ...
```

**Generated per entity:**

| File Pattern | Description |
|---|---|
| `I{Domain}Decision.cs` | Façade interface with one method per scope |
| `{Domain}FilterShapes.cs` | Static filter shape descriptors for specificity matching |
| `I{Strategy}Strategy.cs` | Strategy interface extending `IStrategy` |
| `{Strategy}Parameters.cs` | Sealed record with typed parameters |
| `{Strategy}ParameterSchema.cs` | Static `ParameterSpec[]` descriptor |
| `I{Policy}Policy.cs` | Policy interface extending `IPolicy` |
| `{Policy}Parameters.cs` | Sealed record with typed parameters |
| `{Policy}ParameterSchema.cs` | Static `ParameterSpec[]` descriptor |
| `_Generated.g.cs` | Assembly-level metadata (generation timestamp, source hash) |

**Available at:**
- **Per Domain** — Domain Overview → **Export C#**
- **All Domains** — Domain List → **Export All C#**

### 5.3 NuGet Package Build

To build the exported contracts into a NuGet package:

```bash
# 1. Export the .zip from the dashboard and unzip
# 2. Place next to LogisQ.Contracts.Core (included in the repo)

contracts/
├── LogisQ.Contracts.Core/        ← Base types (IStrategy, IPolicy, etc.)
└── LogisQ.Contracts.Decisions/   ← Generated contracts

# 3. Build
cd contracts/LogisQ.Contracts.Core
dotnet build -c Release

cd contracts/LogisQ.Contracts.Decisions
dotnet build -c Release

# 4. NuGet package is at:
# contracts/LogisQ.Contracts.Decisions/bin/Release/LogisQ.Contracts.Decisions.1.0.0.nupkg
```

### Hash Validation Endpoint

The `GET /api/export/csharp/hash` endpoint provides per-domain SHA-256 hashes for drift detection:

```json
{
  "hashes": {
    "Storage.Slotting": { "hash": "8aa763ff...", "version": "1.0.0" },
    "Failure.Resolution": { "hash": "81936cc7...", "version": "1.0.0" }
  },
  "generatedAt": "2026-02-09T..."
}
```

WMS can compare these hashes at startup to detect if its installed contracts differ from the source metadata.

---

## 6. API Reference

### Domains

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/domains` | List all domains with scope/rule counts and health status |
| `GET` | `/api/domains/:id` | Get domain detail with scopes |
| `POST` | `/api/domains` | Create a new domain |
| `PUT` | `/api/domains/:id` | Update domain |
| `DELETE` | `/api/domains/:id` | Delete domain (cascades to scopes, rules) |

### Scopes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/scopes` | Create a scope within a domain |
| `GET` | `/api/scopes/:id` | Get scope with rules |
| `DELETE` | `/api/scopes/:id` | Delete scope (cascades to rules) |

### Rules

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/rules` | Create a rule within a scope |
| `GET` | `/api/rules/:id` | Get rule with strategy, policies, parameters |
| `PUT` | `/api/rules/:id` | Update rule (context filter, strategy, policies, params) |
| `DELETE` | `/api/rules/:id` | Delete rule |

### Manifests

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/domains/:id/manifest` | Generate and validate manifest for a domain |
| `GET` | `/api/manifest/all` | Generate all domain manifests with validation |

### Schema

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/schema` | Get current validation schema |
| `PUT` | `/api/schema` | Update validation schema |
| `DELETE` | `/api/schema` | Reset to factory default schema |

### Export

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/export/csharp` | Download C# contracts for all domains (.zip) |
| `GET` | `/api/export/csharp/:domainId` | Download C# contracts for one domain (.zip) |
| `GET` | `/api/export/csharp/hash` | Get per-domain SHA-256 hashes for drift detection |

---

## 7. Data Model

```
DecisionDomain (1)
 │  id, name, description, version
 │
 ├──► DecisionScope (*)
 │     id, name, description
 │
 │     ├──► PolicyRule (*)
 │     │     id, contextFilter (JSON), specificityScore
 │     │
 │     │     ├──► StrategyDefinition (0..1)
 │     │     │     id, name, description, parameters (JSON)
 │     │     │
 │     │     ├──► PolicyDefinition (*)
 │     │     │     id, name, description, parameters (JSON)
 │     │     │
 │     │     └──► RuleParameter (*)
 │     │           id, paramId, type, description, value
```

**Cascade Rules:** Deleting a domain cascades through scopes → rules → strategies/policies/parameters.

---

## 8. Deployment

### Railway (Production)

The application is deployed on Railway with automatic deploys from `main` branch.

| Service | Details |
|---|---|
| **Runtime** | Node.js (tsx) |
| **Database** | PostgreSQL (Railway-managed) |
| **Start Command** | `npx tsx src/index.ts` |
| **Port** | Auto-injected by Railway via `$PORT` |

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `PORT` | Server port (auto-set by Railway) | Auto |

### Docker

A `Dockerfile` is included for containerized deployments:

```bash
docker build -t xq-prototypes .
docker run -p 3005:3005 -e DATABASE_URL="postgresql://..." xq-prototypes
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, MUI Icons, Monaco Editor |
| **Backend** | Express 5, TypeScript, tsx, Prisma ORM |
| **Database** | PostgreSQL |
| **Code Generation** | Custom TypeScript templates → C# (.NET 9) |
| **Package Format** | NuGet (.nupkg) |
| **CI/CD** | Railway (deploy), GitLab CI (contracts pipeline) |
| **Export** | JSZip, File System Access API |
