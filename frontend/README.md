# 💻 Support Ticket System - Angular Frontend

Modern single-page application built with **Angular 19** featuring standalone components, reactive signals, route guards, and an automatic JWT interceptor.

---

## 🛠️ Tech Stack & Features

- **Angular 19 (Standalone Components)**
- **Angular Router** with `authGuard` and `adminGuard`
- **HttpClient with `authInterceptor`**: Automatically attaches Bearer token to all outgoing requests
- **Reactive Signals**: `AuthService.currentUser` signal drives dynamic UI states across the app
- **Tailored Views**:
  - `/login`: Email & password login with unregistered user guidance
  - `/register`: User account creation with duplicate email conflict check
  - `/dashboard`: Real-time personal ticket metrics and recent ticket stream
  - `/tickets`: Filterable ticket list (`All`, `Open`, `In Progress`, `Resolved`) with category and priority badges
  - `/tickets/new`: Issue creation wizard with live AI processing state
  - `/tickets/:id`: Ticket detail view with **AI Suggested Resolution Card** and 1-click clipboard copy
  - `/admin`: Platform-wide ticket triage table with inline status dropdown

---

## 🏃 Running Locally

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start
```

- Port: `4200`
- URL: `http://localhost:4200`

---

## 📦 Production Build

```bash
npm run build
```
Build output is saved to `dist/frontend/browser/` and served via Nginx in production.
