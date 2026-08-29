# LRB Vault - Project Manifest

**Version:** 1.0.0-alpha (Phase 5 Completion)
**Date:** August 2026
**Target:** LAUTECH Academic Resource Platform

## 🏗️ Core Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn UI, Zustand (Auth State), React Query (Data Fetching), React Hook Form + Zod (Validation), React Dropzone.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Cloudinary (File Storage), Google Gemini AI (Document Processing), Nodemailer (Emails).
- **Design System:** "Academic Precision" (Slate `#0F172A` / Level 1 `#1E293B` / Emerald `#4EDEA3` / JetBrains Mono typography).

---

## ✅ Completed & Locked-In Features

### 1. Global Setup & Design

- [x] Custom Tailwind configuration (`colors`, `radius`).
- [x] Standardized `Button` and `Input` components with strict Radix UI typings.
- [x] Custom `VerifiedCard` component for consistent container styling.

### 2. Layout Scaffolding

- [x] `Navbar` (Responsive, Auth-aware, Sticky).
- [x] `DashboardSidebar` (Role-based links for Students vs. Admins).

### 3. Authentication & Security (Full Stack)

- [x] **Backend:** JWT generation, Google OAuth integration, secure password hashing.
- [x] **Backend:** Nodemailer integration, Password Reset Token generation.
- [x] **Frontend:** Login & Registration multi-tab portal.
- [x] **Frontend:** Student email validation (`*lautech.edu.ng`).
- [x] **Frontend:** Forgot Password & Reset Password flows with URL token capture.

### 4. Search & Discovery (Frontend)

- [x] Search Dashboard (`VaultPage`) with debounced API queries.
- [x] `ResourceCard` component with dynamic file icons and AI tags.
- [x] `useSearchResources` React Query hook (caching and filtering).

### 5. AI Upload Pipeline (Full Stack)

- [x] **Backend:** Course Directory endpoint (`GET /api/courses`).
- [x] **Backend:** Lecturer Directory endpoint (`GET /api/lecturers`).
- [x] **Backend:** AI Gatekeeper extraction endpoint (`POST /api/resources/extract`).
- [x] **Frontend:** Drag-and-drop zone (`react-dropzone`).
- [x] **Frontend:** Loading states with AI UI feedback.
- [x] **Frontend:** Metadata review form with production-ready strict relational `Select` dropdowns for ObjectIds.

### 6. Lecturer Profiles (Frontend - _Backend Pending_)

- [x] Aggregated Profile Layout (`LecturerProfilePage`).
- [x] Unwrapping of Next.js 15 dynamic `Promise` parameters (`React.use(params)`).
- [x] `ReviewFeed` component with optimistic UI upvote/downvote toggles.

---

## ⚠️ Simulated Features (Action Required)

_Per the new development protocol, these frontend features are currently using simulated data or timeouts. We must implement their backend counterparts before proceeding to new features._

1. **Lecturer Profile Fetching:**
   - _Location:_ `src/hooks/useLecturerProfile.ts`
   - _Required Backend:_ `GET /api/lecturers/:id/profile` (Needs to aggregate lecturer data, their uploaded resources, and student reviews).
2. **Review Submission:**
   - _Location:_ `src/components/lecturers/ReviewFeed.tsx` (Inside `onSubmit`)
   - _Required Backend:_ `POST /api/lecturers/:id/reviews` (Needs to accept course code, content, and anonymity toggle).
3. **Review Voting (Upvote/Downvote):**
   - _Location:_ `src/components/lecturers/ReviewFeed.tsx` (Inside `ReviewItem` component buttons)
   - _Required Backend:_ `PUT /api/reviews/:id/vote` (Needs to track user votes to prevent spam).
4. **Search Resources Endpoint Verification:**
   - _Location:_ `src/hooks/useSearchResources.ts`
   - _Required Backend:_ Ensure `GET /api/resources/search` is fully implemented with pagination, keyword matching, and category filtering.
5. **Final Resource Upload Save:**
   - _Location:_ `src/app/upload/page.tsx`
   - _Required Backend:_ Ensure `POST /api/resources/upload` correctly maps Cloudinary URLs and saves the document to the DB with `status: 'pending'`.

---

## 🔒 Development Protocol (Updated)

1. **Zero Simulations:** If a UI component requires data, the Express backend endpoint must be written, typed, and verified first.
2. **Strict Typings:** No `any` types. All API requests use defined TS Interfaces.
3. **Graceful Error Handling:** All `catch (err: unknown)` blocks must strictly cast errors before accessing `.response`.
