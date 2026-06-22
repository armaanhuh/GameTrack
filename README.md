# 🎮 GameTrack

**A premium personal gaming backlog registry, playtime tracker, and collection manager.**

GameTrack is a single-page web application that helps you organize, track, and analyze your gaming library. It features a clean, print-editorial aesthetic with dark/light themes, powered by the [RAWG API](https://rawg.io/apidocs) for game metadata.

---

## ✨ Features

- **Dashboard** — Editorial stat cards showing total games, active plays, completion rate, playtime hours, and gaming streak
- **Backlog Registry** — Spreadsheet-style game list with filtering (by status, platform) and sorting (by metacritic, playtime, date, rating)
- **Platform Registry** — Games grouped by platform (PC, PlayStation, Xbox, Nintendo Switch) with completion progress bars
- **Analytics** — Custom SVG charts: monthly activity bar chart, genre donut chart, and platform distribution
- **Global Search** — `⌘K` command palette powered by RAWG API to search and add games
- **Game Detail Modal** — Full game editor with status, platforms, playtime, rating, notes, and dates
- **Dark/Light Theme** — Premium theme toggle with smooth transitions
- **Auto-Save** — 500ms debounced auto-sync to the local JSON database
- **Export** — One-click JSON export of your entire library

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Typography | Playfair Display + DM Sans (Google Fonts) |
| Backend | Node.js + Express |
| Database | Local JSON file (`data/library.json`) |
| API | RAWG Video Games Database API |

---

## 📁 Project Structure

```
gametrack/
├── data/
│   └── library.json          # Local JSON database
├── server/
│   └── index.js              # Express backend (port 3001)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx        # Glassmorphic navbar with icons
│   │   │   ├── SearchModal.jsx   # ⌘K command palette
│   │   │   └── ApiKeySetup.jsx   # First-run API key entry
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx # Editorial stat cards + activity timeline
│   │   ├── backlog/
│   │   │   └── BacklogPage.jsx   # Spreadsheet game registry
│   │   ├── platforms/
│   │   │   └── PlatformPage.jsx  # Platform grouping + progress bars
│   │   ├── analytics/
│   │   │   └── AnalyticsPage.jsx # Custom SVG charts
│   │   └── shared/
│   │       └── GameDetailModal.jsx # Game editor modal
│   ├── contexts/
│   │   └── LibraryContext.jsx    # State management + debounced save
│   ├── services/
│   │   ├── rawg.js              # RAWG API integration
│   │   ├── storage.js           # Backend communication
│   │   └── stats.js             # Analytics calculations
│   ├── App.jsx                  # Hash-based routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Design tokens + Tailwind config
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A **RAWG API Key** (register your own at [rawg.io/apidocs](https://rawg.io/apidocs))

> [!IMPORTANT]
> **Pre-populated RAWG API Key:**
> The project is pre-configured with this key so you can start immediately:
> `7fe5e0ff366d4ce68f2f5669b38e7180`
> It is initialized automatically, but if you need to copy or enter it manually, you can use the value above.

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd GameTrack
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the backend server** (in one terminal)
   ```bash
   npm run server
   ```
   This starts the Express API server on `http://localhost:3001`.

4. **Start the frontend dev server** (in another terminal)
   ```bash
   npm run dev
   ```
   This starts the Vite dev server, typically on `http://localhost:5173`.

5. **Open in browser**
   Navigate to `http://localhost:5173`. On first launch, you'll be prompted to enter your RAWG API key.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run server` | Start Express backend on port 3001 |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |

---

## 🎮 Usage

1. **Search for games** — Press `⌘K` (or `Ctrl+K`) or click the search bar to open the command palette. Type a game title to search the RAWG database.

2. **Add to backlog** — Click any search result to open the game detail modal. Set your status, platforms, and click "Add to Backlog".

3. **Track progress** — Update game status (Backlog → Playing → Completed), log playtime hours, add ratings and notes.

4. **Browse your library** — Use the Backlog page to filter by status/platform and sort by various criteria.

5. **View analytics** — Check the Analytics page for playtime trends, genre breakdowns, and platform comparisons.

6. **Export data** — Click the download icon in the header to export your library as JSON.

---

## 🔧 Configuration

### API Key

The RAWG API key is stored in your browser's `localStorage` under the key `gt_api_key`. It is pre-populated with the default key `7fe5e0ff366d4ce68f2f5669b38e7180`. You can change it at any time using the Settings (gear icon) in the header.

### Theme

Toggle between dark and light themes using the sun/moon icon in the header. Your preference is saved in `localStorage` under `gt_theme`.

### Database

Game data is persisted in `data/library.json`. This file is automatically created on first server start. You can back up this file or replace it with exported data.

---

## 📄 License

This project is for personal use. Game metadata is provided by [RAWG](https://rawg.io).
