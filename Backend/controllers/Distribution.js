const Project = require('../models/Project');
const User = require('../models/User');
const Team = require('../models/Team');
const sendMail = require('../utils/mailSender');
const StockLog = require('../models/StockLog');
const ProjectLog = require('../models/ProjectLog');
const jwt = require('jsonwebtoken');
const Component = require('../models/Component');

exports.addToSlot = async (req, res) => {
  try {
    const { projectID, slot, date } = req.body;

    if (!projectID || slot === undefined || !date) {
      return res.status(400).json({ message: 'projectID, slot, and date are required.' });
    }

    // Define slot value to time mapping
    const slotMap = {
      "-1": "ANY",
      "1": "11:00 - 12:00",
      "2": "13:00 - 14:00",
      "3": "14:00 - 15:00",
      "4": "15:00 - 16:00",
      "5": "16:00 - 17:00"
    };

    const slotTime = slotMap[slot.toString()] || "Unknown Time";

    // Update project slot
    const updatedProject = await Project.findByIdAndUpdate(
      projectID,
      {
        $set: {
          slot: {
            slotn: slot,
            date: new Date(date),
          },

          slotAssigned: true,
          status: 3
        },
      },
      { new: true }
    ).populate('teamID');

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const team = updatedProject.teamID;
    if (!team) {
      return res.status(404).json({ message: 'Team not associated with project.' });
    }

    const leadMember = team.members.find((member) => member.role === 'Lead');
    if (!leadMember) {
      return res.status(404).json({ message: 'No team lead found in the team.' });
    }

    const leadUser = await User.findOne({ userID: leadMember.userID });
    if (!leadUser) {
      return res.status(404).json({ message: 'Team lead user not found.' });
    }

    const subject = 'Slot Assigned for Component Reception';
    const body = `
      <p>Dear ${leadUser.firstName},</p>
      <p>The slot for your component reception for the project <strong>${updatedProject.title}</strong> (ID: ${updatedProject.ID}) has been assigned.</p>
      <p><strong>Slot Time:</strong> ${slotTime}<br/>
         <strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
      <p>Please visit the component reception desk on time and collect your components.</p>
      <br/>
      <p>Regards,<br/>Project Management Team</p>
    `;

    await sendMail(leadUser.email, subject, body);



    // Log Slot Project
    const log = new ProjectLog({
      projectID: updatedProject.ID,
      action: 'SLOT_ASSIGNED',
      message: `Slot ${slotTime} (${new Date(date).toLocaleDateString()}) assigned`,
      actor: req.user ? req.user.userId : 'System',
      remark: 'Slot assignment'
    });
    await log.save();

    res.status(200).json({
      message: 'Slot assigned successfully and mail sent to team lead.',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Error assigning slot:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};



exports.checkInVerify = async (req, res) => {
  console.log("Inside CheckInVerify");
  try {
    // Accept either { updatedProject } or the project directly
    const body = req.body || {};
    const updatedProject = body.updatedProject || body;

    if (!updatedProject || !updatedProject._id) {
      console.warn("Bad request body for checkInVerify:", body);
      return res.status(400).json({
        message: 'updatedProject with valid _id is required in request body. Accepts either { updatedProject: {...} } or the project object directly.'
      });
    }

    // teamID might be an ObjectId/string or a populated object with members
    let teamDoc = null;
    const teamRef = updatedProject.teamID;

    if (!teamRef) {
      return res.status(400).json({ message: 'Team ID missing from updatedProject.teamID' });
    }

    // If teamRef looks like a populated object with members, use it directly
    if (typeof teamRef === 'object' && teamRef.members && Array.isArray(teamRef.members)) {
      teamDoc = teamRef;
    } else {
      // Otherwise teamRef is likely an ObjectId/string, fetch team doc
      try {
        teamDoc = await Team.findById(teamRef).lean();
      } catch (err) {
        console.warn("Error fetching Team by ID:", teamRef, err);
        teamDoc = null;
      }
    }

    if (!teamDoc || !Array.isArray(teamDoc.members)) {
      console.warn("Team not found or has no members. teamRef:", teamRef, "teamDoc:", teamDoc);
      return res.status(404).json({ message: 'Team not found or team has no members.' });
    }

    const leadMember = teamDoc.members.find((member) => member.role === 'Lead');
    if (!leadMember || !leadMember.userID) {
      return res.status(404).json({ message: 'No team lead found in the team.' });
    }

    const leadUser = await User.findOne({ userID: leadMember.userID }).lean();
    if (!leadUser) {
      console.warn(`Team lead user with userID ${leadMember.userID} not found.`);
      return res.status(404).json({ message: 'Team lead user not found.' });
    }

    // Generate token with 20 min expiry
    const token = jwt.sign(
      { project: updatedProject },
      process.env.JWT_SECRET,
      { expiresIn: '20m' }
    );

    const FRONT_BASE = process.env.FRONT_BASE;
    const acknowledgementURL = `${FRONT_BASE}/student/acknowledgement/${updatedProject._id}/${token}`;

    const subject = 'Acknowledge Your Component Collection Slot';
    const bodyHtml = `
      <p>Dear ${leadUser.firstName},</p>
      <p>This is a reminder to acknowledge your component collection slot for the project 
         <strong>${updatedProject.title}</strong> (ID: ${updatedProject.ID}).</p>
      <p>Kindly confirm your acknowledgment by clicking the link below:</p>
      <p><a href="${acknowledgementURL}">Acknowledge Slot</a> (valid for 20 minutes)</p>
      <br/>
      <p>If you do not acknowledge within the given time, you may need to re-initiate the verification.</p>
      <br/>
      <p>Regards,<br/>Project Management Team</p>
    `;

    await sendMail(leadUser.email, subject, bodyHtml);
    console.log("📧 Mail sent to lead:", leadUser.email);

    // Polling for ack (existing logic)
    const maxWaitTime = 20 * 60 * 1000; // 20 minutes
    const pollInterval = 5000; // 5 seconds
    const start = Date.now();

    while (Date.now() - start < maxWaitTime) {
      const latestProject = await Project.findById(updatedProject._id).lean();
      console.log("🔄 Polling... current ack =", latestProject?.ack);

      if (latestProject?.ack === 1) {
        return res.status(200).json({
          success: true,
          message: 'Acknowledgement received successfully.',
          ackk: true
        });
      }

      if (latestProject?.ack === 0) {
        return res.status(200).json({
          success: true,
          message: 'Acknowledgement rejected',
          ackk: false
        });
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    // Timeout
    return res.status(408).json({
      success: false,
      message: 'Timed out waiting for acknowledgement. Please try again.',
    });

  } catch (error) {
    console.error('❌ Error in checkInVerify:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

exports.getTokenProject = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token missing or malformed' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.project) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    return res.status(200).json({ project: decoded.project });

  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired', error: error.message });
  }
};


exports.updateDelivery = async (req, res) => {
  try {
    const { updatedProject, denied } = req.body;

    if (!updatedProject || !updatedProject._id) {
      return res.status(400).json({ message: 'Updated project data is required.' });
    }

    const ackValue = denied ? 0 : 1;

    // ✅ Step 1: Always update ack first
    const project = await Project.findByIdAndUpdate(
      updatedProject._id,
      { ack: ackValue },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // ✅ Step 2: If denied, stop here
    if (denied) {
      return res.status(200).json({ message: 'Delivery denied. Only ack updated.', project });
    }

    // ✅ Step 3: Update other parts of the project safely
    const updatedFields = {};

    if (updatedProject.components) {
      updatedFields.components = updatedProject.components;
    }

    if (updatedProject.status) {
      updatedFields.status = updatedProject.status;
    }

    // Force status update if delivery is acknowledged
    if (!denied) {
      updatedFields.status = 4;
    }

    if (updatedProject.remarks) {
      updatedFields.remarks = updatedProject.remarks;
    }

    // add any other fields you want to allow updating safely

    const finalProject = await Project.findByIdAndUpdate(
      updatedProject._id,
      updatedFields,
      { new: true }
    );

    // ✅ Step 4: Adjust inventory quantities
    const allComponents = await Component.find({});
    for (const projComp of updatedProject.components || []) {
      const comID = projComp.id;
      const receivedQty = projComp.fullfilledQty || 0;

      if (!comID || receivedQty <= 0) continue;

      const inventoryComp = allComponents.find(comp => comp.cID === comID);
      if (inventoryComp) {
        inventoryComp.qnty = Math.max(0, inventoryComp.qnty - receivedQty);
        inventoryComp.issued = (inventoryComp.issued || 0) + receivedQty;
        //Stock Log
        const stockLog = new StockLog({
          componentID: comID,
          source: 'Stock',
          destination: finalProject.ID || 'Project',
          type: 'OUT',
          quantity: receivedQty,
          remark: `Component ${comID} checked out for project ${finalProject.ID}`
        });
        await stockLog.save();
        await inventoryComp.save();
      }
    }

    // Log Delivery
    const log = new ProjectLog({
      projectID: finalProject.ID,
      action: denied ? 'DELIVERY_DENIED' : 'DELIVERY_ACKNOWLEDGED',
      message: denied ? 'Delivery denied by user' : 'Delivery verified and inventory updated',
      actor: req.user ? req.user.userId : 'System',
      remark: 'Distribution'
    });
    await log.save();

    return res.status(200).json({
      message: 'Delivery acknowledged. Project and inventory updated.',
      project: finalProject,
    });

  } catch (error) {
    console.error('❌ Error in updateDelivery:', error);
    return res.status(500).json({
      message: 'Failed to process delivery update.',
      error: error.message,
    });
  }
};

