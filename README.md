# Mirror Mentor

## Overview
Mirror Mentor is an AI-powered web application that provides personalized makeup guidance and product recommendations using real-time face tracking and image analysis.

By combining computer vision, AI, and an interactive UI, the app helps users understand their facial features, receive tailored suggestions, and follow step-by-step makeup guidance directly on their own face.

---

## Core Features

### 🎥 Input & Analysis
- Live camera integration with real-time face tracking (MediaPipe)
- Photo upload for offline analysis
- Lighting analysis (multi-layer evaluation)
- AI-powered face analysis using Gemini

### 💄 Interactive Makeup Guidance
- Step-by-step guided makeup application
- Face-tracked overlays aligned to user features
- Real shade color rendering on live video
- Custom makeup style input

### 🧠 Personalization
- Skin Profile (skin type, concerns, budget)
- AI-powered product recommendations
- Product Finder for discovering new items

### 🛍️ Shopping Experience
- Add to cart from makeup guide
- Add to cart from Product Finder
- Cart system (in progress)

### 👤 User System
- Authentication (login / signup)
- Persistent user data via Supabase
- Save and manage profiles
- “My Looks” page with replay functionality

---

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend / Database
- Supabase

### AI & Computer Vision
- Gemini API
- MediaPipe

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/mirror-mentor.git
cd mirror-mentor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Create a .env file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Set up backend/Database

Open supabase, create new project and run:

```bash
create extension if not exists "uuid-ossp";

-- ─── User profiles ────────────────────────────────────────────────────────
-- Stores face analysis results + skin preferences
-- One row per user — updated if they re-analyze
create table profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  skin_type     text,
  skin_tone     text,
  skin_tone_hex text,
  face_shape    text,
  eye_shape     text,
  lip_fullness  text,
  budget        text default 'budget-friendly',
  created_at    timestamp with time zone default now(),
  updated_at    timestamp with time zone default now()
);

-- ─── Saved looks ──────────────────────────────────────────────────────────
-- Stores complete makeup guides the user wants to keep
create table saved_looks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  style_name  text not null,
  face_data   jsonb,
  steps       jsonb,
  created_at  timestamp with time zone default now()
);

-- ─── Cart items ───────────────────────────────────────────────────────────
-- Stores products the user wants to buy
create table cart_items (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  product_name text not null,
  brand        text,
  shade        text,
  shade_hex    text,
  price        text,
  zone         text,
  style_name   text,
  skin_concern text[] default '{}',
  total_budget text,
  created_at   timestamp with time zone default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────
-- Makes sure users can only see their OWN data

alter table profiles    enable row level security;
alter table saved_looks enable row level security;
alter table cart_items  enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

-- Saved looks policies
create policy "Users can view own looks"
  on saved_looks for select using (auth.uid() = user_id);

create policy "Users can insert own looks"
  on saved_looks for insert with check (auth.uid() = user_id);

create policy "Users can delete own looks"
  on saved_looks for delete using (auth.uid() = user_id);

-- Cart policies
create policy "Users can view own cart"
  on cart_items for select using (auth.uid() = user_id);

create policy "Users can insert own cart"
  on cart_items for insert with check (auth.uid() = user_id);

create policy "Users can delete own cart"
  on cart_items for delete using (auth.uid() = user_id);
```

### 4. Run the App
```bash
cd mirror-mentor
npm run dev
```

### 5. Open in Browser

---

### Vision

Mirror Mentor aims to make personalized beauty guidance more accessible by turning a user’s own face into an interactive canvas powered by AI.

### License

This project is for educational and development purposes.




