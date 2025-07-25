import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  let user = localStorage.getItem("user");
  if (user) {
    user = JSON.parse(user);
  }
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data and token from storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to the login page
    navigate("/login");
  };

  return (
    <div className="navbar bg-base-200">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          Ticket AI
        </Link>
      </div>
      <div className="flex gap-2 items-center">
        {!token ? (
          // Render these links if the user is not logged in
          <>
            <Link to="/signup" className="btn btn-sm">
              Signup
            </Link>
            <Link to="/login" className="btn btn-sm">
              Login
            </Link>
          </>
        ) : (
          // Render these elements if the user is logged in
          <>
            <p>Hi, {user?.email}</p>
            {/* Conditionally render the Admin link for admin users */}
            {user?.role === "admin" && (
              <Link to="/admin" className="btn btn-sm">
                Admin
              </Link>
            )}
            <button onClick={handleLogout} className="btn btn-sm">
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}
