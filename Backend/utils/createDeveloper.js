const mongoose = require("mongoose");
const User = require("../models/User");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createDeveloperUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB for seeding.");

        const developerID = 3142;

        // check if exists
        const existingUser = await User.findOne({ userID: developerID });
        if (existingUser) {
            console.log(`User with ID ${developerID} already exists.`);
            // Optionally update role if needed, but for now just exit or log
            if (existingUser.accountType !== "Developer") {
                console.log("Updating existing user to Developer role...");
                existingUser.accountType = "Developer";
                await existingUser.save();
                console.log("Updated.");
            }
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash("ABC@1234", 10);

        const developer = new User({
            firstName: "System",
            lastName: "Developer",
            email: "developer@projectpilot.com",
            userID: developerID,
            contactNumber: 0,
            password: hashedPassword,
            accountType: "Developer",
            image: "https://api.dicebear.com/5.x/initials/svg?seed=Dev",
            // Dummy values for required fields or specific schema needs if any
        });

        await developer.save();
        console.log("Developer user created successfully.");
        process.exit(0);

    } catch (error) {
        console.error("Error creating developer:", error);
        process.exit(1);
    }
};

createDeveloperUser();
