# Fleet Management System

A modern, fullstack web application for managing vehicle fleets, maintenance records, and generating reports.

## Features

### Core Features
- **Authentication & Authorization**: JWT-based auth with role-based access control (Admin, User, Technician)
- **Dashboard**: Real-time metrics, charts, and alerts for fleet overview
- **Vehicle Management**: CRUD operations, search, filters, and detailed vehicle profiles
- **Maintenance Tracking**: Schedule, track, and manage maintenance records with cost breakdown
- **PDF Reports**: Generate and download vehicle, maintenance, and fleet summary reports
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Backend Features
- RESTful API with Express.js
- MongoDB with Mongoose ODM
- JWT authentication with refresh tokens
- Role-based access control
- Database indexing for performance
- PDF generation with Puppeteer
- Input validation with express-validator

### Frontend Features
- React with TypeScript
- Redux Toolkit for state management
- Tailwind CSS for styling
- Recharts for data visualization
- React Router for navigation
- Responsive sidebar layout
- Toast notifications

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **PDF Generation**: Puppeteer
- **CORS**: cors
- **Environment**: dotenv

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Build Tool**: Vite

## Project Structure

```
fleet-management-app/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── scripts/          # Database seed scripts
│   ├── utils/            # Utility functions
│   ├── .env.example      # Environment variables template
│   ├── package.json
│   └── server.js         # Entry point
│
└── frontend/
    ├── public/           # Static assets
    ├── src/
    │   ├── components/   # React components
    │   ├── hooks/        # Custom React hooks
    │   ├── pages/        # Page components
    │   ├── services/     # API services
    │   ├── store/        # Redux store & slices
    │   ├── types/        # TypeScript types
    │   ├── utils/        # Utility functions
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

## Prerequisites

- Node.js 18+ 
- MongoDB 5.0+ (local or cloud)
- npm or yarn

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fleet-management-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/fleet_management
# JWT_SECRET=your_secret_key
# PORT=5000

# Seed database with sample data
npm run seed

# Start development server
npm run dev
```

The backend will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

## Default Login Credentials

After seeding the database, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fleet.com | admin123 |
| User | john.smith@fleet.com | user123 |
| Technician | mike.tech@fleet.com | tech123 |

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login user |
| POST | /api/auth/register | Register new user (Admin only) |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/update-password | Update password |
| POST | /api/auth/logout | Logout user |

### Vehicle Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/vehicles | Get all vehicles |
| GET | /api/vehicles/:id | Get vehicle by ID |
| POST | /api/vehicles | Create vehicle (Admin only) |
| PUT | /api/vehicles/:id | Update vehicle (Admin only) |
| DELETE | /api/vehicles/:id | Delete vehicle (Admin only) |
| GET | /api/vehicles/stats/overview | Get vehicle statistics |

### Maintenance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/maintenance | Get all maintenance records |
| GET | /api/maintenance/:id | Get maintenance by ID |
| POST | /api/maintenance | Create maintenance record |
| PUT | /api/maintenance/:id | Update maintenance record |
| DELETE | /api/maintenance/:id | Delete maintenance (Admin only) |
| PUT | /api/maintenance/:id/complete | Mark as completed |

### Dashboard Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/overview | Get dashboard overview |
| GET | /api/dashboard/trends | Get maintenance trends |
| GET | /api/dashboard/alerts | Get alerts |

### Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/vehicle/:id | Generate vehicle report PDF |
| GET | /api/reports/maintenance/:id | Generate maintenance report PDF |
| GET | /api/reports/fleet-summary | Generate fleet summary PDF |

## Environment Variables

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/fleet_management

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Admin User (for seeding)
ADMIN_EMAIL=admin@fleet.com
ADMIN_PASSWORD=admin123
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

## Available Scripts

### Backend

```bash
npm run dev       # Start with nodemon (hot reload)
npm start         # Start production server
npm run seed      # Seed database with sample data
```

### Frontend

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Database Schema

### User
- firstName, lastName, email, password, role, phone, department, isActive, lastLogin

### Vehicle
- plateNumber, make, model, year, vin, color, bodyType, fuelType, transmission
- status, currentMileage, assignedDriver, department
- maintenanceSchedule, components, registration/insurance info

### Maintenance
- vehicle, type, status, scheduledDate, completionDate
- description, workPerformed, partsUsed, laborHours, laborRate
- totalCost, serviceProvider, technician, priority, warranty

## Performance Optimizations

### Backend
- MongoDB indexes on frequently queried fields
- Lean queries for better performance
- Pagination for large datasets
- Efficient aggregation pipelines

### Frontend
- Code splitting with dynamic imports
- Redux for centralized state management
- Debounced search inputs
- Optimized re-renders

## Security Features

- JWT authentication with expiration
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Secure HTTP headers

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@fleetmanagement.com or create an issue in the repository.

---

Built with ❤️ by the Fleet Management Team
