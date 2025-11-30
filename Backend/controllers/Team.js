const Team = require('../models/Team');
const User = require('../models/User'); // Optional: For checking user existence

exports.createTeam = async (req, res) => {
  try {
    const { teamName, teamID, members } = req.body;

    if (!teamName || !teamID || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ success: false, message: 'Incomplete team data.' });
    }

    // Optionally: check if teamID already exists
    const existingTeam = await Team.findOne({ teamID });
    if (existingTeam) {
      return res.status(409).json({ success: false, message: 'Team ID already exists.' });
    }

    // Optionally validate userIDs
    const validMembers = await Promise.all(members.map(async (member) => {
      const id = member.userID;
        const userExists = await User.findOne({userID: id});
        // console.log(userExists);
      if (!userExists) throw new Error(`User ID ${member.userID} not found`);
      return {
        userID: userExists.userID,
        role: member.role === 'Lead' ? 'Lead' : 'Member'
      };
    }));

    const leadU = validMembers
  .filter(member => member.role === 'Lead')
  .map(lead => lead.userID);
  
  const leadUser = await User.findOne({userID:leadU});
  // console.log(leadUser, leadUser.batch);
    const newTeam = await Team.create({
      teamName,
      teamID,
      members: validMembers,
      batch:leadUser.batch
    });
    console.log(newTeam);
    res.status(201).json({ 
      success: true,
      message: 'Team created successfully!',
      data: newTeam
    });

  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
  }
};

const jwt = require("jsonwebtoken");

exports.getMyTeams = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token not provided" });
    }

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.userId;

    // Get user to fetch `userID` (since Team.members.userID is a number, not _id)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Find teams where this user is a member
    const teams = await Team.find({ 'members.userID': user.userID });

    return res.status(200).json({
      success: true,
      teams,
    });
  } catch (error) {
    console.error("Error in getMyTeams:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching teams",
    });
  }
};
