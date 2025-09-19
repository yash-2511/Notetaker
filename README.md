# Note-Taking Application

A full-stack note-taking application built with React, Express.js, and MongoDB. Features user authentication with email verification, note management with CRUD operations, and a modern UI built with shadcn/ui components.

## Features

- 🔐 User Authentication (Signup, Login, Email Verification)
- 📝 Note Management (Create, Read, Update, Delete)
- 🏷️ Note Categories (Work, Personal, Travel, Ideas)
- 🔍 Search and Filter Notes
- 📱 Responsive Design
- 🌙 Dark Mode Support
- 🔒 JWT-based Authentication
- 📧 Email Notifications

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Wouter for routing
- TanStack Query for state management
- shadcn/ui components with Radix UI
- Tailwind CSS for styling
- React Hook Form with Zod validation

### Backend
- Node.js with Express.js
- TypeScript with ES modules
- MongoDB with Mongoose
- JWT authentication with bcrypt
- Email service integration

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd notetaker-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp example.env .env
```

Edit `.env` with your values:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string (minimum 32 characters)

4. Start development server
```bash
npm run dev
```

The application will run on `http://localhost:5000`

## Deployment

### Render Deployment

1. Connect your repository to Render
2. Set environment variables in Render dashboard:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Secure random string from example.env
   - `NODE_ENV`: production

3. Deploy using the provided `render.yaml` configuration

### Build Commands
- Build command: `npm ci && npm run build`
- Start command: `npm start`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Port number (default: 5000) | No |

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities and config
├── server/              # Express backend
│   ├── config/          # Database and app config
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── services/        # Business logic
│   └── routes.ts        # API routes
├── shared/              # Shared types and schemas
└── example.env          # Environment variables template
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/verify-otp` - Email verification
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Notes
- `GET /api/notes` - Get user's notes
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License