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




