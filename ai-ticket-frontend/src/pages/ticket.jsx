import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user info from localStorage to check their role and ID
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/tickets/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
      } else {
        setError(data.message || "Failed to fetch ticket");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // --- NEW POLLING LOGIC ---
  useEffect(() => {
    // If the ticket is loaded and is in the initial pending state, start polling.
    if (ticket && ticket.status === "PENDING") {
      const intervalId = setInterval(() => {
        console.log("Polling for ticket updates...");
        fetchTicket(); // fetchTicket is now stable thanks to useCallback
      }, 5000); // Poll every 5 seconds

      // If the ticket status is no longer pending, clear the interval.
      // This check is inside the effect to re-evaluate when `ticket` changes.
      if (ticket.status !== "PENDING") {
        clearInterval(intervalId);
      }

      // Cleanup function to clear the interval when the component unmounts.
      return () => clearInterval(intervalId);
    }
  }, [ticket, fetchTicket]); // Rerun this effect if the ticket object or fetchTicket function changes.

  // --- NEW FUNCTION TO HANDLE STATUS UPDATE ---
  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/tickets/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        // Refresh the ticket details to show the new status
        setTicket(data.ticket);
      } else {
        setError(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong while updating status.");
    }
  };

  if (loading)
    return <div className="text-center mt-10">Loading ticket details...</div>;
  if (error)
    return <div className="text-center mt-10 alert alert-error">{error}</div>;
  if (!ticket) return <div className="text-center mt-10">Ticket not found</div>;

  // Determine if the current user can resolve the ticket
  const canResolve =
    user?.role === "admin" || ticket.assignedTo?._id === user?._id;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Ticket Details</h2>
        {/* --- NEW BUTTON --- */}
        {/* Show button only if the user is authorized and ticket is not already resolved */}
        {canResolve && ticket.status !== "RESOLVED" && (
          <button
            onClick={() => handleUpdateStatus("RESOLVED")}
            className="btn btn-success btn-sm"
          >
            Mark as Resolved
          </button>
        )}
      </div>

      <div className="card bg-base-300 shadow p-4 space-y-4">
        <h3 className="text-xl font-semibold">{ticket.title}</h3>
        <p>{ticket.description}</p>

        {ticket.status && (
          <>
            <div className="divider">Metadata</div>
            <p>
              <strong>Status:</strong>
              <span className="badge badge-primary ml-2">{ticket.status}</span>
            </p>
            {ticket.priority && (
              <p>
                <strong>Priority:</strong> {ticket.priority}
              </p>
            )}
            {ticket.relatedSkills?.length > 0 && (
              <p>
                <strong>Related Skills:</strong>{" "}
                {ticket.relatedSkills.join(", ")}
              </p>
            )}
            {ticket.helpfulNotes && (
              <div>
                <strong>Helpful Notes:</strong>
                <div className="prose max-w-none bg-base-100 p-2 rounded mt-2">
                  <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                </div>
              </div>
            )}
            {ticket.assignedTo && (
              <p>
                <strong>Assigned To:</strong> {ticket.assignedTo?.email}
              </p>
            )}
            {ticket.createdAt && (
              <p className="text-sm text-gray-500 mt-2">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
