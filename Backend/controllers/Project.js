const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const Component = require("../models/Component");
const Team = require("../models/Team");
const { getMidOrder } = require("./Components");
const ReqTable = require('../models/ReqTable');
const StockLog = require('../models/StockLog');
const ProjectLog = require('../models/ProjectLog');
exports.createProject = async (req, res) => {
  try {
    const { ID, type, title, description, components, teamID, guideID } = req.body;

    // Step 1: Validate required fields
    if (!title || !ID || !teamID || !components || !guideID) {
      return res.status(400).json({ message: "Some fields are missing!" });
    }

    // Step 2: Check if project already exists
    const existingProject = await Project.findOne({ ID });
    if (existingProject) {
      return res.status(409).json({ message: "Project ID already exists." });
    }

    // Step 3: Fetch Team document
    const teamDoc = await Team.findOne({ teamID: teamID });
    if (!teamDoc) {
      return res.status(400).json({ message: "Invalid team ID." });
    }

    const memberUserIDs = teamDoc.members.map(member => member.userID); // These are Numbers

    // Step 4: Fetch User documents for team members
    const teamUsers = await User.find({ userID: { $in: memberUserIDs } });
    if (teamUsers.length !== memberUserIDs.length) {
      return res.status(400).json({ message: "Some team members are invalid." });
    }

    // Step 5: Validate all team members are Students
    const nonStudent = teamUsers.find(user => user.accountType !== "Student");
    if (nonStudent) {
      return res.status(400).json({
        message: `User ${nonStudent.userID} is not a Student.`
      });
    }

    // Step 6: Ensure all team members have completed their existing projects
    for (const user of teamUsers) {
      const userProjects = await Project.find({
        _id: { $in: user.projects },
        isCompleted: false
      });

      if (userProjects.length > 0) {
        return res.status(400).json({
          message: `User ${user.userID} is already part of an ongoing project and must finish it before starting a new one.`
        });
      }
    }

    const teamUserObjectIds = teamUsers.map(user => user._id); // Needed for Project.team field

    // Step 6: Validate project guide
    const guideDoc = await User.findOne({ userID: guideID });
    if (!guideDoc) {
      return res.status(400).json({ message: "Invalid guide ID." });
    }
    if (guideDoc.accountType !== "Instructor") {
      return res.status(400).json({ message: "Guide must be an Instructor." });
    }

    const lead = teamDoc.members.find(member => member.role === 'Lead');
    const leadUser = await User.findOne({ userID: lead.userID });

    // Step 8: Create Project
    const newProject = new Project({
      title,
      ID,
      type,
      description,
      components,
      teamID: teamDoc._id,
      guideID: guideDoc._id,
      batch: leadUser.batch
    });


    const savedProject = await newProject.save();

    // Step 9: Update Team with new project reference
    teamDoc.projects.push(savedProject._id);
    await teamDoc.save();

    for (const user of teamUsers) {
      user.projects.push(savedProject._id);
      await user.save();
    }

    // Step 10: Update guide's project list
    guideDoc.projects.push(savedProject._id);
    await guideDoc.save();

    // Log Project Creation
    const log = new ProjectLog({
      projectID: savedProject.ID,
      action: 'CREATED',
      message: `Project ${savedProject.title} created.`,
      actor: 'System',
      remark: 'Project Initialization'
    });
    await log.save();


    return res.status(201).json({
      message: "Project created successfully.",
      project: savedProject,
      success: true
    });

  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ success: false, message: "Server error while creating project.", error });
  }
};


// Controller to Fetch All Projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('teamID')
      .populate('guideID')
      .lean(); // Use lean() to get plain JS objects

    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found!"
      });
    }

    // Collect all unique student userIDs from all projects
    const studentUserIDs = new Set();
    projects.forEach(p => {
      if (p.teamID && p.teamID.members) {
        p.teamID.members.forEach(m => {
          if (m.userID) studentUserIDs.add(Number(m.userID));
        });
      }
    });

    // Fetch User details (year, batch)
    const users = await User.find({ userID: { $in: Array.from(studentUserIDs) } })
      .select('userID year batch');

    // Create a map for quick lookup
    const userMap = {};
    users.forEach(u => {
      userMap[u.userID] = u;
    });

    // Attach year and batch to projects
    const enrichedProjects = projects.map(p => {
      let projectYear = null;
      let projectBatch = p.batch; // Default to project's stored batch

      if (p.teamID && p.teamID.members && p.teamID.members.length > 0) {
        // Find the lead or first member to determine Year
        const leadMember = p.teamID.members.find(m => m.role === 'Lead') || p.teamID.members[0];
        const user = userMap[Number(leadMember.userID)];
        if (user) {
          projectYear = user.year;
          // If project batch is missing, try to use user batch (fallback)
          if (!projectBatch) projectBatch = user.batch;
        }
      }

      return {
        ...p,
        year: projectYear,
        batch: projectBatch
      };
    });

    return res.status(200).json({
      success: true,
      message: "Fetched all projects successfully!",
      data: enrichedProjects
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Controller to Fetch All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve users"
    });
  }
};

// const User = require('../models/User');
// const Project = require('../models/Project');

exports.getUserProjects = async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT
    // console.log('User ID:', userId);

    // Fetch user with projects
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch only the projects listed in user's "projects" array
    const projects = await Project.find({ _id: { $in: user.projects } })
      .populate('guideID')
      .populate('teamID')


    // Collect all student user IDs from all projects' teams
    const allStudentUserIDs = new Set();
    projects.forEach(p => {
      if (p.teamID && p.teamID.members) {
        p.teamID.members.forEach(m => {
          console.log(`Project ${p.ID} Member ID:`, m.userID, typeof m.userID);
          allStudentUserIDs.add(Number(m.userID))
        });
      }
    });

    console.log("All Student IDs:", Array.from(allStudentUserIDs));

    // Fetch User documents for these IDs
    const studentUsers = await User.find({ userID: { $in: Array.from(allStudentUserIDs) } })
      .select('firstName lastName userID email image contactNumber year batch'); // Select necessary fields

    console.log("Fetched Student Users:", studentUsers.length);

    // Create a map for quick lookup: userID -> User Object
    const studentMap = {};
    studentUsers.forEach(u => {
      console.log(`Mapping User: ${u.userID} -> ${u.firstName}`);
      studentMap[Number(u.userID)] = u;
    });

    // console.log(projects);
    // console.log("--------------------------------------------");
    // Format the project data
    const formattedProjects = projects.map(p => {
      // Enrich team members with user details
      let enrichedTeam = p.teamID;
      if (enrichedTeam && enrichedTeam.members) {
        // We need to convert the mongoose document to a plain object to modify it freely, 
        // or just construct a new members array. 
        // derived members list
        const enrichedMembers = enrichedTeam.members.map(member => {
          const userDetails = studentMap[Number(member.userID)];
          if (!userDetails) console.log(`Missing details for member ${member.userID} in project ${p.ID}`);
          return {
            userID: member.userID,
            role: member.role,
            firstName: userDetails ? userDetails.firstName : '',
            lastName: userDetails ? userDetails.lastName : '',
            email: userDetails ? userDetails.email : '',
            image: userDetails ? userDetails.image : '',
            contactNumber: userDetails ? userDetails.contactNumber : '',
            year: userDetails ? userDetails.year : null,
            batch: userDetails ? userDetails.batch : null
          };
        });

        // Spread to avoid mutating the original mongoose doc directly in a way that might be restricted
        enrichedTeam = {
          ...enrichedTeam.toObject(),
          members: enrichedMembers
        };
      }

      // Determine project year from Lead or first member
      let projectYear = null;
      let projectBatch = p.batch;
      if (enrichedTeam && enrichedTeam.members && enrichedTeam.members.length > 0) {
        const lead = enrichedTeam.members.find(m => m.role === 'Lead') || enrichedTeam.members[0];
        projectYear = lead.year;
        if (!projectBatch) projectBatch = lead.batch;
      }

      return {
        title: p.title,
        ID: p.ID,
        description: p.description,
        components: p.components,
        team: enrichedTeam, // Use the enriched team object
        status: p.status,
        isApproved: p.approved,
        // members:p.teamI
        projectGuide: p.guideID,
        createdAt: p.createdAt,
        reports: p.reports || [],
        year: projectYear,
        batch: projectBatch
      }
    });
    console.log(formattedProjects);
    res.status(200).json(formattedProjects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Server error fetching user projects' });
  }
};

// PUT /projects/:projectID/approval
exports.updateProjectApproval = async (req, res) => {
  console.log("Inside Update Project");
  try {
    const { projectID } = req.params;
    const { approved } = req.body;

    if (typeof approved !== 'boolean') {
      return res.status(400).json({ message: "Invalid 'approved' value. Must be true or false." });
    }

    // Find project by ID field (not _id)
    const project = await Project.findOne({ ID: projectID });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // console.log("Before:", project.status);
    project.approved = approved;

    if (!approved) {
      if (project.status === 1) {
        project.status = 0;
      }
    } else {
      project.status = 1;
    }
    // console.log("After:", project.status);
    await project.save();

    // Log Approval Change
    const log = new ProjectLog({
      projectID: project.ID,
      action: approved ? 'APPROVED' : 'APPROVAL_REVOKED',
      message: `Project approval status changed to ${approved}`,
      actor: req.user ? req.user.userId : 'System',
      remark: `Status: ${project.status}`
    });
    await log.save();


    return res.status(200).json({ message: 'Project approval status updated', project });
  } catch (error) {
    console.error('Error updating project approval:', error);
    return res.status(500).json({ message: 'Server error while updating approval status' });
  }
};

exports.updateProjectComponents = async (req, res) => {
  const { projectId } = req.params;
  const { updatedComponents, remark } = req.body;
  console.log(projectId, updatedComponents, remark);

  try {
    const project = await Project.findOne({ ID: projectId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const rejectedIds = [];
    let total = 0;
    let acceptedCount = 0;

    // Loop through each component of the project
    project.components = project.components.map(comp => {
      const update = updatedComponents.find(u => u.id === comp.id);
      if (update) {
        total++;
        comp.accepted = update.accepted;

        if (update.accepted) {
          acceptedCount++;

          // Reset fullfillment tracking
          comp.fullfilled = false;
          comp.fullfilledQty = 0;
          comp.carts = [];
        } else {
          rejectedIds.push(comp.id);
        }
      }
      return comp;
    });

    // Push rejection remark if present
    if (rejectedIds.length > 0 && remark?.trim()) {
      project.componentRejections.push({
        remark,
        componentIds: rejectedIds
      });
    }

    // Update project status
    if (acceptedCount === total) {
      project.status = 2; // All accepted
    } else if (acceptedCount === 0) {
      project.status = 9; // All rejected
    } else {
      project.status = 11; // Mixed
    }

    await project.save();

    // Regenerate MidOrder from updated project data
    getMidOrder();

    // Log Component Update
    const log = new ProjectLog({
      projectID: project.ID,
      action: 'COMPONENT_UPDATE',
      message: `Components updated. Accepted: ${acceptedCount}/${total}`,
      actor: req.user ? req.user.userId : 'System',
      remark: remark || 'No remark'
    });
    await log.save();

    return res.status(200).json({ success: true, message: "Project components updated." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.projectReturn = async (req, res) => {
  try {
    const updatedProject = req.body;

    if (!updatedProject || !updatedProject._id) {
      return res.status(400).json({ message: "Invalid project data" });
    }

    // 1. Fetch the current state of the project from DB
    const project = await Project.findById(updatedProject._id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 2. Fetch all components to update inventory
    const allComponents = await Component.find({});

    let allComponentsReceived = true;

    // 3. Iterate through updated components to process returns
    for (const updatedComp of updatedProject.components) {
      // Find the corresponding component in the DB project
      const dbComp = project.components.find(c => c.id === updatedComp.id);

      if (dbComp) {
        // Check if there is a return quantity in the request
        const returnQty = updatedComp.receiveMemo?.receivedQantity || 0;
        const remark = updatedComp.receiveMemo?.remark || "";

        if (returnQty > 0) {
          // Update the DB component's return memo
          dbComp.receiveMemo = {
            receivedQuantity: returnQty,
            remark: remark
          };

          // Update Inventory
          const inventoryComp = allComponents.find(c => c.cID === updatedComp.id);
          if (inventoryComp) {
            inventoryComp.qnty = (inventoryComp.qnty || 0) + returnQty;
            inventoryComp.issued = Math.max(0, (inventoryComp.issued || 0) - returnQty);
            //Stock Log
            const stockLog = new StockLog({
              componentID: updatedComp.id,
              source: project.ID,
              destination: 'Stock',
              type: 'IN',
              quantity: returnQty,
              remark: `Component ${updatedComp.id} checked in from project ${project._id}`
            });
            await stockLog.save();
            await inventoryComp.save();
          }
        }

        // Update allReceived status from frontend logic
        dbComp.allReceived = updatedComp.allReceived;

        // Check if this component is fully returned/received
        if (!dbComp.allReceived) {
          allComponentsReceived = false;
        }
      }
    }

    // 4. Update Project Status if all components are returned
    if (allComponentsReceived) {
      project.status = 6; // Project Completed
      project.isCompleted = true;
      project.completedAt = new Date();
    }

    // 5. Save the updated project
    await project.save();

    // Log Return
    const log = new ProjectLog({
      projectID: project.ID,
      action: 'PROJECT_RETURN',
      message: 'Project return processed',
      actor: req.user ? req.user.userId : 'System',
      remark: 'Components returned to stock'
    });
    await log.save();

    return res.status(200).json({
      success: true,
      message: "Project return processed successfully!",
      project: project
    });

  } catch (error) {
    console.error("Project return failed:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing return",
      error: error.message
    });
  }
};

exports.getGuidedProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const projects = await Project.find({ guideID: userId })
      .populate('teamID')
      .lean();

    // Collect all unique student userIDs
    const studentUserIDs = new Set();
    projects.forEach(p => {
      if (p.teamID && p.teamID.members) {
        p.teamID.members.forEach(m => {
          if (m.userID) studentUserIDs.add(Number(m.userID));
        });
      }
    });

    // Fetch User details
    const users = await User.find({ userID: { $in: Array.from(studentUserIDs) } })
      .select('userID year batch');

    const userMap = {};
    users.forEach(u => {
      userMap[u.userID] = u;
    });

    const enrichedProjects = projects.map(p => {
      let projectYear = null;
      let projectBatch = p.batch;

      if (p.teamID && p.teamID.members && p.teamID.members.length > 0) {
        const leadMember = p.teamID.members.find(m => m.role === 'Lead') || p.teamID.members[0];
        const user = userMap[Number(leadMember.userID)];
        if (user) {
          projectYear = user.year;
          if (!projectBatch) projectBatch = user.batch;
        }
      }

      return {
        ...p,
        year: projectYear,
        batch: projectBatch
      };
    });

    return res.status(200).json({
      success: true,
      projects: enrichedProjects
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      success: false,
      message: "Internal Server Error !!"
    })
  }
}

// Upload or Update a Report
exports.uploadReport = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reportNumber, fileUrl } = req.body;

    if (!reportNumber || !fileUrl) {
      return res.status(400).json({ message: "Report number and file URL are required." });
    }

    const project = await Project.findOne({ ID: projectId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (!project.reports) {
      project.reports = [];
    }

    const existingReportIndex = project.reports.findIndex(r => r.reportNumber === reportNumber);

    if (existingReportIndex !== -1) {
      // Update existing report
      project.reports[existingReportIndex].fileUrl = fileUrl;
      project.reports[existingReportIndex].status = "Uploaded - Not Sent";
      project.reports[existingReportIndex].uploadedAt = Date.now();
      project.reports[existingReportIndex].rejectionReason = undefined; // Clear rejection reason
    } else {
      // Add new report
      project.reports.push({
        reportNumber,
        fileUrl,
        status: "Uploaded - Not Sent",
        uploadedAt: Date.now()
      });
    }

    await project.save();

    // Log Report Upload
    const log = new ProjectLog({
      projectID: project.ID,
      action: 'REPORT_UPLOAD',
      message: `Report ${reportNumber} uploaded`,
      actor: req.user ? req.user.userId : 'System',
      remark: fileUrl
    });
    await log.save();

    return res.status(200).json({
      success: true,
      message: "Report uploaded successfully.",
      reports: project.reports
    });

  } catch (error) {
    console.error("Error uploading report:", error);
    return res.status(500).json({ message: "Server error uploading report." });
  }
};

// Send Report for Approval
exports.sendReportForApproval = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reportNumber } = req.body;

    const project = await Project.findOne({ ID: projectId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (!project.reports) {
      return res.status(404).json({ message: "Report not found." });
    }

    const report = project.reports.find(r => r.reportNumber === reportNumber);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    report.status = "Pending Approval";
    await project.save();

    // Log Report Submission
    const log = new ProjectLog({
      projectID: project.ID,
      action: 'REPORT_SUBMIT',
      message: `Report ${reportNumber} sent for approval`,
      actor: req.user ? req.user.userId : 'System',
      remark: 'Pending Approval'
    });
    await log.save();

    return res.status(200).json({
      success: true,
      message: "Report sent for approval.",
      reports: project.reports
    });

  } catch (error) {
    console.error("Error sending report for approval:", error);
    return res.status(500).json({ message: "Server error sending report for approval." });
  }
};

// Update Report Status (Approve/Reject)
exports.updateReportStatus = async (req, res) => {
  try {
    const { projectId, reportNumber } = req.params;
    const { status, remark } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const project = await Project.findOne({ ID: projectId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    if (!project.reports) {
      return res.status(404).json({ message: "Report not found." });
    }

    const report = project.reports.find(r => r.reportNumber == reportNumber);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    report.status = status;
    if (status === "Rejected") {
      report.rejectionReason = remark;
    }

    await project.save();

    // Log Report Status Change
    const log = new ProjectLog({
      projectID: project.ID,
      action: status === 'Approved' ? 'REPORT_APPROVED' : 'REPORT_REJECTED',
      message: `Report ${reportNumber} ${status}`,
      actor: req.user ? req.user.userId : 'System',
      remark: status === 'Rejected' ? remark : 'Approved'
    });
    await log.save();

    return res.status(200).json({
      success: true,
      message: `Report ${status} successfully.`,
      reports: project.reports
    });

  } catch (error) {
    console.error("Error updating report status:", error);
    return res.status(500).json({ message: "Server error updating report status." });
  }
};