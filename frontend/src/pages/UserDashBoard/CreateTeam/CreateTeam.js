import React, { useState, useEffect } from 'react';
import TopBarWithlogo from '../TopBarWithLogo';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  ListItemSecondaryAction,
  Divider,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  School as SchoolIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function generateTEMCode() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return "TEM" + randomNumber;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      when: "beforeChildren"
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

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

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}

const CreateTeam = () => {
  const [teamName, setTeamName] = useState('');
  const [teamID] = useState(generateTEMCode());
  const [search, setSearch] = useState('');
  const [allMembers, setAllMembers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [userName, setUserName] = useState('');
  const [uID, setUID] = useState('');
  const [leadBatch, setLeadBatch] = useState(null);
  const [leadPassingYear, setLeadPassingYear] = useState(null);
  const [crossBatch, setCrossBatch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    async function fetchData() {
      const data = await getUserData();
      if (data) {
        setUID(data.ID);
        setUserName(data.name);
        setLeadBatch(data.batch);
        setLeadPassingYear(data.passingYear);

        setTeamMembers([{
          userID: data.ID,
          firstName: data.name.split(' ')[0] || data.name,
          lastName: data.name.split(' ')[1] || '',
          role: 'Lead',
          batch: data.batch
        }]);
      }
    }

    async function fetchStudentUsers() {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${BASE_URL}/get-all-users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        const result = await response.json();
        const studentsList = result.success
          ? result.data.filter(user => user.accountType === 'Student')
          : [];

        setAllMembers(studentsList);
      } catch (error) {
        console.error('Error fetching users:', error);
        setSnackbar({ open: true, message: 'Failed to load students', severity: 'error' });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    fetchStudentUsers();
  }, []);

  const handleAddMember = (member) => {
    if (member.userID === uID) return;
    if (!teamMembers.find(m => m.userID === member.userID)) {
      setTeamMembers([...teamMembers, { ...member, role: 'Member' }]);
      setSnackbar({ open: true, message: `${member.firstName} added to team`, severity: 'success' });
    }
  };

  const handleRemoveMember = (userID) => {
    if (userID === uID) return;
    setTeamMembers(prev => prev.filter(member => member.userID !== userID));
    setSnackbar({ open: true, message: 'Member removed from team', severity: 'info' });
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      setSnackbar({ open: true, message: 'Team name is required', severity: 'warning' });
      return;
    }

    const token = localStorage.getItem('token');
    const data = {
      teamName,
      teamID,
      members: teamMembers.map(member => ({
        userID: member.userID,
        role: member.role
      }))
    };

    try {
      const response = await fetch(`${BASE_URL}/create-team`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSnackbar({ open: true, message: 'Team created successfully!', severity: 'success' });
        setTimeout(() => {
          // Navigate or reset form here
        }, 1500);
      } else {
        setSnackbar({ open: true, message: `Failed to create team: ${result.message}`, severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Something went wrong while creating the team', severity: 'error' });
      console.error('Error creating team:', error);
    }
  };

  const filteredMembers = allMembers.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const userID = String(user.userID);
    const searchTerm = search.toLowerCase();
    const isAlreadyMember = teamMembers.some(member => member.userID === user.userID);
    const isCurrentUser = user.userID === uID;

    const validBatch = crossBatch
      ? user.passingYear === leadPassingYear
      : user.passingYear === leadPassingYear && user.batch === leadBatch;

    return !isCurrentUser && !isAlreadyMember && (fullName.includes(searchTerm) || userID.includes(searchTerm)) && validBatch;
  });

  if (loading) {
    return (
      <>
        <TopBarWithlogo title='Create New Team' />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} sx={{ color: '#1a004b' }} />
        </Box>
      </>
    );
  }

  // Calculate stats
  const teamSize = teamMembers.length;
  // Assuming a max team size for visual indicator (e.g. 4 or 5)
  const maxTeamSize = 4;
  const isTeamFull = teamSize >= maxTeamSize;

  return (
    <Box sx={{
      height: { xs: 'auto', md: '100vh' },
      display: 'flex',
      flexDirection: 'column',
      bgcolor: '#f8f9fa'
    }}>
      <TopBarWithlogo title='Create New Team' />

      {/* Main Content Area */}
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          flex: 1,
          overflow: { xs: 'visible', md: 'hidden' },
          p: { xs: 1, md: 2 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          maxWidth: '1800px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}
      >

        {/* LEFT PANE: Available Students */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          elevation={0}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            bgcolor: '#ffffff',
            minHeight: { xs: '500px', md: 'auto' }
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', bgcolor: '#fff' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ bgcolor: 'rgba(26, 0, 75, 0.1)', color: '#1a004b', mr: 2 }}>
                <PersonAddIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="700" color="#1a1a1a">
                  Available Students
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Found {filteredMembers.length} eligible students
                </Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              placeholder="Search by name or PRN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#f9f9f9',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: '#e0e0e0' },
                  '&.Mui-focused fieldset': { borderColor: '#1a004b' }
                }
              }}
            />
          </Box>

          {/* Scrollable List */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {filteredMembers.length > 0 ? (
              <List sx={{ p: 0 }}>
                <AnimatePresence>
                  {filteredMembers.map((user) => (
                    <motion.div
                      key={user.userID}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                    >
                      <ListItem
                        button
                        onClick={() => handleAddMember(user)}
                        disabled={isTeamFull}
                        sx={{
                          py: 1.5,
                          px: 2,
                          transition: 'all 0.2s',
                          '&:hover': { bgcolor: 'rgba(26, 0, 75, 0.04)' },
                          bgcolor: 'white'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#e0e0e0', color: '#555', fontSize: '0.9rem', fontWeight: 'bold' }}>
                            {user.firstName[0]}{user.lastName[0]}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" fontWeight="600" color="#333">
                              {user.firstName} {user.lastName}
                            </Typography>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                              <Box display="flex" alignItems="center" sx={{ bgcolor: '#f0f0f0', px: 0.8, py: 0.2, borderRadius: 1 }}>
                                <BadgeIcon sx={{ fontSize: 12, mr: 0.5, color: '#666' }} />
                                <Typography variant="caption" color="#555" fontWeight="500">{user.userID}</Typography>
                              </Box>
                              <Box display="flex" alignItems="center" sx={{ bgcolor: 'rgba(26, 0, 75, 0.08)', px: 0.8, py: 0.2, borderRadius: 1 }}>
                                <SchoolIcon sx={{ fontSize: 12, mr: 0.5, color: '#1a004b' }} />
                                <Typography variant="caption" color="#1a004b" fontWeight="600">EN{user.batch}</Typography>
                              </Box>
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <IconButton
                              edge="end"
                              onClick={() => handleAddMember(user)}
                              disabled={isTeamFull}
                              sx={{
                                color: isTeamFull ? '#ccc' : '#1a004b',
                                bgcolor: isTeamFull ? 'transparent' : 'rgba(26, 0, 75, 0.05)',
                                '&:hover': { bgcolor: isTeamFull ? 'transparent' : '#1a004b', color: 'white' }
                              }}
                            >
                              <AddIcon />
                            </IconButton>
                          </motion.div>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider component="li" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>
            ) : (
              <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" sx={{ opacity: 0.6 }}>
                <SearchIcon sx={{ fontSize: 60, mb: 2, color: '#ddd' }} />
                <Typography variant="body1" color="text.secondary">No students found</Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* RIGHT PANE: Team Details */}
        <Paper
          component={motion.div}
          variants={itemVariants}
          elevation={0}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: '2px solid rgba(26, 0, 75, 0.15)',
            overflow: 'hidden',
            bgcolor: '#ffffff',
            position: 'relative',
            minHeight: { xs: 'auto', md: 'auto' }
          }}
        >
          {/* Top Background Decoration */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #1a004b 0%, #2e008b 100%)'
          }} />

          {/* Team Settings Header */}
          <Box sx={{ p: 3, borderBottom: '1px solid #f0f0f0' }}>
            <Box mb={3}>
              <Typography variant="h6" fontWeight="700" color="#1a004b" gutterBottom>
                Team Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Define your team identity and structure
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={7}>
                <TextField
                  fullWidth
                  label="Team Name"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  variant="outlined"
                  size="small"
                  placeholder="e.g. Code Masters"
                  sx={{
                    '& .MuiInputLabel-root.Mui-focused': { color: '#1a004b' },
                    '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#1a004b' }
                  }}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Team ID"
                  value={teamID}
                  size="small"
                  InputProps={{ readOnly: true, startAdornment: <InputAdornment position="start">#</InputAdornment> }}
                  sx={{ bgcolor: '#f9f9f9', borderRadius: 1 }}
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={crossBatch}
                    onChange={() => setCrossBatch(!crossBatch)}
                    size="small"
                    sx={{ color: '#1a004b', '&.Mui-checked': { color: '#1a004b' } }}
                  />
                }
                label={<Typography variant="body2" color="#555">Allow Cross-Batch Members</Typography>}
              />
              <Chip
                label={`${teamMembers.length} / ${maxTeamSize} Members`}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: isTeamFull ? '#ff9800' : '#e8f5e9',
                  color: isTeamFull ? '#fff' : '#2e7d32'
                }}
              />
            </Box>
          </Box>

          {/* Team Members List */}
          <Box sx={{ flex: 1, overflowY: 'auto', bgcolor: '#fafafa', p: 2 }}>
            {/* Lead Card */}
            {teamMembers.filter(m => m.role === 'Lead').map(lead => (
              <motion.div key={lead.userID} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card variant="outlined" sx={{ mb: 2, borderColor: '#4caf50', bgcolor: '#f1f8e9' }}>
                  <CardContent sx={{ p: '16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: '#4caf50', mr: 2 }}>L</Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="700">{lead.firstName} {lead.lastName} (You)</Typography>
                        <Typography variant="caption" color="text.secondary">Team Lead • {lead.userID}</Typography>
                      </Box>
                    </Box>
                    <CheckCircleIcon sx={{ color: '#4caf50' }} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Member Cards */}
            <Stack spacing={2}>
              <AnimatePresence>
                {teamMembers.filter(m => m.role !== 'Lead').map(member => (
                  <motion.div
                    key={member.userID}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    layout
                  >
                    <Card variant="outlined" sx={{
                      transition: '0.2s',
                      '&:hover': { borderColor: '#1a004b', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }
                    }}>
                      <CardContent sx={{ p: '12px 16px !important', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#1a004b', fontSize: '0.8rem', mr: 1.5 }}>
                            {member.firstName[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">{member.firstName} {member.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{member.userID} • EN{member.batch}</Typography>
                          </Box>
                        </Box>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveMember(member.userID)}
                            sx={{ color: '#d32f2f', bgcolor: 'rgba(211, 47, 47, 0.05)', '&:hover': { bgcolor: '#d32f2f', color: 'white' } }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty Slots Guidelines */}
              {teamMembers.length < 2 && (
                <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2, textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Add at least 1 more member to create a team.
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>

          {/* Fixed Bottom Action Area */}
          <Box sx={{ p: 3, bgcolor: '#fff', borderTop: '1px solid #e0e0e0', textAlign: 'center' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleCreateTeam}
                disabled={teamMembers.length < 2 || !teamName.trim()}
                startIcon={<GroupIcon />}
                sx={{
                  py: 1.5,
                  bgcolor: '#1a004b',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(26, 0, 75, 0.2)',
                  '&:hover': { bgcolor: '#0d0026', boxShadow: '0 6px 16px rgba(26, 0, 75, 0.3)' }
                }}
              >
                Create Team Configuration
              </Button>
            </motion.div>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2, fontWeight: '600', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateTeam;
