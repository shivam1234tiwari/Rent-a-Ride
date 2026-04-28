import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import VehicleListing from './pages/VehicleListing';
import VehicleDetails from './pages/VehicleDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ChatBot from './components/ChatBot';
import AdminPanel from './pages/AdminPanel';
import DriverPanel from './pages/DriverPanel';
import LiveTracking from './components/LiveTracking';
import RideSharing from './pages/RideSharing';
import UserQueries from './pages/UserQueries';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vehicles" element={<VehicleListing />} />
              <Route path="/vehicle/:id" element={<VehicleDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/driver/*" element={<DriverPanel />} />
              <Route path="/tracking/:bookingId" element={<LiveTracking />} />
              <Route path="/ride-sharing" element={<RideSharing />} />
              <Route path="/my-queries" element={<UserQueries />} />
            </Routes>
          </main>
          <Footer />
          <ChatBot />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;