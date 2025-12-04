import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Authentication/Login';
import SignUp from '../pages/Authentication/SignUp';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import StudentDashboard from '../pages/UserDashBoard/StudentDashboard';
import ManagerDashboard from '../pages/ManagerDashboard/ManagerDashboard';
import InstructorDashboard from '../pages/InstructorDashBoard/InstructorDashboard';
import LoginFailed from '../pages/Authentication/LogFail';
import SignSuc from '../pages/Authentication/signSuc';
import SignFail from '../pages/Authentication/signFail';
import CheckInLand from '../pages/ManagerDashboard/Cart/CheckInLand';
import PageNotFound from '../pages/PageNotFound';
import UnderConstruction from '../pages/UnderConstruction';
import CreateTeam from '../pages/UserDashBoard/CreateTeam/CreateTeam';
import ProjectWizard from '../pages/UserDashBoard/CreateProject/ProjectWizard';
import FailurePage from '../pages/FailurePage';
import SuccessPage from '../pages/SuccessPage';
// import ProjectsAssociated from '../pages/ProjectsAssociated';
// import ManControls from '../pages/ManControls';
import PrivateRoutes from './PrivateRoutes';
import Inventory from '../pages/ManagerDashboard/Components/Inventory';
import ProjectDashboard from '../pages/ManagerDashboard/Projects/ProjectDashboard';
// import CreateCart from '../pages/ManagerDashboard/CreateCart';
import ViewCarts from '../pages/ManagerDashboard/Cart/ViewCarts';
import Order from '../pages/ManagerDashboard/Cart/Order';
import CheckIn from '../pages/ManagerDashboard/Cart/CheckIn';
import RequirementManager from '../pages/ManagerDashboard/Cart/RequirementManager';
import CreateComponent from '../pages/ManagerDashboard/Components/CreateComponent';
import AssignSlots from '../pages/ManagerDashboard/Distribution/AssignSlots';
import Distribute from '../pages/ManagerDashboard/Distribution/Distribute';
import VerifyDelivery from '../pages/ManagerDashboard/Distribution/VerifyDelivery';
import ProjectCheckIn from '../pages/ManagerDashboard/Cart/ProjectCheckIn';
import MyProjects from '../pages/UserDashBoard/MyProjects';
import MyTeams from '../pages/UserDashBoard/MyTeams';
import ProjectApprovalManager from '../pages/InstructorDashBoard/ProjectApprovalManager';
import GuidedProjects from '../pages/InstructorDashBoard/GuidedProjects';
import ForgotPassword from '../pages/Authentication/ForgotPassword';
import ResetPassword from '../pages/Authentication/ResetPassword';
import Requirement from '../pages/ManagerDashboard/Requirements';
const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Login />} />
    <Route path="/sign-up" element={<SignUp />} />
    <Route path="/log-fail" element={<LoginFailed />} />
    <Route path="/sign-suc" element={<SignSuc />} />
    <Route path="/sign-fail" element={<SignFail />} />
    <Route path="/auth/forgot-pass" element={<ForgotPassword />} />
    <Route path='/auth/reset-password' element={<ResetPassword />} />

    {/* Protected Routes - Dashboards */}
    <Route path="/admin-dashboard" element={<PrivateRoutes><AdminDashboard /></PrivateRoutes>} />
    <Route path="/student-dashboard" element={<PrivateRoutes><StudentDashboard /></PrivateRoutes>} />
    <Route path="/manager-dashboard" element={<PrivateRoutes><ManagerDashboard /></PrivateRoutes>} />
    <Route path="/instructor-dashboard" element={<PrivateRoutes><InstructorDashboard /></PrivateRoutes>} />

    {/* Protected Routes - Project & Team */}
    <Route path="/create-project" element={<PrivateRoutes><ProjectWizard /></PrivateRoutes>} />
    <Route path="/create-team" element={<PrivateRoutes><CreateTeam /></PrivateRoutes>} />
    {/* <Route path="/projects" element={<PrivateRoutes><ProjectsAssociated /></PrivateRoutes>} /> */}
    <Route path="/update-project" element={<PrivateRoutes><UnderConstruction /></PrivateRoutes>} />
    <Route path='/all-projects' element={<PrivateRoutes><ProjectDashboard /></PrivateRoutes>} />
    {/* Protected Routes - Status Pages */}
    <Route path="/project-fail" element={<PrivateRoutes><FailurePage /></PrivateRoutes>} />
    <Route path="/project-success" element={<PrivateRoutes><SuccessPage /></PrivateRoutes>} />

    {/* Instructor Routes */}
    <Route path='/projects-to-approve' element={<PrivateRoutes><ProjectApprovalManager /></PrivateRoutes>} />
    <Route path='/projects-under-me' element={<PrivateRoutes><GuidedProjects /></PrivateRoutes>} />
    {/*Managet Routes */}
    <Route path='/search-components' element={<PrivateRoutes><Inventory /></PrivateRoutes>} />
    <Route path='/get-order' element={<PrivateRoutes><RequirementManager /></PrivateRoutes>} />
    <Route path='/view-carts' element={<PrivateRoutes><ViewCarts /></PrivateRoutes>} />
    <Route path='/cart-order/:cartID' element={<PrivateRoutes><Order /></PrivateRoutes>} />
    <Route path="/cart-check-in/:id" element={<PrivateRoutes><CheckIn /></PrivateRoutes>} />
    <Route path='/check-in' element={<PrivateRoutes><CheckInLand /></PrivateRoutes>} />
    <Route path='/create-component' element={<PrivateRoutes><CreateComponent /></PrivateRoutes>} />
    <Route path='/assign-slot' element={<PrivateRoutes><AssignSlots /></PrivateRoutes>} />
    <Route path='/check-out' element={<PrivateRoutes><Distribute /></PrivateRoutes>} />
    <Route path="/student/acknowledgement/:projectID/:token" element={<VerifyDelivery />} />
    <Route path='/project-in' element={<PrivateRoutes><ProjectCheckIn /></PrivateRoutes>} />
    <Route path='/my-projects' element={<PrivateRoutes><MyProjects /></PrivateRoutes>} />
    <Route path='/my-teams' element={<PrivateRoutes><MyTeams /></PrivateRoutes>} />
    <Route path='/view-requirements/fetch' element={<PrivateRoutes><Requirement /></PrivateRoutes>} />
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

export default AppRoutes;
