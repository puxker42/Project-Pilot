const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Team = require('./models/Team'); // Required for population
require('dotenv').config();

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useUnifiedTopology: true
        });
        console.log("DB Connected Successfully");
    } catch (err) {
        console.error("DB Connection issues", err);
        process.exit(1);
    }
};

const reproduce = async () => {
    await dbConnect();

    try {
        // Find a user who has projects
        const user = await User.findOne({ projects: { $exists: true, $not: { $size: 0 } } });

        if (!user) {
            console.log("No user found with projects.");
            process.exit(0);
        }

        console.log(`Testing with User ID (DB _id): ${user._id}`);
        console.log(`User Projects Array:`, user.projects);

        // Simulate getUserProjects logic
        const projects = await Project.find({ _id: { $in: user.projects } })
            .populate('guideID')
            .populate('teamID')


        console.log("Fetched Projects:", JSON.stringify(projects, null, 2));

        const formattedProjects = projects.map(p => ({
            title: p.title,
            ID: p.ID,
            description: p.description,
            components: p.components,
            team: p.teamID,
            status: p.status,
            isApproved: p.approved,
            projectGuide: p.guideID,
            createdAt: p.createdAt,
            reports: p.reports || []
        }));

        console.log("Formatted Projects:", JSON.stringify(formattedProjects, null, 2));

    } catch (error) {
        console.error("Error reproducing issue:", error);
    } finally {
        mongoose.disconnect();
    }
};

reproduce();
