import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';

const Tasks = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);

  useEffect(() => {
    if (!user) return; // not logged in (for example after a page refresh)

    const fetchTickets = async () => {
      try {
        const response = await axiosInstance.get('/api/tickets', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setTickets(response.data);
      } catch (error) {
        alert('Failed to fetch tickets.');
      }
    };

    fetchTickets();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <p>Please log in to see your tickets.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <TaskForm
        tickets={tickets}
        setTickets={setTickets}
        editingTicket={editingTicket}
        setEditingTicket={setEditingTicket}
      />
      <TaskList tickets={tickets} setTickets={setTickets} setEditingTicket={setEditingTicket} />
    </div>
  );
};

export default Tasks;