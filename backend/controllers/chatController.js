const ChatMessage = require('../models/ChatMessage');

// Simple AI chatbot responses
const chatbotResponses = {
  greeting: {
    patterns: ['hi', 'hello', 'hey', 'good morning', 'good evening'],
    response: "Namaste! Welcome to RentWheels! How can I help you with your vehicle rental today? 🚗",
  },
  booking: {
    patterns: ['book', 'rent', 'want to book', 'need a vehicle'],
    response: "I'd love to help you book a vehicle! Please tell me:\n1. What type of vehicle? (car/bike/truck/self-driving)\n2. Pickup date and location\n3. Dropoff date and location",
  },
  price: {
    patterns: ['price', 'cost', 'how much', 'rental price'],
    response: "Our prices vary by vehicle type and duration. A car starts from ₹1500/day, bike from ₹500/day, truck from ₹3000/day, and self-driving cars from ₹2000/day. Would you like specific pricing?",
  },
  driver: {
    patterns: ['driver', 'need driver', 'chauffeur'],
    response: "We offer professional drivers for all vehicles! Our drivers are verified, rated, and experienced. Driver charges start from ₹500/day. Would you like me to recommend a driver for you?",
  },
  cancellation: {
    patterns: ['cancel', 'cancellation', 'refund'],
    response: "Free cancellation up to 24 hours before pickup. Cancellation within 24 hours will incur a 50% charge. To cancel, please go to your dashboard > My Bookings.",
  },
  support: {
    patterns: ['help', 'support', 'issue', 'problem'],
    response: "I'm here to help! For immediate assistance:\n📞 Call: +91-XXXXXXXXXX\n📧 Email: support@rentwheels.com\n💬 Continue chatting with me for basic queries!",
  },
  tracking: {
    patterns: ['track', 'location', 'where is', 'live tracking'],
    response: "You can track your vehicle in real-time! Go to your active booking and click 'Live Track'. You'll see the vehicle's current location on the map.",
  },
  rideshare: {
    patterns: ['share ride', 'carpool', 'ride sharing', 'split cost'],
    response: "Yes! We offer ride sharing to reduce costs. You can share your ride with up to 3 others and split the rental cost. Enable 'Ride Sharing' while booking!",
  },
  pricing: {
    patterns: ['smart pricing', 'dynamic pricing', 'peak hour'],
    response: "Our smart pricing adjusts based on demand, peak hours, and seasons. Book in advance for best rates! Current prices reflect real-time demand.",
  },
  default: {
    response: "I'm still learning! For complex queries, please contact our support team. You can call us at +91-XXXXXXXXXX or email support@rentwheels.com"
  }
};

// Process user message and return AI response
const processMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const userId = req.user.id;
    
    // Convert message to lowercase for matching
    const lowerMessage = message.toLowerCase();
    
    // Find matching intent
    let intent = 'default';
    let response = chatbotResponses.default.response;
    
    for (const [key, value] of Object.entries(chatbotResponses)) {
      if (key !== 'default' && value.patterns.some(pattern => lowerMessage.includes(pattern))) {
        intent = key;
        response = value.response;
        break;
      }
    }
    
    // Save chat history
    const chatMessage = await ChatMessage.create({
      user: userId,
      sessionId,
      message,
      response,
      intent,
    });
    
    res.json({
      success: true,
      response,
      intent,
      messageId: chatMessage._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await ChatMessage.find({
      user: req.user.id,
      sessionId,
    }).sort({ timestamp: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  processMessage,
  getChatHistory,
};