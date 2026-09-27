# Planova

> A full-stack web application developed as a university CSE project.

Planova is a web-based application designed to provide users with a centralized platform for planning and organizing activities with location-based functionality.

The project was developed as a collaborative effort by a team of five CSE students, with a focus on full-stack web development, database management, API integration, and practical software engineering.

---

## 📌 Overview

Planova combines a modern web frontend with a backend API and relational database to provide a complete full-stack application.

The project was built to gain practical experience in:

- Full-stack web application development
- Frontend and backend integration
- REST API development
- Relational database management
- Location and map-based functionality
- Application testing
- Collaborative software development using Git and GitHub

---

## ✨ Features

- 🌐 Modern web-based user interface
- 📋 Planning and activity management
- 📍 Location-based functionality
- 🗺️ Map integration using Google Maps
- 🔗 Frontend and backend API communication
- 🗄️ PostgreSQL database integration
- 🧪 Testing environment
- 📱 Responsive web interface

---

## 🛠️ Technology Stack

### Frontend

- Next.js
- JavaScript
- CSS
- React

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

### APIs & Services

- Google Maps

### Development Tools

- Git
- GitHub
- npm

---

## 🏗️ Project Architecture

Planova follows a client-server architecture where the frontend communicates with the backend through APIs, while the backend manages communication with the PostgreSQL database and external services.

```text
                 ┌───────────────────┐
                 │       User        │
                 └─────────┬─────────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │   Next.js / React │
                 │     Frontend      │
                 └─────────┬─────────┘
                           │
                           │ API Requests
                           ▼
                 ┌───────────────────┐
                 │   Express.js     │
                 │     Backend      │
                 └─────────┬─────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
       ┌─────────────────┐   ┌─────────────────┐
       │   PostgreSQL    │   │   Google Maps   │
       │    Database     │   │      API        │
       └─────────────────┘   └─────────────────┘

## ⚙️ Installation & Setup

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL
* Git

### Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Planova
```

### 🖥️ Frontend Setup

```bash
cd front
npm install
npm run dev
```

The frontend development server will be available at:

```text
http://localhost:3000
```

### ⚙️ Backend Setup

Open a new terminal:

```bash
cd backend
npm install
npm run dev
```

### 🗄️ Database Setup

Planova uses PostgreSQL as its primary database.

Create a PostgreSQL database and configure the database connection through the backend environment variables.

Example:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME
PORT=5000
```

Run any required database setup, migration, or seed commands defined by the project.

### 🗺️ Google Maps Integration

Planova uses Google Maps for location-based functionality.

Configure the required Google Maps API key in the appropriate environment file.

Example:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
```

Make sure the required Google Maps services are enabled for the API key.

### 🔐 Environment Variables

Create the required `.env` files locally.

Example:

```env
DATABASE_URL=your_postgresql_connection
PORT=5000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Do not commit `.env` files, API keys, passwords, or other sensitive credentials to the repository.
🎓 Academic Project

Planova was developed as a university CSE project to gain practical experience in:

Full-stack web development
Frontend development
Backend development
REST API development
Database management
Third-party API integration
Software testing
Git and GitHub collaboration
🚀 Future Improvements
Enhanced planning and activity management
Improved location-based features
More comprehensive testing
Improved UI/UX
Performance optimization
Enhanced authentication and authorization
Additional API integrations
Production deployment
