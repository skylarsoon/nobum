# Nobum

## Project Overview
Nobum is a mobile-first, responsive web application (PWA) designed for small friend groups to track weekly habits and goals (e.g., LeetCode consistency, sleep quality, financial discipline). 

## Core Philosophy
The core philosophy of Nobum is **low-friction, high-psychological safety**: users self-rate their goals on a relative 1-10 scale rather than logging exact quantitative metrics. By sharing these "sticky notes" of progress alongside personal reflections, users foster accountability and support within their friend groups without the stress of raw metric tracking.

## Tech Stack
- **Framework**: Next.js (App Router) running React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend/Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Emails**: Resend

## Design Constraints
- **Mobile-First**: The UI is built specifically for mobile screens, adhering to iOS/Android safe-area paddings (notch and home indicator).
- **Desktop Experience**: Features a maximum container width (~430px) that simulates a mobile screen when viewed on desktop layouts.

## Current Features & Future Ideas
- **Friend Feed (Home)**: A scrolling feed of check-ins, visually styled as minimalistic sticky notes. It shows everything you can access and has a filter for the main feed (non-group check-ins) or any one of your groups.
- **Groups**: Create a group with one overarching goal (e.g. "Recruiting") and invite friends with a link. Each member adds their own sub-goals under it (e.g. "1 LeetCode problem a day") and checks in with the same 1-10 rating. Group goals and check-ins are visible to members only; personal ones stay in the main feed. Roles are `owner`, `admin` and `member`.
- **Weekly Check-In**: A single-goal self-reflection form featuring a gradient slider and a textarea for leaving contextual notes.
- **Progress View**: Historical progress visualization to track user progress over time.
- **Authentication & Persistence**: Supabase integration for real user authentication, sessions, and database persistence.
- **Database**: Schema, RLS policies and functions live in `supabase/migrations/` (apply with the Supabase CLI). Regenerate `types/database.ts` after schema changes.
- **Future Pipeline**:
  - Implement social interactions: comments, DMs, or reactions on friends' sticky notes.
