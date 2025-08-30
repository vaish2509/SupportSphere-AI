import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setError(data.error || "Failed to fetch users");
      }
    } catch (err) {
      setError("Error fetching users");
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setEditingUser(user.email);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", "),
    });
    setError(null);
    setSuccess(null);
  };

  const handleUpdate = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/update-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: editingUser,
            role: formData.role,
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update user");
        return;
      }
      
      setSuccess("User updated successfully!");
      // Instead of refetching all users, update the local state for a faster UI response.
      const updatedSkills = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.email === editingUser
            ? { ...u, role: formData.role, skills: updatedSkills }
            : u
        )
      );
      setEditingUser(null);
      setFormData({ role: "", skills: "" });
    } catch (err) {
      setError("Update failed");
    }
  };

  const filteredUsers = users.filter((user) => user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Panel - Manage Users</h1>
      
      {success && <div className="alert alert-success mb-4">{success}</div>}
      {error && <div className="alert alert-error mb-4">{error}</div>}

      <input
        type="text"
        className="input input-bordered w-full mb-6"
        placeholder="Search by email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {filteredUsers.map((user) => (
        <div
          key={user._id}
          className="bg-base-100 shadow rounded p-4 mb-4 border"
        >
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Current Role:</strong> {user.role}
          </p>
          <p>
            <strong>Skills:</strong>{" "}
            {user.skills && user.skills.length > 0
              ? user.skills.join(", ")
              : "N/A"}
          </p>

          {editingUser === user.email ? (
            <div className="mt-4 space-y-2">
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="text"
                placeholder="Comma-separated skills"
                className="input input-bordered w-full"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />

              <div className="flex gap-2">
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleUpdate}
                >
                  Save
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm mt-2"
              onClick={() => handleEditClick(user)}
            >
              Edit
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
