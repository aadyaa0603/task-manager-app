# Task Manager Application
A full-stack task management application built with React, Node.js, Express, and MongoDB. Users can create, organize, update, and track tasks across multiple categories with deadline management, notifications, calendar integration, and dark mode support.

## Features

- User Authentication (JWT)
- Create, Update, Delete Tasks
- Category-based Task Organization
- Deadline Tracking
- Calendar View
- Due Soon Notifications
- Overdue Task Detection
- Dark Mode
- Responsive Design

- ## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- React Calendar
- Axios

### Backend
- Node.js
- Express.js
- JWT Authentication

### Database
- MongoDB Atlas
- Mongoose

- ## Installation

### Clone Repository

git clone <https://github.com/aadyaa0603/task-manager-app>

cd task-manager-app

##BACKEND

cd backend
npm install
npm run dev

Create .env

PORT=5000
MONGO_URI=mongodb+srv://aadya:priya0603@task1.ewrucgw.mongodb.net/taskmanager?appName=task1
JWT_SECRET=mysecretkey

##Frontend

cd frontend
npm install
npm run dev

## Project Structure

backend/
├── models/
├── routes/
├── middleware/
├── server.js

frontend/
├── src/
│ ├── pages/
│ ├── components/
│ ├── api/
│ └── App.jsx

## Assumptions

- Each task belongs to exactly one category.
- Users manage only their own tasks.
- Deadlines are optional.
- Notifications are browser-based and require notification permission.
- Categories are predefined and not user-configurable.
- Authentication is required for all task operations.

  ## Technical Decisions

### React

React was chosen for its component-based architecture and efficient state management.

### Tailwind CSS

Tailwind CSS was selected to rapidly build a responsive and consistent user interface without maintaining large CSS files.

### JWT Authentication

JWT was used to enable stateless authentication between the frontend and backend.

### MongoDB

MongoDB was selected because task data is document-oriented and fits naturally into a NoSQL structure.

### React Calendar

React Calendar was used to provide task visualization by date and improve deadline tracking.

## Tradeoffs

### Fixed Categories

Categories are predefined rather than user-created. This simplifies validation and ensures consistency, but reduces customization.

### Browser Notifications

Notifications are implemented using the browser Notification API rather than push notifications. This reduces infrastructure complexity but limits reminders to active browser sessions.

### Client-Side Filtering

Task filtering is performed on the frontend after fetching tasks. This simplifies backend implementation but may become inefficient for very large datasets.

### Single Collection Design

All tasks are stored in a single MongoDB collection and filtered by userId. This simplifies querying but could require indexing optimizations at scale.

## Timezone Handling

Task deadlines are entered in the user's local timezone (IST) and converted to UTC before storage in MongoDB. When displayed, deadlines are converted back to the user's timezone to ensure consistent scheduling and notification behavior.
