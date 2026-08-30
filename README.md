# Nobum

## Project Overview
Nobum is a mobile-first, responsive web application (PWA) designed for small friend groups to track weekly habits and goals (e.g., LeetCode consistency, sleep quality, financial discipline). 

## Core Philosophy
The core philosophy of Nobum is **low-friction, high-psychological safety**: users self-rate their goals on a relative 1-10 scale rather than logging exact quantitative metrics. By sharing these "sticky notes" of progress alongside personal reflections, users foster accountability and support within their friend groups without the stress of raw metric tracking.

## Tech Stack
- **Framework**: Next.js (App Router) running React 19
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend/Database**: Supabase (PostgreSQL) - *Pending implementation*
- **Hosting**: Vercel
- **Emails**: Resend

## Design Constraints
- **Mobile-First**: The UI is built specifically for mobile screens, adhering to iOS/Android safe-area paddings (notch and home indicator).
- **Desktop Experience**: Features a maximum container width (~430px) that simulates a mobile screen when viewed on desktop layouts.

## Current Features & Future Ideas
- **Friend Feed (Home)**: A scrolling feed of friends' weekly check-ins, visually styled as minimalistic sticky notes.
- **Weekly Check-In**: A single-goal self-reflection form featuring a gradient slider and a textarea for leaving contextual notes.
- **Future Pipeline**:
  - Add historical progress charts (e.g., Recharts) to visualize a user's progress over time.
  - Connect Supabase to handle real user authentication, sessions, and database persistence.
  - Implement social interactions: comments, DMs, or reactions on friends' sticky notes.
