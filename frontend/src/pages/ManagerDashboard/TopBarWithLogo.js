import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import logo from '../../images/logo.png';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#1a004b',
  height: '60px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
}));

const StyledToolbar = styled(Toolbar)({
  minHeight: '60px',
  padding: '0 24px',
  display: 'flex',
  justifyContent: 'space-between',
});

const Logo = styled('img')({
  height: '40px',
  filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.5))',
});

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '250px',
    top: '60px',
    height: 'calc(100vh - 60px)',
    backgroundColor: '#fafafa',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

const UserName = styled(Typography)({
  fontWeight: 'bold',
  fontSize: '1rem',
  cursor: 'pointer',
  '@media (max-width: 768px)': {
    fontSize: '0.95rem',
  },
});

async function getUserData() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const result = await response.json();
    return result.data.name;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return "Unknown";
  }
}

function TopBarWithLogo({ title = 'Department of Electronics Engineering    |     Projects Management System' }) {
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const sidebarActions = [
    { name: 'Dashboard', path: '/manager-dashboard' },
    { name: 'Projects', path: '/all-projects' },
    { name: 'Create Cart', path: '/get-order' },
    { name: 'Component Info', path: '/search-components' },
    { name: 'View Carts', path: '/view-carts', triggerGenerate: true },
    { name: 'Create Component', path: '/create-component' },
    { name: 'Assign Slots', path: '/assign-slot' },
    { name: 'Distribute Components', path: '/check-out' },
    { name: 'Check-In', path: '/check-in' },
    { name: 'View Requirements', path: '/view-requirements/fetch' },
    { name: 'Pend Comp. List', path: '/pending-components' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  useEffect(() => {
    async function fetchData() {
      const name = await getUserData();
      const firstName = name.split(' ')[0];
      setUserName(firstName);
    }
    fetchData();
  }, []);

  return (
    <>
      <StyledAppBar position="fixed">
        <StyledToolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleSidebarToggle}
              sx={{ fontSize: '1.5rem' }}
            >
              <MenuIcon />
            </IconButton>
            <Logo src={logo} alt="Logo" />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                fontSize: '1.4rem',
                '@media (max-width: 768px)': {
                  fontSize: '1.1rem',
                },
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UserName onClick={handleMenuOpen}>
              {userName}
            </UserName>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: '160px',
                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  handleLogout();
                  handleMenuClose();
                }}
                sx={{
                  color: '#2e0d6e',
                  fontSize: '0.95rem',
                  py: 1.25,
                  px: 2.5,
                }}
              >
                <LogoutIcon sx={{ mr: 1.25, fontSize: '1.1rem' }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </StyledToolbar>
      </StyledAppBar>

      <StyledDrawer
        anchor="left"
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        variant="temporary"
      >
        <List sx={{ p: 1 }}>
          {sidebarActions.map((action, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(action.path)}
                sx={{
                  borderRadius: '4px',
                  py: 1.5,
                  px: 2,
                  color: '#1a1a1a',
                  '&:hover': {
                    backgroundColor: '#eee',
                  },
                }}
              >
                <ListItemText
                  primary={action.name}
                  primaryTypographyProps={{
                    fontSize: '1rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </StyledDrawer>

      {/* Spacer to push content below the fixed AppBar */}
      <Toolbar />
    </>
  );
}

export default TopBarWithLogo;