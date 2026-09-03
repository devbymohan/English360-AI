# English360 AI — AI-Powered English Learning Platform

English360 AI is an end-to-end modern educational platform designed to help students master English across all core competencies: **Grammar**, **Vocabulary**, **Reading**, **Writing**, and **Listening**, guided by a dedicated **AI Coach**.

---

## 1. Technology Stack

### Frontend (`/client`)
- **Framework**: React 18 (Vite)
- **Language**: JavaScript (ES Modules, JSX)
- **Styling**: Tailwind CSS v3 (Custom design system tokens, soft shadows, rounded corners)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts & Visualizations**: Recharts, Custom SVGs (Waveforms, Progress rings, Donut meters)
- **HTTP Client**: Axios
- **Auth Client**: Firebase Authentication SDK (Foundation)

### Backend (`/server`)
- **Runtime**: Node.js
- **Framework**: Express.js (REST API architecture)
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gemini API SDK (`@google/genai` foundation)
- **Authentication**: Firebase Admin SDK foundation
- **Security & Middleware**: CORS, dotenv, Centralized error handling

---

## 2. Project Architecture & Folder Structure

```text
english360-ai/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/              # Static assets & graphics
│   │   ├── components/
│   │   │   ├── common/          # 19 Reusable UI components (Button, Card, Input, ProgressCircle, etc.)
│   │   │   ├── layout/          # Layout components (Sidebar, Header, MobileSidebar, AppLayout, PublicLayout)
│   │   │   ├── dashboard/       # Dashboard widgets
│   │   │   ├── grammar/         # Grammar modules
│   │   │   ├── vocabulary/      # Vocabulary tools
│   │   │   ├── reading/         # Reading comprehension
│   │   │   ├── writing/         # Essay writing & AI feedback
│   │   │   ├── listening/       # Listening player & questions
│   │   │   ├── tests/           # Smart tests catalog & results
│   │   │   ├── mistakes/        # Mistake analytics & reviews
│   │   │   ├── progress/        # Progress analytics
│   │   │   ├── achievements/    # Badges & gamification
│   │   │   └── ai-coach/        # AI Coach chat interface
│   │   ├── pages/               # 17 Page modules matching 15 UI designs
│   │   ├── layouts/             # Layout re-exports
│   │   ├── routes/              # React Router AppRoutes
│   │   ├── services/            # Axios API service layers
│   │   ├── context/             # AuthContext state management
│   │   ├── hooks/               # Custom hooks (useAuth, useToast)
│   │   ├── utils/               # Utility functions (cn, formatters)
│   │   ├── data/                # Static mock data (Design Source of Truth)
│   │   ├── App.jsx              # Main app wrapper
│   │   ├── main.jsx             # React DOM entrypoint
│   │   └── index.css            # Tailwind & font imports
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/
│   ├── config/                  # Database (Mongoose) & Firebase configuration
│   ├── controllers/             # REST controllers for all modules
│   ├── middleware/              # Authentication & Error middleware
│   ├── models/                  # 13 Mongoose Schemas
│   ├── routes/                  # Express REST routes & /api/health
│   ├── services/                # Google Gemini API service foundation
│   ├── utils/                   # Response helpers
│   ├── server.js                # Express app entrypoint
│   └── package.json
│
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore configuration
└── README.md                    # Platform documentation
```

---

## 3. Environment Variables Configuration

Copy `.env.example` to create `.env` in the root:

```bash
cp .env.example .env
```

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/english360-ai

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Authentication
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

---

## 4. How to Run the Project

### Start Backend API Server
```bash
cd server
npm install
npm run dev
```
The server will start on **http://localhost:5000**.
- **API Health Check**: `http://localhost:5000/api/health`

### Start Frontend Application
```bash
cd client
npm install
npm run dev
```
The frontend will start on **http://localhost:5173**.

---

## 5. Application Routes

| Route | Page Description | Layout |
| :--- | :--- | :--- |
| `/` | Landing Page (Hero, Features, Testimonials, CTA) | PublicLayout |
| `/login` | Login Form (Split-view with OAuth) | PublicLayout |
| `/register` | Sign Up Form with Level Selector | PublicLayout |
| `/assessment` | Initial Assessment Diagnostic Test | PublicLayout |
| `/dashboard` | Student Dashboard & Daily Learning Plan | AppLayout |
| `/grammar` | Grammar Rules & Practice | AppLayout |
| `/vocabulary` | Daily Vocabulary Explorer & Flashcards | AppLayout |
| `/reading` | Reading Comprehension & Word Lookup | AppLayout |
| `/writing` | Essay Editor & AI Evaluation Scorecard | AppLayout |
| `/listening` | Audio Conversation Player & Waveform | AppLayout |
| `/tests` | Smart Diagnostic Tests Catalog | AppLayout |
| `/test-results/:id` | Detailed Test Performance & Explanations | AppLayout |
| `/my-mistakes` | Mistake Tracking & Review Hub | AppLayout |
| `/ai-coach` | Interactive AI Coach & Study Plan | AppLayout |
| `/progress` | Comprehensive Learning Analytics | AppLayout |
| `/achievements` | Badges, Streaks, and Trophies | AppLayout |
| `/settings` | Profile, Goals & Notification Preferences | AppLayout |

---

## 6. Architecture Highlights (Phase 1)

1. **Pixel-Perfect Visual Fidelity**: Replicates all 15 reference UI designs including color tokens, typography, soft shadow cards, pill buttons, sidebars, and audio player waveforms.
2. **Zero Speaking Module**: Speaking is explicitly omitted from routes, sidebars, dashboard plans, and models in accordance with project constraints.
3. **Decoupled Mock Layer**: All visual state is isolated in `client/src/data/mockData.js`, ready to be cleanly swapped with real backend and Gemini AI endpoints in subsequent phases.
4. **Production-Ready Foundation**: Complete Mongoose schemas, REST routing architecture, error middleware, and modular Gemini service ready for implementation.
