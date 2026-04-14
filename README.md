# CampusRide 🚗

CampusRide is a modern, campus-based ride-sharing web application designed to help college students offer and find rides within and around their campus. It aims to reduce travel costs, improve convenience, and foster a community-based travel environment.

---

## 🎯 Objectives
- **Secure Platform**: Provide a simple and secure way for students to share rides.
- **Cost Efficiency**: Reduce dependency on external transport services and save money.
- **Community Building**: Encourage peer-to-peer travel within the college ecosystem.

---

## ✨ Key Features
- **User Authentication**: Secure signup/login system with JWT-based sessions.
- **Offer a Ride**: Drivers can offer rides with details like pickup/drop-off points, time, available seats, and price.
- **Find Rides**: Riders can search for available rides using various filters.
- **Real-time Tracking**: Live location tracking for drivers and riders using Leaflet.js and Socket.io.
- **Booking Management**: Seamless booking flow with seat availability checks and history.
- **Responsive UI**: A modern dashboard that fits both desktop and mobile screens.

---

## 🛠️ Technology Stack
### Frontend
- **Framework**: Vite + React
- **Styling**: Bootstrap & Custom CSS for modern aesthetics
- **Animations**: Framer Motion
- **Maps & Tracking**: Leaflet.js, React Leaflet
- **Communication**: Socket.io-client for real-time updates

### Backend
- **Environment**: Node.js & Express
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS
- **Real-time**: Socket.io for live event handling

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB account (local or Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/campusride.git
cd campusride
```

### 2. Server Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```
Run the server:
```bash
npm run dev
```

### 3. Client Setup
```bash
cd ../client
npm install
```
Run the client:
```bash
npm run dev
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
