# Tars Chat 💬

A real-time live chat messaging app built with **Next.js**, **TypeScript**, **Convex**, and **Clerk**.

## ✨ Features

1. **Authentication** — Clerk-powered sign-up (email & social), login, logout. User profiles stored in Convex.
2. **User List & Search** — View all registered users, search by name, click to open a conversation.
3. **One-on-One DMs** — Private conversations with real-time updates via Convex subscriptions.
4. **Message Timestamps** — Smart formatting: `2:34 PM` today, `Feb 15, 2:34 PM` this year, full date for older.
5. **Empty States** — Helpful messages for no conversations, no messages, no search results.
6. **Responsive Layout** — Desktop: sidebar + chat; Mobile: toggled views with back button.
7. **Online/Offline Status** — Green indicator for active users, updates in real time.
8. **Typing Indicator** — Animated dots when others are typing, clears after ~2s of inactivity.
9. **Unread Message Count** — Badge on conversation items, cleared when conversation is opened.
10. **Smart Auto-Scroll** — Auto-scrolls to latest message; shows "↓ New messages" button when scrolled up.
11. **Delete Own Messages** — Soft delete with "This message was deleted" placeholder.
12. **Message Reactions** — React with 👍 ❤️ 😂 😮 😢; click again to remove; shows counts.
13. **Loading & Error States** — Skeleton loaders, error toasts on send failure.
14. **Group Chat** — Create groups with multiple members, real-time group messages.

## 🛠 Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Convex** (real-time backend + database)
- **Clerk** (authentication)
- **Tailwind CSS v4**
- **Lucide React** (icons)
- **date-fns** (date formatting)
- **react-hot-toast** (notifications)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd chat-app
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

Follow the prompts to create a new Convex project. Copy the `NEXT_PUBLIC_CONVEX_URL` from the output.

### 3. Set up Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application.
2. Enable Email and any social providers you want.
3. Get your **Publishable Key** and **Secret Key** from the Clerk dashboard.

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### 5. Run Convex and Next.js together

In one terminal:
```bash
npx convex dev
```

In another terminal:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
chat-app/
├── convex/                    # Convex backend
│   ├── schema.ts              # Database schema
│   ├── users.ts               # User CRUD functions
│   ├── conversations.ts        # Conversation management
│   ├── messages.ts            # Message operations
│   └── typing.ts              # Typing indicators
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Main chat page
│   │   ├── globals.css        # Global styles
│   │   ├── sign-in/           # Clerk sign-in page
│   │   └── sign-up/           # Clerk sign-up page
│   ├── components/
│   │   ├── chat/              # Core chat components
│   │   │   ├── sidebar.tsx    # Sidebar with conversations & search
│   │   │   ├── chat-area.tsx  # Main chat area
│   │   │   ├── message-bubble.tsx  # Individual message
│   │   │   ├── message-input.tsx   # Typing area
│   │   │   ├── conversation-item.tsx # Sidebar list item
│   │   │   ├── user-search.tsx     # People tab
│   │   │   └── create-group-modal.tsx # Group creation
│   │   ├── ui/                # Reusable UI components
│   │   │   ├── user-avatar.tsx
│   │   │   └── skeleton.tsx
│   │   └── providers.tsx      # Convex + Clerk providers
│   ├── hooks/
│   │   └── use-user-sync.ts   # User sync & presence hook
│   ├── lib/
│   │   ├── utils.ts           # cn() utility
│   │   └── format.ts          # Date/text formatting
│   └── middleware.ts          # Clerk auth middleware
```

## 🌐 Deployment

### Deploy to Vercel

1. Push your repository to GitHub.
2. Import your repo on [vercel.com](https://vercel.com).
3. Add the environment variables from your `.env.local`.
4. Deploy!

### Deploy Convex to Production

```bash
npx convex deploy
```

Copy the production URL to your Vercel environment variables.

## 📄 License

MIT
