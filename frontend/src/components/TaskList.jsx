import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const STATUS_STYLES = {
  'Open': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Closed': 'bg-gray-300 text-gray-800',
};

const TaskList = ({ tickets, setTickets, setEditingTicket }) => {
  const { user } = useAuth();

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const handleDelete = async (ticketId) => {
    try {
      await axiosInstance.delete(`/api/tickets/${ticketId}`, authHeaders());
      setTickets(tickets.filter((ticket) => ticket._id !== ticketId));
    } catch (error) {
      alert('Failed to delete ticket.');
    }
  };

  // FR-07: action is 'close' or 'reopen'. The server decides if it is allowed
  // (400 if the status or 7-day rule blocks it, 403 if it is not your ticket).
  const changeState = async (ticketId, action) => {
    try {
      const response = await axiosInstance.patch(`/api/tickets/${ticketId}/${action}`, {}, authHeaders());
      setTickets(tickets.map((ticket) => (ticket._id === ticketId ? response.data : ticket)));
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} ticket.`);
    }
  };

  return (
    <div>
      {tickets.length === 0 && <p className="text-gray-500">No tickets yet.</p>}
      {tickets.map((ticket) => (
        <div key={ticket._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <div className="flex justify-between items-start">
            <h2 className="font-bold">{ticket.title}</h2>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_STYLES[ticket.status] || ''}`}>
              {ticket.status}
            </span>
          </div>
          <p>{ticket.description}</p>
          <p className="text-sm text-gray-500">Priority: {ticket.priority}</p>
          {ticket.resolvedAt && (
            <p className="text-sm text-gray-500">
              Resolved on: {new Date(ticket.resolvedAt).toLocaleDateString()}
            </p>
          )}
          <div className="mt-2">
            <button
              onClick={() => setEditingTicket(ticket)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            {ticket.status === 'Resolved' && (
              <button
                onClick={() => changeState(ticket._id, 'close')}
                className="mr-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Close
              </button>
            )}
            {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
              <button
                onClick={() => changeState(ticket._id, 'reopen')}
                className="mr-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Reopen
              </button>
            )}
            <button
              onClick={() => handleDelete(ticket._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;