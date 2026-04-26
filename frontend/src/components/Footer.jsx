import { Link } from 'react-router-dom';
import { Car, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">RentWheels</span>
            </div>
            <p className="text-gray-400">
              Your trusted partner for premium vehicle rentals. Quality cars, affordable prices.
            </p>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-blue-400 transition">Home</Link></li>
              <li><Link to="/vehicles" className="text-gray-400 hover:text-blue-400 transition">Vehicles</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-blue-400 transition">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-blue-400 transition">Contact</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Terms & Conditions</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-blue-400 transition">Cancellation Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-5 w-5" />
                <span>123 Rental Street, City</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-5 w-5" />
                <span>+1 234 567 890</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>info@rentwheels.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 RentVehi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;