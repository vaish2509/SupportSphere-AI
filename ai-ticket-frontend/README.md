# SupportSphere-AI Frontend

This is the frontend for SupportSphere-AI, an intelligent, AI-powered customer support ticket management system. This frontend is built with React and Vite, providing a fast, modern, and responsive user interface.

## Overview

The SupportSphere-AI frontend provides a user-friendly interface for both customers and administrators. Users can sign up, log in, create new support tickets, and view their existing tickets. Administrators have access to a dashboard to view and manage all user tickets.

## Features

*   **User Authentication:** Secure user registration and login.
*   **Ticket Creation:** A simple form for users to create new support tickets.
*   **User Ticket Dashboard:** Users can view the status and history of their submitted tickets.
*   **Admin Dashboard:** Administrators can view, search, and manage all tickets in the system.
*   **Responsive Design:** The application is designed to work on various screen sizes, including desktops, tablets, and mobile devices.

## Technologies Used

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool and development server for modern web projects.
*   **React Router:** For handling routing within the application.
*   **Axios:** For making HTTP requests to the backend API.

## Getting Started

Follow these instructions to get the frontend up and running on your local machine.

### Prerequisites

*   Node.js and npm (or yarn)
*   Git

### Installation

1.  **Clone the repository (if you haven't already):**
    ```bash
    git clone https://github.com/your-username/SupportSphere-AI.git
    cd SupportSphere-AI/ai-ticket-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Configuration

The frontend needs to know the URL of the backend API.

1.  Create a `.env` file in the `ai-ticket-frontend` directory.
2.  Add the following environment variable to the `.env` file, replacing the URL with your actual backend server URL:
    ```
    VITE_API_URL=http://localhost:5000
    ```

### Running the Development Server

Once the dependencies are installed and the configuration is set, you can start the development server:

```bash
npm run dev
```

The frontend will be accessible at `http://localhost:5173` (or another port if 5173 is busy).

## Connecting to the Backend

This frontend is designed to work with the `ai-ticket-assistant` backend. Ensure the backend server is running and the `VITE_API_URL` in the `.env` file is pointing to the correct backend URL. All API requests from the frontend will be sent to this URL.

## Deployment

The frontend is ready to be deployed to a static hosting service like Vercel or Netlify.

When deploying to Vercel, you will need to configure the environment variables (like `VITE_API_URL`) in the Vercel project settings.