import { useState, useEffect, useRef } from 'react';
import { Navigation, RefreshCw, AlertCircle, WifiOff, MapPin, Share2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LiveTracking = ({ bookingId }) => {
  const [location, setLocation] = useState({ lat: 18.5204, lng: 73.8567 }); // Default: Pune, MH
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [socketConnected, setSocketConnected] = useState(true);

  // Real GPS Simulation via HTML5 Geolocation / API
  useEffect(() => {
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLastUpdate(new Date());
        },
        (err) => console.log('Using default/fallback coordinates', err),
        { enableHighAccuracy: true }
      );
    }
    return () => navigator.geolocation.clearWatch(watchId);
  }, [bookingId]);

  const copyShareLink = () => {
    const link = `${window.location.origin}/tracking/${bookingId}`;
    navigator.clipboard.writeText(link);
    toast.success('Live Tracking Link Copied!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center space-x-3">
          <Navigation className="h-6 w-6 animate-spin-slow" />
          <div>
            <h3 className="font-bold text-lg">Real-Time GPS Tracking</h3>
            <p className="text-xs text-blue-100">Booking ID: #{bookingId || 'DEMO123'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-emerald-500 text-white font-medium px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> Live GPS
          </span>
          <button onClick={copyShareLink} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition" title="Share Link">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Interactive Map Wrapper (Embed OpenStreetMap) */}
        <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700 bg-gray-100">
          <iframe
            title="Real Location Map"
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01}%2C${location.lat - 0.01}%2C${location.lng + 0.01}%2C${location.lat + 0.01}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
          ></iframe>
          <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-1.5 rounded-lg shadow text-xs font-semibold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
          </div>
        </div>

        {/* Real-time Status Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-300 uppercase">Last Sync</p>
            <p className="text-base font-bold text-gray-800 dark:text-gray-100 mt-1">{lastUpdate.toLocaleTimeString()}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase">Speed / Movement</p>
            <p className="text-base font-bold text-gray-800 dark:text-gray-100 mt-1">42 km/h (In Transit)</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
            <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 uppercase">Estimated Arrival</p>
            <p className="text-base font-bold text-gray-800 dark:text-gray-100 mt-1">18 Mins</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;