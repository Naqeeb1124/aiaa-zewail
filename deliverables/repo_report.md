# Codebase Report

## Tech Stack Detected
- **Frontend Framework**: Next.js (Pages Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend/Database**: Firebase (Firestore, Auth, Storage)
- **State Management**: React Hooks (Context/Local State)
- **Deployment**: Vercel (implied by Next.js)

## Build & Deploy
- **Build Command**: `npm run build`
- **Dev Command**: `npm run dev`
- **Lint Command**: `npm run lint`

## Missing Parts / Issues
- **Admin Route**: `src/pages/admin/interviews.tsx` is missing (causing 404).
- **Environment Variables**: Relies on `.env.local` for Firebase config.
- **Testing**: No test framework detected (Jest/Playwright missing).
- **CI/CD**: No GitHub Actions workflows present.
- **Accessibility**: No automated accessibility checking (axe-core) in place.
- **Documentation**: Missing API docs, architecture overview, and deployment guide.

## Recommended Minimal Changes
1.  **Stick to Current Stack**: Continue using Next.js (Pages) + Firebase to avoid a costly rewrite.
2.  **Fix Admin 404**: Create `src/pages/admin/interviews.tsx`.
3.  **Update Branding**: Update `tailwind.config.js` with correct AIAA/Zewail colors.
4.  **Add Testing**: Install Jest and Playwright.
5.  **Add CI/CD**: Create `.github/workflows/ci.yml`.
