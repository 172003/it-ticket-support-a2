import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import CommentThread from './CommentThread';

const STATUS_STYLES = {
  'Open': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  'Resolved': 'bg-green-100 text-green-800',
  'Closed': 'bg-gray-300 text-gray-800',
};

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const TicketList = ({ tickets, setTickets, setEditingTicket }) => {
  const { user } = useAuth();
  const [openCommentsId, setOpenCommentsId] = useState(null); // FR-08: which ticket's comments are shown

  const isAgent = user.role === 'Agent';

  // Only the ticket owner may close or reopen (the server enforces this too).
  const isOwner = (ticket) => String(ticket.createdBy?._id ?? ticket.createdBy) === String(user.id);

  // IT-83 (NFR-06): ticket content belongs to its End User owner, so only they see Edit and Delete.
  // The server returns 403 for anyone else (TC-22, TC-24, TC-27, TC-28).
  const canEditOrDelete = (ticket) => !isAgent && isOwner(ticket);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const handleDelete = async (ticketId) => {
    try {
      await axiosInstance.delete(`/api/tickets/${ticketId}`, authHeaders());
      setTickets(tickets.filter((ticket) => ticket._id !== ticketId));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete ticket.');
    }
  };

  // IT-83: Agents handle tickets by changing the status (e.g. to Resolved).
  // The response is not populated, so keep the existing createdBy (name shown to Agents).
  const changeStatus = async (ticketId, status) => {
    try {
      const response = await axiosInstance.put(`/api/tickets/${ticketId}`, { status }, authHeaders());
      setTickets(tickets.map((ticket) => (
        ticket._id === ticketId ? { ...response.data, createdBy: ticket.createdBy } : ticket
      )));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status.');
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
      {tickets.length === 0 && <p className="text-gray-500">{isAgent ? 'No tickets have been created yet.' : 'You have not created any tickets yet.'}</p>}
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
          {isAgent && ticket.createdBy?.name && (
            <p className="text-sm text-gray-500">Created by: {ticket.createdBy.name}</p>
          )}
          {ticket.resolvedAt && (
            <p className="text-sm text-gray-500">
              Resolved on: {new Date(ticket.resolvedAt).toLocaleDateString()}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center">
            {canEditOrDelete(ticket) && (
              <button
                onClick={() => setEditingTicket(ticket)}
                className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Edit
              </button>
            )}
            {isAgent && (
              <select
                value={ticket.status}
                onChange={(e) => changeStatus(ticket._id, e.target.value)}
                className="mr-2 p-2 border rounded"
                aria-label="Change status"
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setOpenCommentsId(openCommentsId === ticket._id ? null : ticket._id)}
              className="mr-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              {openCommentsId === ticket._id ? 'Hide comments' : 'Comments'}
            </button>
            {isOwner(ticket) && ticket.status === 'Resolved' && (
              <button
                onClick={() => changeState(ticket._id, 'close')}
                className="mr-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Close
              </button>
            )}
            {isOwner(ticket) && (ticket.status === 'Resolved' || ticket.status === 'Closed') && (
              <button
                onClick={() => changeState(ticket._id, 'reopen')}
                className="mr-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Reopen
              </button>
            )}
            {canEditOrDelete(ticket) && (
              <button
                onClick={() => handleDelete(ticket._id)}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            )}
          </div>
          {openCommentsId === ticket._id && <CommentThread ticketId={ticket._id} />}
        </div>
      ))}
    </div>
  );
};

export default TicketList;