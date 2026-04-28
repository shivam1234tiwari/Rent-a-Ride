import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserQueries = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [newQuery, setNewQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchQueriesAndBookings();
  }, []);

  const fetchQueriesAndBookings = async () => {
    try {
      const [queriesRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/queries/my-queries`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/bookings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setQueries(queriesRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load queries');
    } finally {
      setLoading(false);
    }
  };

  const submitQuery = async (e) => {
    e.preventDefault();
    if (!newQuery.trim()) {
      toast.error('Please enter your query');
      return;
    }
    if (!selectedBooking) {
      toast.error('Please select a booking');
      return;
    }

    try {
      await axios.post(`${API_URL}/queries/submit`, {
        bookingId: selectedBooking,
        query: newQuery,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Query submitted successfully');
      setNewQuery('');
      fetchQueriesAndBookings();
    } catch (error) {
      toast.error('Failed to submit query');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="pt-20 pb-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Support Queries</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Submit and track your support requests
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Query Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
              Submit a Query
            </h2>
            <form onSubmit={submitQuery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Booking</label>
                <select
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  value={selectedBooking}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                  required
                >
                  <option value="">Select a booking</option>
                  {bookings.map((booking) => (
                    <option key={booking._id} value={booking._id}>
                      {booking.vehicle?.name} - {new Date(booking.startDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Your Question</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                  placeholder="Describe your issue or question..."
                  value={newQuery}
                  onChange={(e) => setNewQuery(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
                <span>Submit Query</span>
              </button>
            </form>
          </div>

          {/* Query History */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Query History
            </h2>
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {queries.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No queries submitted yet</p>
                </div>
              ) : (
                queries.map((query) => (
                  <div key={query._id} className="border dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          query.status === 'resolved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {query.status === 'resolved' ? (
                            <CheckCircle className="h-3 w-3 inline mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 inline mr-1" />
                          )}
                          {query.status || 'Pending'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(query.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 mb-3">{query.query}</p>
                    {query.response && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mt-2">
                        <p className="text-sm font-medium text-blue-600 mb-1">Response:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{query.response}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Need Immediate Help?</h3>
            <p className="mb-3">Contact our support team directly</p>
            <div className="flex justify-center space-x-6">
              <div>
                <p className="text-sm opacity-90">📞 Phone</p>
                <p className="font-semibold">+91-XXXXXXXXXX</p>
              </div>
              <div>
                <p className="text-sm opacity-90">✉️ Email</p>
                <p className="font-semibold">support@rentwheels.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserQueries;