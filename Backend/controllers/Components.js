const Component = require('../models/Component');
const MidOrder = require('../models/MidOrder');
const Project = require('../models/Project');
const ReqTable = require('../models/ReqTable');
const Cart = require('../models/Cart');
const StockLog = require('../models/StockLog');
const ProjectLog = require('../models/ProjectLog');
// GET: Retrieve all components
exports.getAllComponents = async (req, res) => {
  try {
    const data = await Component.find();
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch components',
      error: error.message
    });
  }
};


// POST: Create a new component
exports.createComponent = async (req, res) => {
  try {
    console.log("Inside Create Component!");

    const {
      title,
      cID,
      description,
      qnty,
      price,
      loc,
      image,
      available,
      minPurchase
    } = req.body;

    // Check for duplicate cID
    const existingComponent = await Component.findOne({ cID });
    if (existingComponent) {
      return res.status(400).json({
        success: false,
        message: "Component ID already exists. Please try again with a new one.",
      });
    }

    const newComponent = new Component({
      title,
      cID,
      description,
      qnty,
      price,
      loc,
      image,
      available,
      minPurchace: minPurchase, // Note: match schema spelling!
    });

    const savedComponent = await newComponent.save();
    //Stock Log
    const stockLog = new StockLog({
      componentID: savedComponent.cID,
      source: 'Manual',
      destination: 'Stock',
      type: 'IN',
      quantity: savedComponent.qnty,
      remark: `Component ${savedComponent.cID} checked in from stock`
    });
    await stockLog.save();
    res.status(201).json({
      success: true,
      message: "Component created successfully.",
      data: savedComponent,
    });

  } catch (error) {
    console.error("Create Component Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create component.",
      error: error.message,
    });
  }
};




// GET: Get a single component by ID
exports.getComponent = async (req, res) => {
  try {
    const { cID } = req.params;
    const component = await Component.findOne({ cID });

    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component not found"
      });
    }

    res.status(200).json({
      success: true,
      data: component
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch component",
      error: error.message
    });
  }
};

// PUT: Update a component by ID
exports.updateComponent = async (req, res) => {
  try {
    const { cID } = req.params;

    // Fetch existing validation
    const existingComp = await Component.findOne({ cID });
    if (!existingComp) {
      return res.status(404).json({
        success: false,
        message: "Component not found"
      });
    }

    // Check for quantity change
    if (req.body.qnty !== undefined) {
      const newQty = Number(req.body.qnty);
      const oldQty = existingComp.qnty;
      const diff = newQty - oldQty;

      if (diff !== 0) {
        const stockLog = new StockLog({
          componentID: cID,
          source: 'Manual Update',
          destination: 'Stock',
          type: diff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diff),
          remark: `Stock updated via edit. Old: ${oldQty}, New: ${newQty}`
        });
        await stockLog.save();
      }
    }

    const updatedComponent = await Component.findOneAndUpdate(
      { cID },
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedComponent
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update component",
      error: error.message
    });
  }
};

// DELETE: Delete a component by ID
exports.deleteComponent = async (req, res) => {
  try {
    const { cID } = req.params;
    const deletedComponent = await Component.findOneAndDelete({ cID });

    if (!deletedComponent) {
      return res.status(404).json({
        success: false,
        message: "Component not found"
      });
    }

    if (deletedComponent.qnty > 0) {
      const stockLog = new StockLog({
        componentID: cID,
        source: 'Component Deletion',
        destination: 'Void',
        type: 'OUT',
        quantity: deletedComponent.qnty,
        remark: `Component ${cID} deleted from system.`
      });
      await stockLog.save();
    }

    res.status(200).json({
      success: true,
      message: "Component deleted successfully",
      data: deletedComponent
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete component",
      error: error.message
    });
  }
};


//PUT: Make Available !
exports.makeAvailable = async (req, res) => {
  try {
    const { quantity, loc } = req.body;
    const { cID } = req.params;

    const existingComp = await Component.findOne({ cID });
    const oldQty = existingComp ? existingComp.qnty : 0;

    const user = await Component.findOneAndUpdate(
      { cID },
      {
        available: true,
        qnty: quantity,
        loc: loc,
      },
      { new: true }
    );

    // Calculate diff and log
    if (user && existingComp) {
      const diff = quantity - oldQty;
      if (diff !== 0) {
        const stockLog = new StockLog({
          componentID: cID,
          source: 'Manual Adjustment',
          destination: 'Stock',
          type: diff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diff),
          remark: `Stock adjustment via updated. Old: ${oldQty}, New: ${quantity}`
        });
        await stockLog.save();
      }
    }
    // if(user){}
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No matching Component!"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Updated Successfully!",
      data: user
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: "Cannot Update Component!"
    });
  }
};
const getRequiredOrder = async () => {
  try {
    const reqMap = new Map(); // { ID: { name, reqty } }

    const projects = await Project.find({
      approved: true,
      isCompleted: false
    });

    for (const prj of projects) {
      for (const cmp of prj.components) {
        if (cmp.accepted && !cmp.fullfilled) {
          const existing = reqMap.get(cmp.id);
          const remaining = cmp.quantity - (cmp.fulfilledQty || 0);

          if (remaining > 0) {
            if (existing) {
              existing.reqty += remaining;
            } else {
              reqMap.set(cmp.id, {
                name: cmp.name,
                reqty: remaining
              });
            }
          }
        }
      }
    }

    await MidOrder.deleteMany({});

    for (const [id, data] of reqMap.entries()) {
      const com = await Component.findOne({ cID: id });
      const available = com?.qnty || 0;

      // Check if existing ordered data is in backup MidOrders (optional if keeping cache)
      const existing = await MidOrder.findOne({ ID: id });
      const ordered = existing?.ordered || 0;

      const toOrder = Math.max(data.reqty - available - ordered, 0);

      const newEntry = new MidOrder({
        ID: id,
        name: data.name,
        reqty: data.reqty,
        available,
        ordered,
        toOrder
      });

      await newEntry.save();
    }

    const allMidOrders = await MidOrder.find();
    return {
      success: true,
      message: 'MidOrder generated.',
      midOrders: allMidOrders
    };

  } catch (error) {
    console.error("Error in getRequiredOrder:", error);
    return {
      success: false,
      message: 'Error generating mid order',
      error: error.message
    };
  }
};

// Controller function
exports.getMidOrder = async () => {
  try {
    const result = await getRequiredOrder();
    // return res.status(200).json({result});
  } catch (error) {
    console.error("Error in getMidOrder:", error);
    // return res.status(500).json({
    //   success: false,
    //   message: "Failed to get MidOrder",
    //   error: error.message
    // });
  }
};



exports.generateOrder = async (req, res) => {
  try {
    // Step 1: First, clear any existing MidOrders
    await MidOrder.deleteMany({});

    // Step 2: Generate new MidOrder data
    const result = await getRequiredOrder();

    // Step 3: Check if the generation was successful
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.message,
        error: result.error
      });
    }

    // Step 4: Extract only required fields to send
    const filteredMidOrders = result.midOrders.map(order => ({
      ID: order.ID,
      name: order.name,
      reqty: order.reqty
    }));

    // Step 6: Send the response
    return res.status(200).json({
      success: true,
      message: "Order data generated successfully.",
      orders: filteredMidOrders
    });

  } catch (error) {
    console.error("Error in generateOrder:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error in generateOrder",
      error: error.message
    });
  }
};

const Order = require('../models/Order');

function generateTEMCode() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // More combinations
  return "ORD" + randomNumber;
}

exports.createOrder = async (req, res) => {
  try {
    const { orderDetails, invoicePDF } = req.body;

    if (!orderDetails || !Array.isArray(orderDetails) || orderDetails.length === 0) {
      return res.status(400).json({ success: false, message: "Order details are required." });
    }

    const currentOrderID = generateTEMCode(); // ✅ Move here!

    const newOrder = new Order({
      orderID: currentOrderID,
      orderDetails,
      invoiceGenerated: true,
      invoicePDF: invoicePDF ? Buffer.from(invoicePDF, 'base64') : undefined,
    });

    await newOrder.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully with invoice.",
      orderID: newOrder.orderID,
    });

  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

exports.fetchMidOrder = async (req, res) => {
  try {
    const midOrder = await MidOrder.find({});
    return res.status(200).json({
      succes: true,
      data: midOrder
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      succes: false,
      message: error
    })
  }
};

// const Project = require('../models/Project');
// const MidOrder = require('../models/MidOrder');

exports.updateMidOrder = async (req, res) => {
  try {
    const { updatedReqs, cartID } = req.body;

    if (!updatedReqs || !Array.isArray(updatedReqs) || !cartID) {
      return res.status(400).json({ success: false, message: 'Invalid or missing data.' });
    }

    const upsertedDocs = [];

    for (const item of updatedReqs) {
      const { ID, toOrder } = item;

      if (typeof ID !== 'string' || typeof toOrder !== 'number') continue;

      // Get existing mid-order
      const existing = await MidOrder.findOne({ ID });

      if (!existing) {
        const newMid = await MidOrder.create({
          ID,
          name: item.name || "Unknown",
          reqty: 0,
          available: 0,
          ordered: 0,
          toOrder: toOrder
        });
        upsertedDocs.push(newMid);
        continue;
      }

      const prevToOrder = existing.toOrder || 0;
      const fulfilledNow = Math.max(0, prevToOrder - toOrder);

      let remainingQty = fulfilledNow;

      // Find all active projects requesting this component
      const allProjects = await Project.find({
        approved: true,
        isCompleted: false,
        "components": {
          $elemMatch: {
            id: ID,
            accepted: true
          }
        }
      });

      // Manually filter projects where qty is still remaining
      const projects = allProjects.filter(project =>
        project.components.some(
          cmp =>
            cmp.id === ID &&
            cmp.accepted &&
            (cmp.fullfilledQty || 0) < (cmp.quantity || 0)
        )
      );

      for (const project of projects) {
        let updated = false;

        for (const cmp of project.components) {
          if (cmp.id === ID && cmp.accepted) {
            // Total already fulfilled from all carts
            const totalFulfilled = (cmp.carts || []).reduce((sum, c) => sum + (c.fullfilledQty || 0), 0);
            const needed = cmp.quantity - totalFulfilled;

            if (needed <= 0) continue;

            const toGive = Math.min(needed, remainingQty);

            // Initialize carts array
            cmp.carts = cmp.carts || [];

            // Check if cart already exists
            const existingCart = cmp.carts.find(c => c.cartID === cartID);

            if (existingCart) {
              existingCart.fullfilledQty += toGive;
            } else {
              cmp.carts.push({ cartID, fullfilledQty: toGive });
            }

            // Recompute total fulfilledQty after update
            const newTotalFulfilled = cmp.carts.reduce((sum, c) => sum + (c.fullfilledQty || 0), 0);
            cmp.fullfilledQty = newTotalFulfilled;
            cmp.fullfilled = newTotalFulfilled >= cmp.quantity;

            remainingQty -= toGive;
            updated = true;
          }

          if (remainingQty <= 0) break;
        }

        if (updated) {
          await project.save();

          // Log Project Component Update
          const log = new ProjectLog({
            projectID: project.ID,
            action: 'GRID_UPDATE',
            message: `Components grid updated via MidOrder`,
            actor: req.user ? req.user.userId : 'System',
            remark: `Cart linked. Fulfilled updated.`
          });
          await log.save();
        }

        if (remainingQty <= 0) break;
      }

      const actualFulfilled = fulfilledNow - remainingQty;
      const newOrdered = (existing.ordered || 0) + actualFulfilled;

      const newToOrder = Math.max(existing.reqty - existing.available - newOrdered, 0);

      const updatedMid = await MidOrder.findOneAndUpdate(
        { ID },
        {
          $set: {
            ordered: newOrdered,
            toOrder: newToOrder
          }
        },
        { new: true }
      );

      upsertedDocs.push(updatedMid);
    }

    return res.status(200).json({
      success: true,
      message: 'MidOrders and project components updated with partial fulfillment',
      data: upsertedDocs
    });

  } catch (error) {
    console.error('Error updating mid orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};


exports.getReqTable = async (req, res) => {
  try {
    const data = await ReqTable.find({});
    return res.status(200).json({
      success: true,
      message: "Done",
      data
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Unable !"
    });
  }
};


// POST: Create a new component
exports.createComponentInForm = async (req, res) => {
  try {
    console.log("Inside Create Component !");
    const { name, cID, description, price, quantity, image } = req.body;

    // Check if a component with the same ID already exists
    const existingComponent = await Component.findOne({ cID });

    if (existingComponent) {
      return res.status(400).json({
        success: false,
        message: "Component ID isn't available! Please try again."
      });
    }

    // Create and save new component
    const newComponent = new Component({
      title: name,
      cID,
      description,
      qnty: quantity,
      price,
      image: image || ''  // Optional: fallback to empty string if not provided
    });

    console.log(newComponent);
    const savedComponent = await newComponent.save();

    //Stock Log
    const stockLog = new StockLog({
      componentID: savedComponent.cID,
      source: 'Manual Form',
      destination: 'Stock',
      type: 'IN',
      quantity: savedComponent.qnty,
      remark: `Component ${savedComponent.cID} created via form`
    });
    await stockLog.save();

    res.status(201).json({
      success: true,
      component: savedComponent
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({

      success: false,
      message: "Failed to create component",
      error: error.message
    });
  }
};
