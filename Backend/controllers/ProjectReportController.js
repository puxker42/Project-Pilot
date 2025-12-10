const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');
const Component = require('../models/Component');

/**
 * Generate a granular project report based on configuration
 * Method: POST
 * Route: /generate-project-report
 */
exports.generateProjectReport = async (req, res) => {
    try {
        const {
            filters = {},
            projectDetails = {},
            teamDetails = 'none', // none, id_only, id_prn, id_prn_name, id_name_contact_mobile, id_name_contact_all
            otherDetails = {}
        } = req.body;

        console.log("Generating Project Report with options:", JSON.stringify(req.body, null, 2));

        // 1. Build Query
        const query = {};

        // Status Filter
        if (filters.status) {
            if (filters.status === 'Completed') {
                query.isCompleted = true;
            } else if (filters.status === 'Ongoing') {
                query.isCompleted = false;
            }
        }

        // Type Filter
        if (filters.type && filters.type !== 'All') {
            query.type = filters.type;
        }

        // Batch Filter
        if (filters.batch && filters.batch !== 'All') {
            query.batch = Number(filters.batch);
        }

        // 2. Fetch Projects
        const projects = await Project.find(query)
            .populate('teamID')
            .populate('guideID')
            .lean();

        if (!projects || projects.length === 0) {
            return res.status(200).json({ success: true, count: 0, data: [] });
        }

        console.log(`Found ${projects.length} projects matching filters.`);

        // 3. Prepare Helper Maps for Bulk Data
        let usersMap = {};

        const validTeamLevels = ['id_prn', 'id_prn_name', 'id_name_contact_mobile', 'id_name_contact_all'];
        if (validTeamLevels.includes(teamDetails) || otherDetails.includeGuideDetails) {
            const userIdsToFetch = new Set();

            projects.forEach(p => {
                // Team Members
                if (validTeamLevels.includes(teamDetails) && p.teamID && p.teamID.members) {
                    p.teamID.members.forEach(m => userIdsToFetch.add(m.userID));
                }
                // Guide
                if (p.guideID && p.guideID.userID) {
                    userIdsToFetch.add(p.guideID.userID);
                }
            });

            if (userIdsToFetch.size > 0) {
                const users = await User.find({ userID: { $in: Array.from(userIdsToFetch) } }).lean();
                users.forEach(u => {
                    usersMap[u.userID] = u;
                });
            }
        }

        // 4. Construct Report Data
        const reportData = projects.map(p => {
            const row = {};

            // --- Project Details ---
            if (projectDetails.includeId) row.ID = p.ID;
            if (projectDetails.includeTitle) row.Title = p.title;
            if (projectDetails.includeDescription) row.Description = p.description || '';
            if (projectDetails.includeYear) {
                if (p.createdAt) {
                    row.Year = new Date(p.createdAt).getFullYear();
                } else {
                    row.Year = 'N/A';
                }
            }

            // Basic Status
            row.Status = p.isCompleted ? 'Completed' : 'Ongoing';
            row.Type = p.type;

            // --- Guide Details ---
            if (otherDetails.includeGuideDetails) {
                const guideUser = p.guideID ? usersMap[p.guideID.userID] : null;
                const guideName = p.guideID ? `${p.guideID.firstName} ${p.guideID.lastName}` : 'N/A';
                row.GuideName = guideName;

                if (guideUser) {
                    row.GuideContact = guideUser.contactNumber || 'N/A';
                    row.GuideEmail = guideUser.email || 'N/A';
                }
            }

            // --- Team Details ---
            if (teamDetails !== 'none' && p.teamID) {
                row.TeamID = p.teamID.teamName || 'Unknown Team';

                if (teamDetails !== 'id_only') {
                    const members = p.teamID.members || [];

                    const structuredMembers = members.map(m => {
                        const user = usersMap[m.userID] || {};
                        const memberObj = { Role: m.role || 'Member' };

                        if (teamDetails.includes('prn')) {
                            memberObj.PRN = m.userID;
                        }
                        if (teamDetails.includes('name')) {
                            memberObj.Name = user.firstName ? `${user.firstName} ${user.lastName}` : 'Unknown';
                        }
                        if (teamDetails.includes('contact')) {
                            memberObj.Mobile = user.contactNumber || 'N/A';
                        }
                        if (teamDetails.includes('all')) {
                            memberObj.Email = user.email || 'N/A';
                        }

                        return memberObj;
                    });

                    row.TeamMembers = structuredMembers;
                }
            }

            // --- Component Details ---
            if (otherDetails.includeComponents && p.components) {
                const structuredComps = p.components.map(c => ({
                    Name: c.name,
                    Qty: c.quantity,
                    Status: c.allReceived ? 'Received' : (c.accepted ? 'Accepted' : 'Pending')
                }));
                row.Components = structuredComps;
            }

            return row;
        });

        return res.status(200).json({
            success: true,
            count: reportData.length,
            data: reportData
        });

    } catch (error) {
        console.error("Error generating granular project report:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
