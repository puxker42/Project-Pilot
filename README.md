# Project Pilot

## ❓ What Problem Do We Solve?
Inter-organizational goods delivery, stock maintenance, and the flow of goods often suffer from misplacement and tracking issues. Managing this inventory efficiently is a significant challenge when using traditional paper-based processes.

## 💡 The Solution We Provide!
We provide a digital **M.E.R.N. Stack** web application that acts as a comprehensive inventory management system. It keeps a meticulous record of all goods moving in and out of the warehouse, completely digitizing traditional paper-based workflows.

**Key Features:**
- **End-to-End Tracking:** Tracks goods requested for specific projects, enabling collaboration and visibility for both warehouse clerks and the individuals raising requests.
- **Real-Time Insights:** Allows warehouse clerks to generate real-time stock reports.
- **Lifecycle Monitoring:** Maintains a complete history and tracks every single item from its entry into the warehouse to its final utilization or return (from "life to death").
- **Seamless Delivery & Notifications:** Ensures proper tracking of projects utilizing goods, facilitating seamless delivery and automated notifications for both the warehouse and the receiver.
- **Return Enforcement:** Maintains strict records to ensure goods are returned after work is completed by automatically preventing users from raising new requests until pending returns are settled.

Our main target is small goods delivery and inter-organizational inventory flow control, guaranteeing proper maintenance and transparency across projects.

## 🧪 Testing and Real-World Impact
This web application has been successfully tested at the **Walchand College of Engineering, Sangli**. 

It was used to digitize their academic project's record-keeping, manage goods inventory, ensure hassle-free delivery of goods to students, and enforce the return of goods by preventing new project creation for defaulters. 

**The Result:** The system drastically reduced the project goods delivery cycle from **6 months down to just 2 weeks**, including the vendor response and transit periods!

## 🚀 How to Walkthrough

Follow these steps to run the application locally and test the workflow:

### 1. Clone the Repository
```bash
git clone https://github.com/puxker42/Project-Pilot.git
cd Project-Pilot
```

### 2. Install Node and Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed on your machine. Install dependencies for both the backend and frontend:
```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Start the Application
You'll need to run both the backend server and the frontend client concurrently.
```bash
# Start backend (from the Backend directory)
npm run dev

# Start frontend (from the frontend directory in a new terminal)
npm start
```
*Note: Make sure to set up your `.env` files locally for database and other configurations before starting.*

### 4. Application Walkthrough

Once the application is running (typically on `http://localhost:3000`), you have two ways to explore the features:

#### Option A: Quick Visitor Access (Recommended)
If you just want to quickly browse the features without creating multiple accounts, you can use the pre-configured **Visitor** account. To set this up, run the visitor creation script:
```bash
# From the Backend directory
node scripts/createVisitor.js
```
Then, log in with the following credentials:
- **User ID:** `9878`
- **Password:** `ABC@1234`
*(This takes you to the Visitor Dashboard where you can explore the application's UI and features).*

#### Option B: Full Workflow Testing
To fully test the application's end-to-end capabilities, we recommend creating test users for different roles:
- **Student:** Raises requests for project goods.
- **Faculty:** Approves and monitors projects.
- **Manager:** Maintains stock and fulfills requests.
- **Admin:** Manages system settings.

🔗 **[Create New Users Here](http://localhost:3000/signup)** (or navigate to the Sign Up page). 

**General Application Workflow:**
1. **Student** creates a project and requests goods.
2. **Faculty / Admin** reviews the request.
3. **Manager** checks warehouse stock, fulfills the delivery, and updates the system.
4. **Student** receives goods, completes the project, and initiates a return.
5. **Manager** records the returned goods, closing the lifecycle and enabling the student to raise future requests.
