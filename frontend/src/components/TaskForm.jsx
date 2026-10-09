import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const EMPTY_FORM = { title: '', description: '', priority: 'Medium' };

const TaskForm = ({ tickets, setTickets, editingTicket, setEditingTicket }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    if (editingTicket) {
      setFormData({
        title: editingTicket.title,
        description: editingTicket.description || '',
        priority: editingTicket.priority || 'Medium',
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [editingTicket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${user.token}` };
    try {
      if (editingTicket) {
        // End Users may only change title and description (the server rejects priority changes).
        const response = await axiosInstance.put(
          `/api/tickets/${editingTicket._id}`,
          { title: formData.title, description: formData.description },
          { headers }
        );
        setTickets(tickets.map((ticket) => (ticket._id === response.data._id ? response.data : ticket)));
      } else {
        const response = await axiosInstance.post('/api/tickets', formData, { headers });
        setTickets([...tickets, response.data]);
      }
      setEditingTicket(null);
      setFormData(EMPTY_FORM);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save ticket.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingTicket ? 'Edit Ticket' : 'Add Ticket'}</h1>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      {!editingTicket && (
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      )}
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingTicket ? 'Update Ticket' : 'Add Ticket'}
      </button>
    </form>
  );
};

export default TaskForm;
