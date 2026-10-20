# Food Packing Solutions AI — Intelligent Food Packaging Recommendation System

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![SQLite / Postgres](https://img.shields.io/badge/Database-SQLAlchemy%20ORM-CC292B.svg?style=flat&logo=sqlite)](https://www.sqlalchemy.org/)
[![Testing](https://img.shields.io/badge/Tests-Pytest%20Passing-success.svg)](https://pytest.org)

An intelligent, explainable decision-support and educational web platform that helps food scientists, manufacturers, small food businesses, and students discover compliant, scientifically sound packaging methods for food products.

---

## 1. Executive Summary & Objective

Modern food preservation requires balancing gas barriers, moisture control, chemical migration limits, shelf-life demands, cold chain logistics, unit economics, and circular recyclability. 

**Food Packing Solutions AI** bridges food science, polymer engineering, and regulatory standards. It features:
- **Safety-First Rule-Based Engine**: Prioritizes food-contact compliance and mandatory microbiological safety prerequisites (e.g. *C. botulinum*, moisture limits, acid corrosion) *before* calculating economics or sustainability.
- **Natural-Language Understanding**: Parses queries such as *"I want to pack 250 g of coffee powder. It should retain its aroma, remain protected from moisture and oxygen, and be affordable."*
- **103 Extensible Food Varieties**: Seeded directly from `food_packing_ai_dataset.xlsx` across prepared meals, produce, beverages, snacks, spices, dairy, bakery, meat, and seafood.
- **16 Core Packaging Methods**: Detailed engineering specifications distinguishing processes (e.g., MAP, Retort, Aseptic, Vacuum Skin) from substrate materials (e.g., Glass, PET, PP, EVOH, Aluminium foil).
- **9 Food Degradation Vectors**: Educational guide explaining the physics and microbiology of moisture migration, oxidation, light bleaching, staling, and pest ingress.
- **Side-by-Side Comparison Engine**: Compare 2 to 4 packaging systems across barriers, costs, equipment, and circularity.
- **Admin Governance Portal**: Secure area for dataset imports, record management, and testing audits.

---

## 2. Dataset Inspection & Structure

The platform ingests and preserves all five sheets from the starter dataset `food_packing_ai_dataset.xlsx`:

| Sheet Name | Dimensions | Description |
| :--- | :--- | :--- |
| **Food Varieties** | 103 rows × 12 cols | Seed database of foods, moisture levels, oxygen sensitivities, spoilage risks, packaging requirements, and candidate packages. |
| **Packaging Materials** | 20 rows × 10 cols | Substrate and format references (M001–M020) detailing moisture, oxygen, and light barriers, recyclability notes, and design validations. |
| **AI Mapping** | 103 rows × 13 cols | Expert-style seed mappings connecting product sensitivities to candidate packaging with validation priorities and targets. |
| **AI Tasks** | 8 rows × 5 cols | Definition of AI tasks (category classification, packaging recommendation, requirement extraction, shelf-life prediction). |
| **Read Me** | 6 rows × 2 cols | Dataset scope, educational disclosures, and food safety notices. |

---

## 3. Technology Stack

- **Frontend**:
  - React 18 with Vite and TypeScript
  - Tailwind CSS for modern responsive styling (with full dark/light theme support)
  - Lucide React for consistent icons
  - Recharts for comparative barrier & sustainability charts
  - Axios for HTTP communication with backend API
- **Backend**:
  - Python 3.12 with FastAPI
  - Pydantic v2 for data validation and schema serialization
  - SQLAlchemy 2.0 ORM with 15 relational models
  - SQLite for local development (`food_packing.db`) and PostgreSQL-ready configuration
  - OpenPyXL & Pandas for Excel dataset ingestion
  - PyJWT & Bcrypt for administrative role-based access control
  - Pytest with TestClient for automated unit and integration tests

---

## 4. Platform Architecture & Pages

```
food-packing-solutions-ai/
├── frontend/                     # React 18 + Vite + TypeScript application
│   ├── src/
│   │   ├── components/           # Navbar, Footer, UI components
│   │   ├── pages/                # Home, FoodSearch, Library, Recommendation, Protection, Comparison, Admin
│   │   ├── services/             # Axios API client & modular endpoints
│   │   ├── types/                # Complete TypeScript domain interfaces
│   │   ├── App.tsx               # App routing and cross-page state coordination
│   │   └── main.tsx              # DOM root bootstrap
│   ├── package.json
│   └── vite.config.ts
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── api/                  # Modular REST routers (auth, foods, packaging, recommendations, guides, admin)
│   │   ├── core/                 # Settings (pydantic-settings), JWT & bcrypt security
│   │   ├── database/             # SQLAlchemy engine, session maker, dataset importer
│   │   ├── models/               # 15 Relational database models
│   │   ├── schemas/              # Pydantic schemas and DTOs
│   │   ├── recommendation/       # NLP parser, safety gates, multi-attribute scoring engine
│   │   ├── services/             # Educational guide service, packaging services
│   │   └── main.py               # FastAPI entrypoint, CORS, startup seeding
│   ├── tests/                    # Pytest test suite (all tests passing)
│   ├── data/                     # Seed dataset: food_packing_ai_dataset.xlsx
│   ├── requirements.txt          # Python dependencies
│   └── .env.example              # Environment variables template
├── data/                         # Root dataset archive
├── docs/                         # Architecture, schema, and methodology documents
│   ├── database-schema.md
│   ├── recommendation-methodology.md
│   └── data-sources.md
├── docker-compose.yml            # Multi-container orchestration
└── README.md
```

### The 7 Core Modules
1. **Home Page (`/`)**: Hero section, live search bar with autocomplete suggestions, popular category cards, packaging method highlights, an interactive 4-step explainable AI timeline, and call-to-action triggers.
2. **Food Search & Discovery (`/foods`)**: Filterable catalogue across physical state, storage temperature, moisture level, oxygen sensitivity, and spoilage risk. Includes modal viewing for technical specs, storage guidance, and candidate packaging.
3. **Packaging Methods Library (`/library`)**: Comprehensive guide across all 16 methods (flexible, rigid, paper, metal, glass, vacuum, MAP, active, intelligent, aseptic, retort, VSP, shrink/stretch, edible coatings, cold chain insulated, compostables/reusables).
4. **AI Packaging Recommendation Assistant (`/recommendation`)**: Dual-mode engine supporting free-form natural language queries or a structured 4-step engineering wizard. Displays safety gate verification, suitability scores, why-candidate rationale, trade-offs, and ASTM/ISO testing requirements.
5. **Food Protection Guide (`/protection`)**: Educational module detailing the 9 degradation vectors (moisture, oxygen, light, microbes, physical, leakage, aroma scalping, temperature abuse, pests) with counteracting barrier properties.
6. **Packaging Comparison Matrix (`/comparison`)**: Side-by-side comparison of 2 to 4 candidate packages with matrix tables and Recharts visual graphs.
7. **Admin Portal (`/admin`)**: Secure governance portal for statistics, adding new foods, importing Excel datasets, and auditing validation statuses.

---

## 5. Quickstart & Installation Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Node.js 18+ (tested on Node.js 24)
- Git (optional)

### Step 1: Clone or Navigate to Project
```bash
cd food-packing-solutions-ai
```

### Step 2: Set Up and Run the Backend
```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Seed database from the Excel dataset
python -m app.database.import_dataset

# Start FastAPI development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### Step 3: Set Up and Run the Frontend
In a new terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
- Open browser at: `http://localhost:5173`

---

## 6. Running with Docker Compose

To run both frontend and backend in isolated production containers:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 7. Running Automated Tests

Run backend unit and integration tests:
```bash
cd backend
python -m pytest
```
Output:
```
tests/test_api.py .....                                 [ 71%]
tests/test_recommendation.py ..                         [100%]
======================= 7 passed in 3.67s ========================
```

Run frontend production bundle validation:
```bash
cd frontend
npm run build
```
Output:
```
✓ 2272 modules transformed.
✓ built in 10.35s
```

---

## 8. Default Admin Credentials

- **Email**: `admin@foodpackai.com`
- **Password**: `admin_secure_password_2026`

---

## 9. Regulatory and Safety Notice

> **IMPORTANT DISCLAIMER**: The packaging options, suitability scores, and barrier rankings generated by Food Packing Solutions AI are decision-support recommendations derived from rule-based packaging science models and seed datasets. They **do not constitute legal certifications or guaranteed shelf lives**.
>
> Commercial food packaging implementation strictly requires:
> 1. Certified Overall and Specific Migration Testing (EN 1186, Regulation EU 10/2011, FDA 21 CFR Parts 170-199).
> 2. Permeation validation (ASTM F1249 WVTR, ASTM D3985 OTR).
> 3. Heat seal integrity and burst testing (ASTM F88, ASTM F2096).
> 4. Formal HACCP microbiological risk qualification.
