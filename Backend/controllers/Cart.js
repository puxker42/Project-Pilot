const Cart = require('../models/Cart'); // adjust path as needed
const jwt = require('jsonwebtoken');
const Component = require('../models/Component');
const Project = require('../models/Project');
const Team = require('../models/Team');
const User = require('../models/User');
// Use your configured mail utility
const StockLog = require('../models/StockLog');
const sendMail = require('../utils/mailSender'); // Adjust path accordingly
require('dotenv').config();

// JWT Secret (store securely in .env)
const JWT_SECRET = process.env.JWT_SECRET;

// Function to generate unique CRT ID
function generateCRTCode() {
  const randomNumber = Math.floor(10000 + Math.random() * 90000);
  return "CRT" + randomNumber;
}

// Create Cart Controller
exports.createCart = async (req, res) => {
  try {
    const { details } = req.body;

    if (!details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ success: false, message: "Details array is required" });
    }

    const cartID = generateCRTCode();

    // Generate token with the custom 'ID' field
    const token = jwt.sign({ ID: cartID }, JWT_SECRET);

    const newCart = new Cart({
      ID: cartID,
      // vendorID,
      // vendorName,
      details,
      token
      // crationDate defaults automatically
    });

    await newCart.save();

    return res.status(201).json({
      success: true,
      message: "Cart created successfully",
      data: newCart
    });

  } catch (error) {
    console.error("Error in createCart:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get All Carts Controller
exports.getCarts = async (req, res) => {
  try {
    const carts = await Cart.find({});

    if (carts.length > 0) {
      console.log("Cart Sample Vendor Info:", carts[0]?.vendorID || "N/A", carts[0]?.vendorName || "N/A");
    } else {
      console.log("No carts found.");
    }

    return res.status(200).json({
      success: true,
      data: carts
    });
  } catch (error) {
    console.error("Error in Cart Fetch:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};



exports.orderCart = async (req, res) => {
  try {
    console.log("Inside Order Cart");
    const { vendorID, vendorName, orderDate, cartId } = req.body;
    const cart = await Cart.findOne({ ID: cartId });
    cart.vendorID = vendorID;
    cart.vendorName = vendorName;
    cart.orderDate = orderDate;
    cart.ordered = true
    await cart.save();
    return res.status(201).json({
      success: true,
      message: "Cart Ordered Successfully "
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

exports.getCart = async (req, res) => {
  try {
    console.log("Inside Get Cart")
    const { cartID } = req.params;
    console.log(cartID);
    const cart = await Cart.findOne({ ID: cartID });
    return res.status(201).json({
      success: true,
      data: cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error
    })
  }
};

exports.updateCart = async (req, res) => {
  try {
    const updatedCart = req.body;

    if (!updatedCart.ID) {
      return res.status(400).json({ success: false, message: 'Cart ID is required for update' });
    }

    const cart = await Cart.findOne({ ID: updatedCart.ID });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Replace the existing cart data with the updated data
    cart.vendorID = updatedCart.vendorID || cart.vendorID;
    cart.vendorName = updatedCart.vendorName || cart.vendorName;
    cart.ordered = updatedCart.ordered ?? cart.ordered;
    cart.orderDate = updatedCart.orderDate || cart.orderDate;
    cart.checkInDate = updatedCart.checkInDate || cart.checkInDate;
    cart.token = updatedCart.token || cart.token;

    // Optional: Replace details entirely (or handle updates more granularly if needed)
    if (Array.isArray(updatedCart.details)) {
      cart.details = updatedCart.details;
    }

    // Save the updated cart
    await cart.save();

    return res.status(200).json({ success: true, message: 'Cart updated successfully', cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    return res.status(500).json({ success: false, message: 'Server error while updating cart' });
  }
};



exports.checkInCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { details, checkInDate } = req.body;

    const cart = await Cart.findOne({ ID: id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.details = details;
    cart.checkIn = true;
    cart.checkInDate = checkInDate ? new Date(checkInDate) : new Date();

    // Update component quantities
    for (const comp of details) {
      const tcmp = await Component.findOne({ cID: comp.ID });
      if (tcmp && typeof comp.finally === 'number') {
        tcmp.qnty += comp.finally; // ✅ Correct access based on schema
        await tcmp.save();

        //here add stock log
        const stockLog = new StockLog({
          componentID: comp.ID,
          source: cart.ID,
          destination: 'Stock',
          type: 'IN',
          quantity: comp.finally,
          remark: `Component ${comp.ID} checked in from cart ${cart.ID}`
        });
        await stockLog.save();
      }
    }


    await cart.save();
    res.status(200).json({ message: "Cart checked in successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Check-in failed" });
  }
};