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
  Divider,
  Avatar
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Close as CloseIcon
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
    top: '0px',
    height: '100vh',
    backgroundColor: '#fafafa',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  height: '60px',
  backgroundColor: '#1a004b',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 16px',
  color: 'white',
}));

const UserSection = styled(Box)({
  padding: '20px 16px',
  backgroundColor: '#f0f0f0',
  borderBottom: '1px solid #ddd',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
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

function TopBarWithLogo({ title }) {
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const sidebarActions = [
    { name: 'Dashboard', path: '/student-dashboard' },
    { name: 'Team Creator Wizard', path: '/create-team' },
    { name: 'Project Creator Wizard', path: '/create-project?new=true' },
    { name: 'My Projects', path: '/my-projects' },
    { name: 'Teams', path: '/my-teams' }
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
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
      setUserName(name);
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

          <Typography
            sx={{
              fontSize: '1rem',
              fontWeight: '500',
              '@media (max-width: 1024px)': {
                fontSize: '0.9rem',
              },
              '@media (max-width: 768px)': {
                fontSize: '0.75rem',
              },
              '@media (max-width: 480px)': {
                display: 'none',
              },
            }}
          >
            Department of Electronics Engg. | Project Mgmt. System
          </Typography>
        </StyledToolbar>
      </StyledAppBar>

      <StyledDrawer
        anchor="left"
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        variant="temporary"
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <SidebarHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Logo src={logo} alt="Logo" style={{ height: '35px' }} />
              <Typography sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                Menu
              </Typography>
            </Box>
            <IconButton
              onClick={handleSidebarToggle}
              sx={{
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </SidebarHeader>

          <UserSection>
            <Avatar
              sx={{
                bgcolor: '#1a004b',
                width: 40,
                height: 40,
                fontSize: '1.2rem',
              }}
            >
              {userName.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  color: '#1a1a1a',
                }}
              >
                {userName}
              </Typography>
            </Box>
          </UserSection>

          <List sx={{ p: 1, flexGrow: 1 }}>
            {sidebarActions.map((action, index) => (
              <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() => handleNavigation(action.path)}
                  sx={{
                    borderRadius: '0px',
                    border: '1px solid #ddd',
                    py: 1.5,
                    px: 2,
                    color: '#1a1a1a',
                    '&:hover': {
                      backgroundColor: '#eee',
                      borderColor: '#bbb',
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

          <Divider />

          <List sx={{ p: 1 }}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  borderRadius: '0px',
                  border: '1px solid #ddd',
                  py: 1.5,
                  px: 2,
                  color: '#d32f2f',
                  '&:hover': {
                    backgroundColor: '#ffebee',
                    borderColor: '#d32f2f',
                  },
                }}
              >
                <LogoutIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{
                    fontSize: '1rem',
                    fontWeight: '500',
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </StyledDrawer>

      {/* Spacer to push content below the fixed AppBar */}
      <Toolbar />
    </>
  );
}

export default TopBarWithLogo;