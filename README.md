# LankaTravel Frontend

A luxury travel booking platform for Sri Lanka, built with React, TypeScript, and Vite.

**Live:** [https://travel-lanka-fe.vercel.app](https://travel-lanka-fe.vercel.app)  
---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Routing | React Router v6 |
| Maps | React-Leaflet |
| HTTP Client | Axios |
| Deployment | Vercel |

---

## Features

### UI & Design
- Luxury dark navy and gold design system (`#0a1628`, `#C9922A`)
- Cormorant Garamond typography with angular clip-path shapes
- Framer Motion page transitions and scroll animations
- Fully responsive across desktop and mobile

### Pages & Functionality
- Destination browsing with search and filter
- Interactive destination map with OSRM travel time routing via React-Leaflet
- AI-powered trip planner (Gemini)
- Stay listings and detail pages
- Event listings
- PayHere payment flow
- Weather widget with Sri Lanka city mapping
- User dashboard — bookings, wishlist, profile
- Admin dashboard — CRUD for destinations, stays, events, bookings, reviews, users

### Authentication
- JWT login and registration
- Google OAuth and Facebook OAuth
- Protected routes with role-based access (user / admin)
- Refresh token handling

---

## Project Structure

```
travel-lanka-fe/
├── src/
│   ├── api/               # Axios instances and API calls
│   ├── assets/            # Images, fonts
│   ├── components/        # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── DestinationCard.tsx
│   │   ├── WeatherWidget.tsx
│   │   └── ...
│   ├── context/           # Auth context, global state
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Destinations.tsx
│   │   ├── DestinationDetail.tsx
│   │   ├── DestinationMap.tsx
│   │   ├── Stays.tsx
│   │   ├── StayDetail.tsx
│   │   ├── Events.tsx
│   │   ├── AiTripPlanner.tsx
│   │   ├── UserDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── routes/            # Route definitions and guards
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Helper functions
│   ├── App.tsx
│   └── main.tsx
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Environment Variables

```env
VITE_API_URL=https://travel-lanka-be.vercel.app/api/v1
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## Getting Started

```bash
git clone https://github.com/yourusername/travel-lanka-fe.git
cd travel-lanka-fe

npm install

cp .env.example .env
# Fill in your values

npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

---

## Deployment

Deployed on Vercel with automatic deployments on push to `main`.

```bash
npm i -g vercel
vercel --prod
```

---

## Backend

The REST API for this project is maintained in a separate repository.

