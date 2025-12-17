# Clutch ⚡️

> **High Agency Emergency Finder. One click. We decide.**

Clutch is an AI-powered concierge designed for decision fatigue. Instead of scrolling through endless lists, Clutch uses the **Yelp AI Chat API** to find the perfect spot for you instantly. Whether it's a last-minute dinner, a pharmacy run, or finding a mechanic, Clutch handles the search and the booking intent.

![Clutch Demo](https://github.com/user-attachments/assets/placeholder-image)

## 🚀 Key Features

### 🤖 AI Concierge
Powered by the **Yelp Fusion AI API**, Clutch understands natural language queries and context. It doesn't just search; it recommends.

### 🧠 Smart Booking Intent
Don't just find a place—book it. Clutch detects booking intent in your conversation.
*   *"Lets do 12pm"*
*   *"Book a table for 4"*
*   *"Schedule for 7:30"*
All these trigger the **Reservation Modal**, bypassing the API's limitation on direct bookings.

### 📍 Intelligent Location
*   **Auto-Detect**: Uses the browser's Geolocation API for instant results.
*   **Manual Override**: Easily switch to a specific city or zip code.
*   **Context Aware**: The AI knows where you are and filters results accordingly.

### 💎 Premium UI/UX
*   **Glassmorphism**: A modern, dark-mode aesthetic with frosted glass effects.
*   **Motion**: Smooth animations powered by Framer Motion.
*   **Responsive**: Works perfectly on mobile for on-the-go emergencies.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **AI**: [Yelp Fusion AI API](https://docs.developer.yelp.com/docs/yelp-fusion-ai-api) (`/ai/chat/v2`)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)

## 🏃‍♂️ Getting Started

1.  **Clone the repository**
    ```bash
    git clone https://github.com/kadhirash/clutch.git
    cd clutch
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory:
    ```env
    YELP_API_KEY=your_yelp_api_key_here
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🤝 Contributing

This project was built for the **Yelp AI Hackathon 2025**.
