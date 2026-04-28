import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Only import socket.io-client if available
let io;
try {
  io = require('socket.io-client');
} catch (e) {
  console.warn('socket.io-client not installed, live tracking will use polling only');
}

const LiveTracking = ({ bookingId, vehicleId, driverId }) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isTracking, setIsTracking] = useState(true);
  const [error, setError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection only if io is available
    if (io) {
      try {
        const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        socketRef.current = io(SOCKET_URL);
        
        socketRef.current.on('connect', () => {
          console.log('Socket connected for live tracking');
          setSocketConnected(true);
        });
        
        // Join booking room
        if (bookingId) {
          socketRef.current.emit('join-booking', bookingId);
        }
        
        // Listen for location updates
        socketRef.current.on('location-update', (data) => {
          if (data.bookingId === bookingId) {
            setLocation(data.location);
            setLastUpdate(new Date(data.timestamp));
          }
        });
        
        socketRef.current.on('disconnect', () => {
          console.log('Socket disconnected');
          setSocketConnected(false);
        });
      } catch (err) {
        console.error('Socket connection error:', err);
        setSocketConnected(false);
      }
    }
    
    fetchInitialLocation();
    
    // Set up polling as fallback (every 15 seconds)
    const interval = setInterval(() => {
      if (!socketConnected) {
        fetchLocationPolling();
      }
    }, 15000);
    
    return () => {
      clearInterval(interval);
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [bookingId]);

  const fetchInitialLocation = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/bookings/${bookingId}/track`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLocation(data.currentLocation);
      setLastUpdate(new Date(data.lastUpdate));
      setError(null);
    } catch (error) {
      console.error('Error fetching location:', error);
      setError('Unable to fetch vehicle location');
      toast.error('Failed to get vehicle location');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationPolling = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/bookings/${bookingId}/track`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (data.currentLocation) {
        setLocation(data.currentLocation);
        setLastUpdate(new Date(data.lastUpdate));
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  const refreshLocation = () => {
    fetchInitialLocation();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Live Vehicle Tracking</h3>
          </div>
          <div className="flex items-center space-x-2">
            {socketConnected && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                Live
              </span>
            )}
            <button
              onClick={refreshLocation}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              <RefreshCw className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={refreshLocation}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Map Placeholder - In production, integrate Google Maps */}
            <div className="relative h-80 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-blue-600 mx-auto mb-3 animate-pulse" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">
                    Live Location
                  </p>
                  {location && (
                    <div className="mt-3 text-sm text-gray-500">
                      <p>Latitude: {location.lat?.toFixed(6)}</p>
                      <p>Longitude: {location.lng?.toFixed(6)}</p>
                    </div>
                  )}
                  {isTracking && socketConnected && (
                    <p className="text-xs text-green-600 mt-3 flex items-center justify-center">
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Live Tracking Active
                    </p>
                  )}
                  {!socketConnected && (
                    <p className="text-xs text-yellow-600 mt-3 flex items-center justify-center">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Polling mode (updates every 15s)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Tracking Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Update</p>
                <p className="font-semibold">
                  {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Not available'}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Tracking Status</p>
                <p className="font-semibold text-green-600 flex items-center">
                  <span className="relative flex h-3 w-3 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  {socketConnected ? 'Real-time' : 'Polling'}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Update Frequency</p>
                <p className="font-semibold">
                  {socketConnected ? 'Real-time' : 'Every 15 seconds'}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                This is a simulated tracking view. In production, integrate Google Maps for real-time tracking.
              </p>
            </div>

            {/* Share tracking link */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Share tracking link:</p>
              <code className="text-xs break-all bg-gray-100 dark:bg-gray-800 p-2 rounded block">
                {window.location.origin}/tracking/{bookingId}
              </code>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveTracking;