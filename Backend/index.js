const express = require('express');
const cors = require('cors');  // Import CORS package
const app = express();

require("dotenv").config();
const PORT = process.env.PORT || 4000;  // Added `const` for PORT

// Enable CORS for all origins (or specify a list of allowed origins)
app.use(cors());  // Allow all origins for now, or use cors({ origin: 'http://localhost:3000' }) to allow only your frontend

// Middleware to parse JSON request bodies
// Middleware to parse JSON request bodies
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Import routes for API
const Routes = require("./routes/routes");
app.use("/api/v1", Routes);  // Mount your routes here

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global Error Handler
const errorHandler = require("./utils/errorHandler");
app.use(errorHandler);

// Connect the database
const dbConnect = require("./config/database");
dbConnect();

// Start the server (✅ Only once)
app.listen(PORT, () => {
    console.log(`Server Started!! at port ${PORT}`);
});
