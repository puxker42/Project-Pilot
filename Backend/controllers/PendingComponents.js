const Component = require('../models/Component');

exports.getPendingComponents = async (req, res) => {
    try {
        const pendingComponents = await Component.find({ issued: { $gt: 0 } });

        return res.status(200).json({
            success: true,
            data: pendingComponents
        });
    } catch (error) {
        console.error("Error fetching pending components:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pending components",
            error: error.message
        });
    }
};
