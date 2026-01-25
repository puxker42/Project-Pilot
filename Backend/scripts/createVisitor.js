const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Profile = require("../models/Profile");
require("dotenv").config({ path: "../.env" }); // Adjust path to .env

const dbConnect = require("../config/database");

const createVisitor = async () => {
    try {
        await dbConnect();

        const visitorID = 9878;
        const email = "visitor@projectpilot.com"; // Dummy email
        const password = "ABC@1234";

        // Check if visitor already exists
        const existingUser = await User.findOne({ userID: visitorID });
        if (existingUser) {
            console.log("Visitor user already exists.");
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Profile
        const profile = await Profile.create({
            gender: null,
            about: "Visitor Account",
            dateOfBirth: null,
            contactNo: null,
        });

        // Create User
        await User.create({
            firstName: "Visitor",
            lastName: "Guest",
            userID: visitorID,
            email: email,
            password: hashedPassword,
            accountType: "Visitor",
            contactNumber: 0, // Dummy
            additionalDetail: profile._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=Visitor`,
            isVerified: true
        });

        console.log("Visitor user created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error creating visitor user:", error);
        process.exit(1);
    }
};

createVisitor();
