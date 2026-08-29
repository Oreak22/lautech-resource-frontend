# LAUTECH Student Resources Bank - Frontend Manifest

## Tech Stack
Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI, React Bits (Animations), React Query, Zustand.

## Tracking Legend
- [ ] Pending
- [~] In Progress
- [x] Completed

---

## Phase 1: Initialization & Architecture
- [ ] Initialize Next.js app with Tailwind and TypeScript
- [ ] Initialize Shadcn UI and add core components (Buttons, Inputs, Dialogs, Cards)
- [ ] Initialize React Bits CLI for animated backgrounds and cards
- [ ] Setup global state (Zustand) and API client (Axios + React Query)
- [ ] Create layout scaffolding (Navbar, Sidebar, Footer)

## Phase 2: Authentication & User Onboarding
- [ ] Build Login and Registration pages
- [ ] Implement Google OAuth button (`@react-oauth/google`)
- [ ] Build the Email Verification waiting screen/toast
- [ ] Create route protection logic (middleware or higher-order components)

## Phase 3: The Search & Discovery Dashboard (Student View)
- [ ] Build the Faceted Search UI (Autocomplete bar, Category/Course filters)
- [ ] Build the Resource Card component with React Bits stagger animations
- [ ] Build the In-Browser File Preview modal (PDFs and Images)
- [ ] Implement pagination/infinite scroll for search results

## Phase 4: The Smart Upload Pipeline
- [ ] Build the Drag-and-Drop file zone (`react-dropzone`)
- [ ] Implement the "AI Processing..." loading state for metadata extraction
- [ ] Build the Metadata Review Form (Auto-filled by AI, editable by user)
- [ ] Handle successful upload routing and Trust Score notifications

## Phase 5: Lecturer Profiles & Commenting
- [ ] Build the Aggregated Lecturer Profile page with React Bits hero background
- [ ] Implement the strict one-way comment feed
- [ ] Build the Upvote/Downvote toggle UI
- [ ] Build the "Search-First" flow for suggesting missing lecturers/courses

## Phase 6: Admin & Moderation Hub
- [ ] Build the Admin Layout wrapper
- [ ] Build the Resource Triage Queue (Approve/Reject buttons with PDF preview)
- [ ] Build the Directory Moderation tool (Merge duplicate courses/lecturers)