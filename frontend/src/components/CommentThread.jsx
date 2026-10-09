import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

// FR-08: comment thread for one ticket.
// Usage on the ticket detail page: <CommentThread ticketId={ticket._id} />
const CommentThread = ({ ticketId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const headers = { Authorization: `Bearer ${user?.token}` };

  const loadComments = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/api/tickets/${ticketId}/comments`, { headers });
      setComments(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load comments.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, user?.token]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('Comment cannot be empty.');
      return;
    }
    if (trimmed.length > 1000) {
      setError('Comment must be 1000 characters or fewer.');
      return;
    }
    setSending(true);
    try {
      await axiosInstance.post(`/api/tickets/${ticketId}/comments`, { text: trimmed }, { headers });
      setText('');
      setError('');
      await loadComments();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post comment.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Loading comments...</p>;

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold mb-2">Comments</h2>

      {comments.length === 0 && !error && (
        <p className="text-sm text-gray-500 mb-2">No comments yet.</p>
      )}

      <ul className="mb-4">
        {comments.map((c) => (
          <li key={c._id} className="border rounded p-2 mb-2">
            <p className="text-sm font-medium">
              {c.author?.name || 'Unknown'}{' '}
              <span className="text-xs text-gray-500">({c.authorRole})</span>
            </p>
            <p className="text-sm whitespace-pre-wrap">{c.text}</p>
            <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full border rounded p-2 mb-1"
          rows={3}
          maxLength={1000}
          placeholder="Write a comment"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="text-xs text-gray-400 mb-2">{text.length}/1000</p>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-40"
        >
          {sending ? 'Posting...' : 'Post comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentThread;
