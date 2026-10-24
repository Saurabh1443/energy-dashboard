# UK Wind Day-Ahead Portal

Web app for a UK energy utility team buying power on the day-ahead market. It shows national wind generation forecasts that were available at the day-ahead decision gate, and quantifies forecast error against Elexon actuals for January 2026.

**Live app:** https://uk-wind-portal.vercel.app

**API:** https://uk-wind-portal-api.onrender.com

**Example API call:** https://uk-wind-portal-api.onrender.com/api/v1/energy-data/?date=2026-01-15

---

## Features

- Day-ahead forecast selection: latest WINDFOR run with `publishTime` on or before **D−1 11:00 Europe/London**
- Actual vs day-ahead forecast chart (Elexon FUELHH WIND + WINDFOR)
- Accuracy metrics: MAE, bias, RMSE, MAPE, ±MAE uncertainty band
- Decision context shown in the UI (gate time + forecast run publish time)
- Scope limited to January 2026 purchase decisions

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React (Vite), MUI, MUI X Charts |
| Backend | Django, Gunicorn |
| Data | Elexon BMRS FUELHH + WINDFOR |
| Local run | Docker Compose |
| Deploy | Frontend → Vercel · Backend → Render (Docker) |

---

## Repository structure

```text
.
├── backend/                 # Django API
│   ├── EnergyAnalyzer/      # App: models, APIs, analytics, seeder
│   │   ├── analytics.py     # MAE, bias, RMSE, MAPE
│   │   ├── day_ahead.py     # Day-ahead gate helper
│   │   ├── repositories.py  # Day-ahead forecast selection
│   │   ├── services.py      # Join actuals/forecasts + response payload
│   │   ├── views.py / urls.py
│   │   └── management/commands/seed_january_data.py
│   ├── config/              # Django settings / WSGI
│   ├── Dockerfile
│   ├── entrypoint.sh        # migrate → seed → gunicorn
│   ├── start.sh             # Render native start (optional)
│   ├── requirements.txt
│   └── render.yaml
├── frontend/                # React UI
│   ├── src/
│   │   ├── components/      # Dashboard, chart, metrics, header
│   │   ├── hooks/useWindData.js
│   │   └── theme.js
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## How to start the application

### Option A — Docker Compose (recommended)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

First start seeds January 2026 Elexon data (can take a few minutes).  
Set `SKIP_SEED=true` in `.env` for faster restarts after the DB volume exists.

### Option B — Without Docker

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example ../.env
python manage.py migrate
python manage.py seed_january_data
python manage.py runserver  # or: bash start.sh / gunicorn
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env.local   # set VITE_API_BASE_URL=http://127.0.0.1:8000
npm run dev
```

---

## API overview

| Endpoint | Description |
|----------|-------------|
| `GET /api/v1/energy-data/?date=YYYY-MM-DD` | Day-ahead forecast vs actuals + metrics for a January 2026 date |
| `GET /api/v1/monthly-summary/` | Simple health / month status payload |

Dates outside 2026-01-01 … 2026-01-31 are rejected.

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://uk-wind-portal.vercel.app |
| Backend | Render (Docker) | https://uk-wind-portal-api.onrender.com |

Frontend build env: `VITE_API_BASE_URL=https://uk-wind-portal-api.onrender.com`

---

## AI tools note

AI tools were used while building this project:

- **Google Gemini** — used for **project understanding and research** (domain context around the UK day-ahead market, Elexon datasets, and clarifying product requirements).
- Coding assistance was also used during implementation and debugging of the application.

All product decisions, verification of API behaviour, and final ownership of the submitted work remain with the author.

---

## Data source

Generation actuals and forecasts are sourced from the public Elexon BMRS APIs (FUELHH, WINDFOR). Use of that data is subject to Elexon’s terms.
