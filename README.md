# Spa Booking System

A React-based spa/wellness booking management system with a calendar view, drag-and-drop scheduling, and real-time API integration.

## Tech Stack

- **React 19** + React Router v7
- **Redux Toolkit** + RTK Query
- **@dnd-kit** — drag and drop
- **@tanstack/react-virtual** — virtualized calendar columns
- **react-hook-form** — booking forms
- **dayjs** — date handling
- **SCSS** — styling with CSS variables for light/dark themes

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Install

```bash
npm install
```

### Environment

Create `.env` in the project root:

```
REACT_APP_API_BASE_URL=https://your-api-url.com
```

### Run

```bash
npm start        # development server → http://localhost:3000
npm run build    # production build
npm run lint     # check for lint errors
npm run format   # auto-format with prettier
```

## Project Structure

```
src/
  api/              # RTK Query baseQuery
  components/
    common/         # Header, Login, NotFound
    features/
      booking/      # BookingPanel, BookingFormMode, BookingViewMode
      calendar/     # CalendarView, BookingBlock, CalendarDndContext
      admin/        # Admin page
  config/           # API endpoints, env config
  constants/        # Calendar constants, therapist colors
  hooks/            # useBookingDrag
  routes/           # AppRoutes, BookingLayout
  services/         # httpClient, AuthService
  store/            # Redux store, bookingApi, uiSlice, authSlice
  styles/           # Global SCSS, themes, mixins
```

## Features

- Calendar view with per-therapist columns and 15/30/60 min interval display
- Drag and drop booking rescheduling with optimistic UI
- Create, edit, and cancel bookings
- Real-time search by client name, phone, or service
- Light/dark theme
- Mobile responsive

## Credentials (dev)

## with mockData

```
Email:   admin@spa.com 
Password:  spa123
```


# with real time API
## ```
## Email:    react@hipster-inc.com
## Password: React@123
## ```

