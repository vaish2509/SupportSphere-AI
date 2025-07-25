import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// Import Components and Pages
import CheckAuth from "./components/check-auth.jsx";
import Navbar from "./components/navbar.jsx";
import LoginPage from "./pages/login.jsx";
import SignupPage from "./pages/signup.jsx";
import AdminPanel from "./pages/admin.jsx";
import Tickets from "./pages/tickets.jsx";
import TicketDetailsPage from "./pages/ticket.jsx";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <CheckAuth protectedRoute={true}>
              <Tickets />
            </CheckAuth>
          }
        />
        <Route
          path="/tickets/:id"
          element={
            <CheckAuth protectedRoute={true}>
              <TicketDetailsPage />
            </CheckAuth>
          }
        />
        <Route
          path="/admin"
          element={
            <CheckAuth protectedRoute={true}>
              <AdminPanel />
            </CheckAuth>
          }
        />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <CheckAuth protectedRoute={false}>
              <LoginPage />
            </CheckAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <CheckAuth protectedRoute={false}>
              <SignupPage />
            </CheckAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
