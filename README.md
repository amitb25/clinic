# ClinicCare - Clinic Management System

A modern, professional web-based Clinic Management System with React.js frontend and Node.js/Express backend.

## Live Demo

- **Frontend**: https://sariva-clinic.vercel.app
- **Backend API**: https://backend-alpha-neon-98.vercel.app
- **GitHub**: https://github.com/amitb25/clinic.git

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clinic.com | admin123 |

## Features

- **User Authentication** - JWT-based authentication with role-based access (Admin/Doctor)
- **Doctor Management** - Add, edit, and manage clinic doctors with availability schedules
- **Patient Management** - Complete patient records with medical history and allergy tracking
- **Medicine Inventory** - Track medicines with expiry dates and low stock alerts
- **Prescription Management** - Create and print prescriptions with PDF download
- **Appointment Scheduling** - Book and manage patient appointments
- **Dashboard** - Overview with statistics, charts, and alerts
- **Dark/Light Mode** - Toggle between dark and light themes

## Tech Stack

### Frontend
- React.js 18
- React Router v6
- Tailwind CSS
- Chart.js / React-Chartjs-2
- Lucide React Icons
- React-to-Print
- jsPDF

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcryptjs

## Prerequisites

- Node.js 18+ installed
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

### 1. Clone or Download the Project

```bash
cd "Clinic Manangement"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder (or modify the existing one):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/clinic-management
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
NODE_ENV=development
```

For MongoDB Atlas, replace `MONGODB_URI` with your connection string:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clinic-management
```

Start the backend server:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will start at `http://localhost:3000`

## First-Time Setup

1. Open `http://localhost:3000` in your browser
2. Click "Don't have an account? Create one"
3. Register an admin account (first user will be admin)
4. Login with your credentials

## Project Structure

```
clinic-management/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── roleCheck.js          # Role-based access
│   ├── models/
│   │   ├── User.js               # User/Auth model
│   │   ├── Doctor.js             # Doctor model
│   │   ├── Patient.js            # Patient model
│   │   ├── Medicine.js           # Medicine model
│   │   ├── Prescription.js       # Prescription model
│   │   └── Appointment.js        # Appointment model
│   ├── routes/
│   │   ├── auth.js               # Login/logout routes
│   │   ├── doctors.js            # Doctor CRUD
│   │   ├── patients.js           # Patient CRUD
│   │   ├── medicines.js          # Medicine CRUD
│   │   ├── prescriptions.js      # Prescription CRUD
│   │   ├── appointments.js       # Appointment CRUD
│   │   └── dashboard.js          # Dashboard stats
│   ├── .env                      # Environment variables
│   ├── server.js                 # Express app entry
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Shared components
│   │   │   └── ...
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Authentication state
│   │   │   └── ThemeContext.jsx  # Dark/light mode
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── Patients.jsx
│   │   │   ├── Medicines.jsx
│   │   │   ├── Prescriptions.jsx
│   │   │   └── Appointments.jsx
│   │   ├── services/
│   │   │   └── api.js            # Axios instance
│   │   ├── utils/
│   │   │   └── helpers.js        # Utility functions
│   │   ├── App.jsx
│   │   ├── index.css             # Tailwind imports
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register (first user = admin)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Doctors (Admin only for create/update/delete)
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Patients
- `GET /api/patients` - List patients (with search)
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/:id/prescriptions` - Patient's prescriptions

### Medicines (Admin only for create/update/delete)
- `GET /api/medicines` - List medicines
- `GET /api/medicines/alerts` - Low stock & expired alerts
- `POST /api/medicines` - Create medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Prescriptions
- `GET /api/prescriptions` - List prescriptions
- `GET /api/prescriptions/:id` - Get prescription
- `POST /api/prescriptions` - Create prescription
- `PUT /api/prescriptions/:id` - Update prescription

### Appointments
- `GET /api/appointments` - List appointments
- `GET /api/appointments/today` - Today's appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

## User Roles

### Admin
- Full system access
- Manage doctors, medicines
- All patient and prescription operations

### Doctor
- Patient management
- Create prescriptions
- Book appointments
- View medicines (read-only)

## Screenshots

The system includes:
- Modern dashboard with statistics and charts
- Responsive design for desktop and mobile
- Dark/Light mode toggle
- Print-ready prescription format
- PDF download for prescriptions

## Development

### Running in Development Mode

Backend (with hot reload):
```bash
cd backend
npm run dev
```

Frontend (with hot reload):
```bash
cd frontend
npm run dev
```

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

## License

MIT License
