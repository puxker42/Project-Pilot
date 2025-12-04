const mongoose = require("mongoose");
const Project = require("../models/Project");
const User = require("../models/User");
const Component = require("../models/Component");
const Team = require("../models/Team");
const { getMidOrder } = require("./Components");
const ReqTable = require('../models/ReqTable');

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
      .populate('guideID');
    console.log(projects);
    if (!projects || projects.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No projects found!"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched all projects successfully!",
      data: projects
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


    console.log(projects);
    console.log("--------------------------------------------");
    // Format the project data
    const formattedProjects = projects.map(p => ({
      title: p.title,
      ID: p.ID,
      description: p.description,
      components: p.components,
      team: p.teamID,
      status: p.status,
      isApproved: p.approved,
      // members:p.teamI
      projectGuide: p.guideID,
      createdAt: p.createdAt,
      reports: p.reports || []
    }));
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

    return res.status(200).json({ success: true, message: "Project components updated." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};


exports.projectReturn = async (req, res) => {
  try {
    const updatedProject = req.body;
    const prjdoc = await Project.findById(updatedProject._id);
    for (cmp of updatedProject.components) {
      console.log(cmp);
      const component = await Component.findOne({ cID: cmp.id });
      console.log(component);
      component.qnty += cmp.returnMemo.returnQuantity;
      component.save();
    }
    prjdoc.components = updatedProject.components;
    prjdoc.isCompleted = true;
    prjdoc.completedAt = new Date();
    prjdoc.save();
    return res.status(200).json({
      success: true,
      message: "Projects Updated Successfully !"
    })
  } catch (error) {
    console.error("Project return failed:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while processing return",
    });
  }
}

exports.getGuidedProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const projects = await Project.find({ guideID: userId });
    return res.status(200).json({
      success: true,
      projects
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