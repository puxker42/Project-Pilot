const mongoose = require('mongoose');

// Import all models
const User = require('../models/User');
const Project = require('../models/Project');
const Component = require('../models/Component');
const Team = require('../models/Team');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const ProjectLog = require('../models/ProjectLog');
const StockLog = require('../models/StockLog');
const GlobalHistory = require('../models/GlobalHistory');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const Controls = require('../models/Controls');
const ReqTable = require('../models/ReqTable');
const MidOrder = require('../models/MidOrder');

// Map model names to actual Mongoose models
const stringToModel = {
    "User": User,
    "Project": Project,
    "Component": Component,
    "Team": Team,
    "Cart": Cart,
    "Order": Order,
    "Vendor": Vendor,
    "ProjectLog": ProjectLog,
    "StockLog": StockLog,
    "GlobalHistory": GlobalHistory,
    "OTP": OTP,
    "Profile": Profile,
    "Controls": Controls,
    "ReqTable": ReqTable,
    "MidOrder": MidOrder
};

exports.getModelData = async (req, res) => {
    try {
        const { modelName } = req.params;

        // Check if model exists in our map
        const Model = stringToModel[modelName];

        if (!Model) {
            return res.status(400).json({
                success: false,
                message: `Model '${modelName}' not found or not exposed.`
            });
        }

        // Fetch all data
        // For large datasets, pagination would be ideal, but for "full reflection" we'll try to fetch all 
        // or limit to a reasonable high number if it crashes.
        // Sorting by newest first is generally helpful for logs.
        const data = await Model.find({}).sort({ createdAt: -1, _id: -1 }).limit(1000); // hard limit 1000 for safety

        return res.status(200).json({
            success: true,
            model: modelName,
            count: data.length,
            data: data
        });

    } catch (error) {
        console.error("Error fetching model data:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error during data fetch."
        });
    }
};

exports.getAvailableModels = (req, res) => {
    try {
        const models = Object.keys(stringToModel);
        res.status(200).json({
            success: true,
            models: models
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching model list" });
    }
};
