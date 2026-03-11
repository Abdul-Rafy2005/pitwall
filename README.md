# PitWall - F1 Dashboard

A modern, real-time Formula 1 dashboard application built with React 18.

## 🏎️ Features

- Real-time race data from OpenF1 API
- Live leaderboards and driver tracking
- AI-powered race commentary
- F1 highlights and videos
- Driver profiles and standings
- Beautiful glassmorphism UI design

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router v6** - Routing
- **React Query** - Data fetching & caching
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **Vite** - Build tool

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd PitWall
```

2. Install dependencies
```bash
npm install
```

3. Copy `.env.example` to `.env` and add your API keys
```bash
cp .env.example .env
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📁 Project Structure

```
src/
├── components/       # React components
│   ├── layout/      # Layout components (Navbar, Footer)
│   ├── home/        # Home page components
│   ├── live/        # Live race components
│   └── shared/      # Reusable components
├── config/          # Configuration files
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API services
└── styles/          # Global styles
```

## 🔑 API Keys

- **OpenF1 API**: No key required - [openf1.org](https://openf1.org/)
- **YouTube API**: Required for video highlights
- **Claude API**: Required for AI commentary

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
