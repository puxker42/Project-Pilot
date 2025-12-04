const express = require('express');
const router = express.Router();

// Middleware
const { auth, authorizeRole, getUserEmail } = require('../middlewares');

// Auth controllers
const { login, signUp, verifyOTP, getCurrentUser, verifyToken, sendOTP, sendInstructioMail, changePassword } = require("../controllers/Auth");

// Project Controllers
const { createProject, getAllProjects, getAllUsers, getUserProjects, updateProjectApproval, updateProjectComponents, projectReturn, getGuidedProjects, uploadReport, sendReportForApproval, updateReportStatus } = require("../controllers/Project");

// Component controllers
const { getAllComponents, deleteComponent, createComponent, getComponent, updateComponent, makeAvailable, getRequiredOrder, getMidOrder, createOrder, fetchMidOrder, updateMidOrder, getReqTable, createComponentInForm } = require("../controllers/Components");
const { createTeam, getMyTeams } = require('../controllers/Team');

//Cart Controllers
const { createCart, getCarts, orderCart, getCart, updateCart, checkInCart } = require('../controllers/Cart');

const { createVendor, getAllVendors } = require('../controllers/Vendor');

const { getControls, updateControls } = require('../controllers/Controls');

const { addToSlot, getTokenProject, updateDelivery, checkInVerify } = require('../controllers/Distribution');
const { uploadFile } = require('../controllers/FileHandler');
// --- Auth Routes ---
router.post("/login", login);
router.post("/signup", signUp);
router.post("/verify", verifyOTP);
router.get("/get-all-users", getAllUsers);
router.get("/me", auth, getCurrentUser);
router.get("/verify-token", verifyToken);
router.post("/auth/sendotp", sendOTP);
router.post("/auth/forgot-pass", getUserEmail, sendInstructioMail);
router.post("/auth/reset-password", changePassword);
// --- Component Routes ---
router.post("/create-component", auth, createComponent);
router.post("/create-component/form", auth, createComponentInForm);
router.get("/get-all-components", getAllComponents);
router.get("/get-component/:cID", auth, getComponent);
router.delete("/delete-component/:cID", auth, authorizeRole("Admin", "Manager"), deleteComponent);
router.put("/update-component/:cID", auth, authorizeRole("Admin", "Manager"), updateComponent);
router.put("/make-available/:cID", auth, makeAvailable);
router.get("/get", getReqTable);

// --- Team Routes ---
router.post("/create-team", auth, createTeam);
router.get('/get-my-teams/:token', auth, getMyTeams);

//Control Routes
router.get('/controls/get', auth, getControls);
router.put('/controls/update', auth, updateControls);

// --- Project Routes ---
router.post("/create-project", createProject);
router.get("/get-all-projects", auth, getAllProjects);
router.get("/projects-me", auth, getUserProjects);
router.put("/:projectID/approval", auth, updateProjectApproval);
router.get("/get-guided-projects", auth, getGuidedProjects);
router.put('/update-project-components/:projectId', auth, updateProjectComponents);

// Report Routes
router.post("/projects/:projectId/report/upload", auth, uploadReport);
router.post("/projects/:projectId/report/send", auth, sendReportForApproval);
router.put("/projects/:projectId/report/:reportNumber/status", auth, updateReportStatus);
// Optional: Future Protected Controls
// router.put("/get-controls", auth, authorizeRole("Instructor"), yourController);


// --- Order Routes ---
router.get("/mid-orders/generate", auth, getMidOrder);
router.get("/mid-orders/fetch", auth, fetchMidOrder);
router.put("/mid-orders/update", auth, updateMidOrder);
router.post("/create-order", auth, createOrder);

// --- Cart Routes ---
router.get("/get-carts", auth, getCarts);
router.post("/create-cart", auth, createCart);
router.put("/order-cart", auth, orderCart);
router.get("/get-cart/:cartID", auth, getCart);
router.put("/update-cart", auth, updateCart);
router.put('/cart/checkin/:id', auth, checkInCart);
router.put('/add-to-slots', auth, addToSlot);
router.get('/verify/get-project/:token', auth, getTokenProject);
router.post('/verify/success', auth, updateDelivery);
router.put('/check-in/verify', auth, checkInVerify);
router.put('/check-in/project', auth, projectReturn);
// --- Vendor Routes ---
router.post("/create-vendor", auth, createVendor);

router.get("/get-all-vendors", auth, getAllVendors);





// --- File Routes ---
router.post("/upload", auth, uploadFile);

// In your Express backend
const Order = require('../models/Order');

router.get('/orders/:orderID/invoice', async (req, res) => {
  try {
    const order = await Order.findOne({ orderID: req.params.orderID });
    if (!order || !order.invoicePDF) {
      return res.status(404).send("Invoice not found");
    }
    res.contentType("application/pdf");
    res.send(order.invoicePDF);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({});
    res.status(200).json({
      success: true,
      orders: orders
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
