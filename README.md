# SIH Explorer

An intuitive dashboard for exploring, filtering, and reviewing Smart India Hackathon (SIH) problem statements with detailed descriptions, organizational metrics, and submission trackers.

---

## Features

* **Search & Filter:** Find problem statements instantly by PS ID, title, organization, or theme.
* **Submission Progress:** Track submission limits and capacity via color-coded progress bars.
* **Clean Detail Modal:** Expanded modal layout that automatically formats dense descriptions, background details, and organizational metadata.
* **Responsive Layout:** Responsive grid with pagination and dark-mode styling built using Tailwind CSS and Lucide React icons.

---

## Tech Stack

* **Frontend:** React (Vite), Axios, Lucide React, Tailwind CSS
* **Backend:** FastAPI / Node.js API (serves data from `http://localhost:8000/problems`)

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher)
* npm or yarn

### Installation & Setup

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/sih-explorer.git
cd sih-explorer

```


2. **Install frontend dependencies:**
```bash
cd frontend
npm install

```


3. **Start the backend server:**
Ensure your backend service is running locally on `http://localhost:8000`.
4. **Run the frontend development server:**
```bash
npm run dev

```


5. **Open in Browser:**
Navigate to `http://localhost:5173` to explore the dashboard.

---

## Environment Variables

If your backend URL differs from default, configure a `.env` file in the `frontend` folder:

```env
VITE_API_BASE_URL=http://localhost:8000/problems

```

---

## License

Distributed under the MIT License.
