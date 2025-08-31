# SupportSphere-AI

SupportSphere-AI is an intelligent, AI-powered customer support ticket management system designed to streamline and automate customer service workflows. This project provides a robust backend built with Node.js and a modern, responsive frontend using React.

## Key Features

*   **AI-Powered Ticket Analysis:** Automatically categorizes and prioritizes incoming support tickets.
*   **Smart Response Suggestions:** Provides AI-generated response suggestions to support agents.
*   **User and Admin Dashboards:** Separate interfaces for users to create tickets and for admins to manage them.
*   **Secure Authentication:** JWT-based authentication for secure access to the application.
*   **Email Notifications:** Sends email notifications on user signup and ticket creation.

## Use Cases in Different Sectors

SupportSphere-AI is versatile and can be adapted for various industries:

*   **E-commerce:** Manage customer queries about orders, shipping, returns, and product information.
*   **IT Support:** Handle internal IT helpdesk requests, track software bugs, and manage incidents.
*   **Healthcare:** Assist patients with appointment scheduling, billing questions, and general inquiries in a secure manner.
*   **Education:** Support students and faculty with technical issues, course registration problems, and other administrative requests.
*   **Financial Services:** Manage client inquiries about accounts, transactions, and other financial products.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   Node.js and npm
*   Git

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/SupportSphere-AI.git
    cd SupportSphere-AI
    ```

2.  **Setup the Backend (`ai-ticket-assistant`):**
    ```bash
    cd ai-ticket-assistant
    npm install
    ```
    *   Create a `.env` file in the `ai-ticket-assistant` directory and add the necessary environment variables (e.g., `PORT`, `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`).

3.  **Setup the Frontend (`ai-ticket-frontend`):**
    ```bash
    cd ../ai-ticket-frontend
    npm install
    ```
    *   Create a `.env` file in the `ai-ticket-frontend` directory and add the backend API URL (e.g., `VITE_API_URL=http://localhost:5000`).

### Running the Project

1.  **Start the Backend:**
    ```bash
    cd ai-ticket-assistant
    npm start
    ```
    The backend server will be running on `http://localhost:5000` (or the port you specified in your `.env` file).

2.  **Start the Frontend:**
    ```bash
    cd ai-ticket-frontend
    npm run dev
    ```
    The frontend development server will be running on `http://localhost:5173`.

## Deployment

The frontend is intended to be deployed on **Vercel**, and the backend on **Render**.

### Production Links

Once deployed, the production links will be added here:

*   **Frontend (Vercel):** `[PASTE YOUR FRONTEND URL HERE]`
*   **Backend (Render):** `[PASTE YOUR BACKEND URL HERE]`
