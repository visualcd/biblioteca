# 📚 Virtual Library Manager

> A modern, full-stack library management system featuring a **Neumorphic Design** interface and **Role-Based Access Control**.

![Neumorphism UI](frontend/public/logo.png)

## 🌟 Features

- **🎨 Neumorphic UI**: A soft, plastic design aesthetic for a premium user experience.
- **🔐 Role-Based Access Control (RBAC)**: Distinct dashboards and permissions for **Students**, **Professors**, **Authors**, **Librarians**, and **Admins**.
- **📖 E-Book Reading**: Integrated PDF viewer for digital loans.
- **🔄 Loan Management**: Complete cycle for borrowing, returning, and extending book loans.
- **🔒 Secure Authentication**: Email-based OTP (One-Time Password) login system.
- **📊 Real-time Dashboard**: Live statistics and status updates.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 (Custom Neumorphism Configuration)
- **State Management**: Context API
- **Testing**: Vitest, React Testing Library

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Testing**: Jest, Supertest

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/virtual-library.git
    cd virtual-library
    ```

2.  **Backend Setup**
    Navigate to the backend folder and install dependencies:
    ```bash
    cd backend
    npm install
    ```

    **Database Configuration:**
    We provide an interactive script to set up your database and environment variables automatically.
    ```bash
    node setup_database.js
    ```
    *Follow the on-screen prompts to enter your PostgreSQL credentials.*

    Start the server:
    ```bash
    npm start
    ```

3.  **Frontend Setup**
    Open a new terminal, navigate to the frontend folder:
    ```bash
    cd ../frontend
    npm install
    ```

    Start the development server:
    ```bash
    npm run dev
    ```

4.  **Access the App**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧪 Running Tests

We have comprehensive test coverage for both ends of the stack.

**Backend Integration Tests:**
```bash
cd backend
npm test
```

**Frontend Component Tests:**
```bash
cd frontend
npm test
```

## 📖 Documentation

Detailed documentation is available in the repository:
- [Architecture Overview](ARCHITECTURE.md) ([RO](ARCHITECTURE_RO.md))
- [User Guide](USER_GUIDE.md) ([RO](USER_GUIDE_RO.md))

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
