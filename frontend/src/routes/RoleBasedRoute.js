import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleBasedRoute = ({ children, allowedRoles }) => {
    const userStr = localStorage.getItem('user');
    let user = null;

    try {
        user = JSON.parse(userStr);
    } catch (error) {
        console.error("Error parsing user from localStorage", error);
    }

    // If no user is logged in, redirect to login (or PrivateRoutes handles this check usually)
    // But strictly speaking, if we use this *inside* PrivateRoutes, allow pass through
    // If used *instead* of PrivateRoutes, we must check token.
    // Assuming this is used *within* PrivateRoutes or can handle token check:

    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Developer has access to everything
    if (user && (user.role === 'Developer' || user.role === 'developer')) {
        return children;
    }

    if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
        // User role not authorized
        return <Navigate to="/access-denied" replace />;
    }

    return children;
};

export default RoleBasedRoute;
