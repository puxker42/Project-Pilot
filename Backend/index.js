const express = require('express');
const cors = require('cors');
const app = express();
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
const certificateRoutes = require('./routes/certificateRoutes');
const Routes = require("./routes/routes");

app.use('/api/v1', certificateRoutes);
app.use("/api/v1", Routes);


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

// Cron Job for Auto-Incrementing Student Years
const cron = require('node-cron');
const User = require('./models/User');

// Schedule task to run at 00:00 on June 15th
cron.schedule('0 0 15 6 *', () => {
    console.log("Running yearly student year increment task...");
    User.incrementStudentYears();
});

// Start the server (✅ Only once)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server Started!! at port ${PORT}`);
});
