# Architecture Overview - Virtual Library

## System Overview
The Virtual Library Manager is a full-stack web application designed to facilitate book management, borrowing, and user administration. It follows a client-server architecture with a clear separation of concerns.

### Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS v4.
- **Backend**: Node.js, Express.js.
- **Database**: PostgreSQL (via Sequelize ORM).
- **Authentication**: JWT & OTP (Email-based).

## Directory Structure

### `/backend`
- **`config/`**: Database configuration (`database.js`).
- **`controllers/`**: Logic for handling requests (`authController`, `bookController`, `loanController`).
- **`models/`**: Sequelize definitions (`User`, `Book`, `Loan`).
- **`routes/`**: API endpoint definitions.
- **`middleware/`**: Auth verification and role checking (`authMiddleware.js`).
- **`tests/`**: Jest integration tests.

### `/frontend`
- **`src/context/`**: Global state (`AuthContext`, `ModalContext`).
- **`src/pages/`**: Role-based dashboards (`Student`, `Professor`, `Author`, `Librarian`, `Admin`).
- **`src/services/`**: Axios instance for API communication.
- **`src/tests/`**: Vitest component tests.

## Key Design Patterns
1. **Neumorphism**: The UI uses a soft, plastic aesthetic achieved via shadow manipulation in CSS.
2. **Context API**: Used for managing global Authentication state and Modals, avoiding prop drilling.
3. **Role-Based Access Control (RBAC)**: Backend middleware strictly enforces roles (e.g., only Admin/Librarian can approve books).

## Database Schema
- **Users**: Stores credentials, roles, and status (active/inactive).
- **Books**: Stores metadata, PDF paths, cover image URLs, and stock count.
- **Loans**: Junction table linking Users and Books, tracking due dates and status.
