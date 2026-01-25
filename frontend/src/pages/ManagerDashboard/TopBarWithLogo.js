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
  ListItemIcon,
  Menu,
  MenuItem,
  Button,
  useTheme,
  useMediaQuery,
  ListSubheader,
  Divider,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListAltIcon,
  EventAvailable as EventAvailableIcon,
  Assessment as AssessmentIcon,
  Search as SearchIcon,
  AddBox as AddBoxIcon,
  Input as InputIcon,
  ShoppingCart as ShoppingCartIcon,
  AddShoppingCart as AddShoppingCartIcon,
  ViewList as ViewListIcon,
  Output as OutputIcon,
  HourglassEmpty as PendingIcon,
  FactCheck as RequirementsIcon,
  Inventory as InventoryIcon,
  Work as WorkIcon,
  AccountCircle
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import logo from '../../images/logo.png';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// --- Styled Components ---

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(90deg, #0f0c29 0%, #302b63 50%, #24243e 100%)', // Modern deep gradient
  height: '70px', // Slightly taller for premium feel
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  zIndex: theme.zIndex.drawer + 1,
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
}));

const StyledToolbar = styled(Toolbar)({
  minHeight: '70px',
  padding: '0 24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const Logo = styled('img')({
  height: '45px',
  filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  }
});

const NavButton = styled(Button)(({ theme, active }) => ({
  color: alpha('#fff', 0.85),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '0.95rem',
  padding: '8px 16px',
  marginLeft: theme.spacing(1),
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha('#fff', 0.1),
    color: '#fff',
    transform: 'translateY(-1px)',
  },
  ...(active && {
    backgroundColor: alpha('#fff', 0.15),
    color: '#fff',
  })
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 12,
    marginTop: theme.spacing(1),
    minWidth: 220,
    background: '#fff',
    boxShadow: '0px 10px 30px rgba(0,0,0,0.15)',
    border: '1px solid #eee',
    '& .MuiMenu-list': {
      padding: '8px',
    },
    '& .MuiMenuItem-root': {
      fontSize: '0.9rem',
      fontWeight: 500,
      color: '#333',
      borderRadius: '8px',
      margin: '2px 0',
      padding: '10px 16px',
      transition: 'all 0.2s',
      '&:hover': {
        backgroundColor: alpha('#302b63', 0.08),
        color: '#302b63', // Brand dark purple
        transform: 'translateX(4px)',
      },
      '& .MuiListItemIcon-root': {
        minWidth: '32px',
        color: '#666',
        transition: 'color 0.2s',
      },
      '&:hover .MuiListItemIcon-root': {
        color: '#302b63',
      },
    },
  },
}));

const UserChip = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '6px 12px',
  borderRadius: '50px',
  backgroundColor: alpha('#fff', 0.08),
  border: `1px solid ${alpha('#fff', 0.1)}`,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha('#fff', 0.15),
    border: `1px solid ${alpha('#fff', 0.3)}`,
  },
}));

// --- Helper Data ---

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

// --- Component ---

export function TopBarWithLogo({ title }) {
  const [userName, setUserName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  // Navigation Menus State
  const [navAnchors, setNavAnchors] = useState({
    projects: null,
    inventory: null,
    orders: null
  });

  // Timeout refs to prevent closing when moving from button to menu
  const timeoutRefs = React.useRef({
    projects: null,
    inventory: null,
    orders: null
  });

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Navigation Data Structure
  const navCategories = {
    projects: {
      label: 'Projects',
      icon: <WorkIcon fontSize="small" />,
      items: [
        { name: 'Dashboard', path: '/manager-dashboard', icon: <DashboardIcon fontSize="small" /> },
        { name: 'All Projects', path: '/all-projects', icon: <ListAltIcon fontSize="small" /> },
        { name: 'Assign Slots', path: '/assign-slot', icon: <EventAvailableIcon fontSize="small" /> },
        { name: 'Generate Reports', path: '/generate-reports', icon: <AssessmentIcon fontSize="small" /> }
      ]
    },
    inventory: {
      label: 'Inventory',
      icon: <InventoryIcon fontSize="small" />,
      items: [
        { name: 'Search / Info', path: '/search-components', icon: <SearchIcon fontSize="small" /> },
        { name: 'Create Component', path: '/create-component', icon: <AddBoxIcon fontSize="small" /> },
        { name: 'Check-In', path: '/check-in', icon: <InputIcon fontSize="small" /> }
      ]
    },
    orders: {
      label: 'Orders & Carts',
      icon: <ShoppingCartIcon fontSize="small" />,
      items: [
        { name: 'Create Cart', path: '/get-order', icon: <AddShoppingCartIcon fontSize="small" /> },
        { name: 'View Carts', path: '/view-carts', icon: <ViewListIcon fontSize="small" /> },
        { name: 'Distribute Components', path: '/check-out', icon: <OutputIcon fontSize="small" /> },
        { name: 'Pending Components', path: '/pending-components', icon: <PendingIcon fontSize="small" /> },
        { name: 'Requirements', path: '/view-requirements/fetch', icon: <RequirementsIcon fontSize="small" /> }
      ]
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Handlers
  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);

  // Hover Handlers
  const handleNavOpen = (event, category) => {
    if (timeoutRefs.current[category]) {
      clearTimeout(timeoutRefs.current[category]);
    }
    setNavAnchors(prev => ({ ...prev, [category]: event.currentTarget }));
  };

  const handleNavClose = (category) => {
    timeoutRefs.current[category] = setTimeout(() => {
      setNavAnchors(prev => ({ ...prev, [category]: null }));
    }, 150); // Small delay to allow moving to menu
  };

  const handleMenuEnter = (category) => {
    if (timeoutRefs.current[category]) {
      clearTimeout(timeoutRefs.current[category]);
    }
  };

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  const handleNavigation = (path) => {
    navigate(path);
    setSidebarOpen(false);
    setNavAnchors({ projects: null, inventory: null, orders: null });
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
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleSidebarToggle}
                sx={{ ml: -1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Logo src={logo} alt="Logo" />

            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', md: '1.25rem' },
                display: { xs: 'none', sm: 'block' },
                letterSpacing: '0.5px',
                background: 'linear-gradient(45deg, #fff 30%, #a0a0a0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              PMS
            </Typography>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', ml: 4 }}>
                {Object.entries(navCategories).map(([key, category]) => (
                  <Box key={key}
                    onMouseLeave={() => handleNavClose(key)} // Close when leaving the container
                  >
                    <NavButton
                      startIcon={category.icon}
                      endIcon={<ArrowDownIcon sx={{ fontSize: '1rem !important' }} />}
                      onMouseEnter={(e) => handleNavOpen(e, key)}
                      // Remove onClick as it's now hover-based
                      active={Boolean(navAnchors[key]) ? 1 : 0}
                    >
                      {category.label}
                    </NavButton>
                    <StyledMenu
                      anchorEl={navAnchors[key]}
                      open={Boolean(navAnchors[key])}
                      onClose={() => handleNavClose(key)}
                      MenuListProps={{
                        onMouseEnter: () => handleMenuEnter(key),
                        onMouseLeave: () => handleNavClose(key)
                      }}
                      // Keep open on hover
                      sx={{ pointerEvents: 'none' }}
                      PaperProps={{ sx: { pointerEvents: 'auto' } }} // Re-enable pointer events for content
                    >
                      {category.items.map((item, index) => (
                        <MenuItem
                          key={index}
                          onClick={() => handleNavigation(item.path)}
                        >
                          <ListItemIcon sx={{ minWidth: '36px !important' }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText primary={item.name} />
                        </MenuItem>
                      ))}
                    </StyledMenu>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Account Settings">
              <UserChip onClick={handleUserMenuOpen}>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '0.9rem',
                    mr: 1
                  }}
                >
                  {userName.charAt(0)}
                </Avatar>
                <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', display: { xs: 'none', sm: 'block' } }}>
                  {userName}
                </Typography>
                <ArrowDownIcon sx={{ fontSize: '1rem', ml: 0.5, color: alpha('#fff', 0.7) }} />
              </UserChip>
            </Tooltip>

            <StyledMenu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #eee' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Signed in as</Typography>
                <Typography variant="body2" color="text.secondary">{userName}</Typography>
              </Box>
              <MenuItem onClick={() => { handleLogout(); handleUserMenuClose(); }} sx={{ mt: 1, color: '#d32f2f !important' }}>
                <ListItemIcon sx={{ color: '#d32f2f !important' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </StyledMenu>
          </Box>
        </StyledToolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={sidebarOpen}
        onClose={handleSidebarToggle}
        variant="temporary"
        PaperProps={{
          sx: { width: 280, background: '#fafafa' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#0f0c29', color: '#fff' }}>
          <Logo src={logo} alt="PMS" style={{ height: 35 }} />
          <Typography variant="h6" fontWeight="bold">PMS</Typography>
        </Box>

        <List sx={{ p: 1 }}>
          {Object.entries(navCategories).map(([key, category]) => (
            <React.Fragment key={key}>
              <ListSubheader
                sx={{
                  fontWeight: '700',
                  color: '#302b63',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  mt: 2
                }}
              >
                {category.label}
              </ListSubheader>
              {category.items.map((item, index) => (
                <ListItem key={`${key}-${index}`} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: '8px',
                      mb: 0.5,
                      '&:hover': { backgroundColor: alpha('#302b63', 0.08) },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: '#555' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500 }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              <Divider sx={{ my: 1, opacity: 0.5 }} />
            </React.Fragment>
          ))}

          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ borderRadius: '8px', color: '#d32f2f' }}>
              <ListItemIcon sx={{ minWidth: 40, color: '#d32f2f' }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Toolbar sx={{ minHeight: '70px' }} /> {/* Spacer */}
    </>
  );
}

export default TopBarWithLogo;
