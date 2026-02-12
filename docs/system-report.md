# Smart Avenue System Report

This report provides a comprehensive overview of the **Smart Avenue** platform's structure, technology stack, services, and tools.

## ☁️ Media Management: Cloudinary
**Is Cloudinary in the codebase?** Yes.

Cloudinary is integrated as the primary service for handling media uploads (images and videos).
- **Implementation**: Managed via server actions in `src/app/cloudinary-actions.ts`.
- **UI Component**: A reusable `CloudinaryUpload.tsx` component handles client-side file selection, base64 conversion, and upload feedback.
- **Status**: **Not Functional** (Missing credentials). While the integration is complete, the required environment variables (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) are missing from `.env.local`.

---

## 🛠️ Core Technology Stack

### 💻 Programming Languages & Frameworks
| Category | Technology | Version / Notes |
| :--- | :--- | :--- |
| **Language** | **TypeScript** | Primary language for type safety across the stack. |
| **Framework** | **Next.js 15** | Using the **App Router** for modern React features and Server Actions. |
| **UI Library** | **React 19** | The latest version of React for building interactive components. |
| **Styling** | **Tailwind CSS 4** | Utility-first CSS framework for rapid and modern UI development. |

### 🗄️ Database & ORM
- **Database**: **PostgreSQL** (Active connection via `DATABASE_URL`).
- **ORM**: **Prisma**.
- **Data Models**:
  - `Product`: Core product data (pricing, categories, images).
  - `Category`: Hierarchical category system (parent/child relationships).
  - `Offer`: Promotional offers linked to products.
  - `Review`: User-generated ratings and comments.
  - `GalleryImage`: Specialized model for managing gallery assets.

### 🔐 Backend & Services
- **Authentication**: **Firebase Auth** (Client and Admin SDKs).
- **Backend Services**:
  - **Firebase Admin SDK**: Used for secure server-side operations.
  - **Firebase Firestore**: Used for storing specific metadata like AI product requests.
- **AI / LLM Integration**:
  - **Providers**: 
    - **Groq** (Primary): Used for high-speed intent detection and product ranking using Llama 3 models.
    - **Google Gemini** (Fallback): Integrated via `GeminiProvider` (`gemini-2.0-flash`) as a redundant layer if Groq fails or is rate-limited.
  - **Features**: Automatic API key rotation (up to 10 keys for Groq/Gemini) for high reliability.
  - **Intent Detection**: Analyzes conversation history for smart product requests.

---

## 🧠 Advanced Modules

### AI Shopping Assistant
- **Intent Analysis**: Located in `src/lib/llm-service.ts`, it uses context-aware analysis to detect user requests for out-of-stock items.
- **Recommendation Engine**: Orchestrates product suggestions based on user queries and available data.
- **Auto-Submission**: Automatically creates product requests in Firestore when sufficient information is gathered.

### Content Management
- **Admin Panel**: Dedicated dashboard for managing products, categories, and site configuration.
- **Bulk Import**: Support for importing product data from **Excel (XLSX)** files.
- **Media Management**: Direct integration with Cloudinary for product gallery management.

---

## 🔧 Tools & Utilities
- **Animations**: `framer-motion` for smooth UI transitions and interactions.
- **Icons**: `lucide-react` for a consistent and modern iconography set.
- **Observability**: `@opentelemetry/api` for system monitoring and traces.
- **General Utilities**:
  - `date-fns`: Date manipulation.
  - `xlsx`: Excel parsing.
  - `clsx` & `tailwind-merge`: Dynamic CSS class management.

---

## 📂 Project Structure Overview
```text
/src
  /app           # Next.js App Router (Pages, Actions, Layouts)
  /components    # Reusable React components (UI, Assistant, Upload)
  /lib           # Core business logic (DB, Firebase, LLM, Recommendations)
/prisma          # Database schema and migrations
/public          # Static assets

---

## 🚀 Deployment & Environment
- **Platform**: **Vercel** (Primary deployment environment).
- **Environment Variables**: Managed via Vercel Dashboard for production.
- **CI/CD**: Automatic deployments on git push.
- **Guide**: See [Deployment & Run Guide](file:///c:/Users/user/.gemini/antigravity/scratch/smart_avenue/docs/deployment-guide.md) for full instructions.
```
