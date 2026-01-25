import React from 'react';
import { Outlet } from 'react-router-dom';
import TopBarWithLogo from './TopBarWithLogo';
import Footer from '../../components/Footer';

const ManagerLayout = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <TopBarWithLogo />
            <div style={{ flex: 1, padding: '20px', paddingTop: '10px' }}>
                <Outlet />
            </div>
            <Footer />
        </div>
    );
};

export default ManagerLayout;
