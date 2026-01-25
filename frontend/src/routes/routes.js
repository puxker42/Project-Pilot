import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Authentication/Login';
import SignUp from '../pages/Authentication/SignUp';
import AdminDashboard from '../pages/AdminDashboard/AdminDashboard';
import StudentDashboard from '../pages/UserDashBoard/StudentDashboard';
import ManagerDashboard from '../pages/ManagerDashboard/ManagerDashboard';
import ManagerLayout from '../pages/ManagerDashboard/ManagerLayout';
import InstructorDashboard from '../pages/InstructorDashBoard/InstructorDashboard';
import LoginFailed from '../pages/Authentication/LogFail';
import SignSuc from '../pages/Authentication/signSuc';
import SignFail from '../pages/Authentication/signFail';
import CheckInLand from '../pages/ManagerDashboard/Cart/CheckInLand';
import PageNotFound from '../pages/PageNotFound';
import UnderConstruction from '../pages/UnderConstruction';
import DeveloperLogin from '../pages/Authentication/DeveloperLogin';
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
import PendingComponentsPage from '../pages/PendingComponentsPage';
import GenerateReports from '../pages/ManagerDashboard/Reports/GenerateReports';
import ComponentWiseStockReport from '../pages/ManagerDashboard/Reports/ComponentWiseStockReport';
import DayWiseStockReport from '../pages/ManagerDashboard/Reports/DayWiseStockReport';
import CertificateGenerator from '../pages/ManagerDashboard/Reports/CertificateGenerator';
import DeveloperDashboard from '../pages/DeveloperDashboard/DeveloperDashboard';
import DatabaseViewer from '../pages/DeveloperDashboard/DatabaseViewer';
import DeveloperUserManagement from '../pages/DeveloperDashboard/DeveloperUserManagement';
import AccessDenied from '../pages/AccessDenied';
import RoleBasedRoute from './RoleBasedRoute';
import VisitorDashboard from '../pages/VisitorDashboard/VisitorDashboard';

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Login />} />
    <Route path="/sign-up" element={<SignUp />} />
    <Route path="/qwerty-asdfghjkl;-0123456789" element={<DeveloperLogin />} />
    <Route path="/log-fail" element={<LoginFailed />} />
    <Route path="/sign-suc" element={<SignSuc />} />
    <Route path="/sign-fail" element={<SignFail />} />
    <Route path="/auth/forgot-pass" element={<ForgotPassword />} />
    <Route path='/auth/reset-password' element={<ResetPassword />} />
    <Route path="/access-denied" element={<AccessDenied />} />



    {/* Protected Routes - Dashboards */}
    <Route path="/visitor-dashboard" element={
      <RoleBasedRoute allowedRoles={['Visitor']}>
        <VisitorDashboard />
      </RoleBasedRoute>
    } />
    <Route path="/admin-dashboard" element={
      <RoleBasedRoute allowedRoles={['Admin']}>
        <AdminDashboard />
      </RoleBasedRoute>
    } />
    <Route path="/student-dashboard" element={
      <RoleBasedRoute allowedRoles={['Student', 'student']}>
        <StudentDashboard />
      </RoleBasedRoute>
    } />
    <Route path="/instructor-dashboard" element={
      <RoleBasedRoute allowedRoles={['Instructor', 'instructor', 'Faculty', 'faculty']}>
        <InstructorDashboard />
      </RoleBasedRoute>
    } />
    <Route path="/developer-dashboard" element={
      <RoleBasedRoute allowedRoles={['Developer']}>
        <DeveloperDashboard />
      </RoleBasedRoute>
    } />
    <Route path="/developer-database" element={
      <RoleBasedRoute allowedRoles={['Developer']}>
        <DatabaseViewer />
      </RoleBasedRoute>
    } />
    <Route path="/developer-users" element={
      <RoleBasedRoute allowedRoles={['Developer']}>
        <DeveloperUserManagement />
      </RoleBasedRoute>
    } />

    {/* Protected Routes - Project & Team */}
    <Route path="/create-project" element={<PrivateRoutes><ProjectWizard /></PrivateRoutes>} />
    <Route path="/create-team" element={<PrivateRoutes><CreateTeam /></PrivateRoutes>} />
    <Route path="/update-project" element={<PrivateRoutes><UnderConstruction /></PrivateRoutes>} />

    {/* Protected Routes - Status Pages */}
    <Route path="/project-fail" element={<PrivateRoutes><FailurePage /></PrivateRoutes>} />
    <Route path="/project-success" element={<PrivateRoutes><SuccessPage /></PrivateRoutes>} />

    {/* Instructor Routes */}
    <Route path='/projects-to-approve' element={
      <RoleBasedRoute allowedRoles={['Instructor', 'instructor', 'Faculty', 'faculty']}>
        <ProjectApprovalManager />
      </RoleBasedRoute>
    } />
    <Route path='/projects-under-me' element={
      <RoleBasedRoute allowedRoles={['Instructor', 'instructor', 'Faculty', 'faculty']}>
        <GuidedProjects />
      </RoleBasedRoute>
    } />

    {/* Manager Routes with Layout */}
    <Route element={
      <RoleBasedRoute allowedRoles={['Manager', 'manager']}>
        <ManagerLayout />
      </RoleBasedRoute>
    }>
      <Route path="/manager-dashboard" element={<ManagerDashboard />} />
      <Route path='/all-projects' element={<ProjectDashboard />} />
      <Route path='/search-components' element={<Inventory />} />
      <Route path='/get-order' element={<RequirementManager />} />
      <Route path='/view-carts' element={<ViewCarts />} />
      <Route path='/cart-order/:cartID' element={<Order />} />
      <Route path="/cart-check-in/:id" element={<CheckIn />} />
      <Route path='/check-in' element={<CheckInLand />} />
      <Route path='/create-component' element={<CreateComponent />} />
      <Route path='/assign-slot' element={<AssignSlots />} />
      <Route path='/check-out' element={<Distribute />} />
      <Route path='/project-in' element={<ProjectCheckIn />} />
      <Route path='/view-requirements/fetch' element={<Requirement />} />
      <Route path='/pending-components' element={<PendingComponentsPage />} />
      <Route path='/generate-reports' element={<GenerateReports />} />
      <Route path='/generate-certificate' element={<CertificateGenerator />} />
      <Route path='/report-day-wise' element={<DayWiseStockReport />} />
      <Route path='/report-component-wise' element={<ComponentWiseStockReport />} />
    </Route>

    <Route path="/student/acknowledgement/:projectID/:token" element={<VerifyDelivery />} />
    <Route path='/my-projects' element={<PrivateRoutes><MyProjects /></PrivateRoutes>} />
    <Route path='/my-teams' element={<PrivateRoutes><MyTeams /></PrivateRoutes>} />

    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

export default AppRoutes;
