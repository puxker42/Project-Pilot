import React, { useState, useEffect } from 'react';
import TopBarWithlogo from '../TopBarWithLogo';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Paper,
  Card,
  CardContent,
  Fade,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

function generateTEMCode() {
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return "TEM" + randomNumber;
}

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
          role: 'Lead'
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
          <Box textAlign="center">
            <CircularProgress size={60} sx={{ color: '#8B2E2E' }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Loading team builder...
            </Typography>
          </Box>
        </Box>
      </>
    );
  }

  return (
    <Box sx={{ bgcolor: 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)', minHeight: '100vh' }}>
      <TopBarWithlogo title='Create New Team' />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: '1px solid #e0e0e0'
            }}
          >


            {/* Team Information Section */}
            <Card
              elevation={0}
              sx={{
                mb: 4,
                bgcolor: 'rgba(139, 46, 46, 0.03)',
                border: '2px solid rgba(139, 46, 46, 0.1)',
                borderRadius: 2
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="600"
                  gutterBottom
                  sx={{ mb: 3, color: '#8B2E2E', display: 'flex', alignItems: 'center' }}
                >
                  <CheckCircleIcon sx={{ mr: 1 }} />
                  Team Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={5}>
                    <TextField
                      fullWidth
                      label="Team Name"
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                      variant="outlined"
                      required
                      placeholder="Enter a creative team name"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#fff',
                          '&:hover fieldset': {
                            borderColor: '#8B2E2E',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2E2E',
                          }
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#8B2E2E'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Team ID"
                      value={teamID}
                      variant="outlined"
                      InputProps={{
                        readOnly: true,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#f9fafb',
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3} display="flex" alignItems="center">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={crossBatch}
                          onChange={() => setCrossBatch(!crossBatch)}
                          sx={{
                            color: '#8B2E2E',
                            '&.Mui-checked': {
                              color: '#8B2E2E',
                            }
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight="500">
                          Allow Cross-Batch
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Two Column Layout */}
            <Grid container spacing={3}>
              {/* Left Column - Search Students */}
              <Grid item xs={12} lg={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    height: '100%'
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        gutterBottom
                        display="flex"
                        alignItems="center"
                        sx={{ color: '#333' }}
                      >
                        <PersonAddIcon sx={{ mr: 1, color: '#8B2E2E' }} />
                        Available Students
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Search and add students to your team
                      </Typography>
                    </Box>

                    <TextField
                      fullWidth
                      placeholder="Search by name or PRN..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      variant="outlined"
                      size="medium"
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          bgcolor: '#f9fafb',
                          '&:hover fieldset': {
                            borderColor: '#8B2E2E',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#8B2E2E',
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#8B2E2E' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box
                      sx={{
                        maxHeight: 400,
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': { width: '8px' },
                        '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' },
                        '&::-webkit-scrollbar-thumb': { background: '#8B2E2E', borderRadius: '10px' },
                        '&::-webkit-scrollbar-thumb:hover': { background: '#6B1E1E' }
                      }}
                    >
                      <Grid container spacing={2}>
                        {filteredMembers.map(user => (
                          <Grid item xs={12} sm={6} key={user.userID}>
                            <Card
                              variant="outlined"
                              sx={{
                                height: '100%',
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: '#8B2E2E',
                                  bgcolor: 'rgba(139, 46, 46, 0.02)',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }
                              }}
                            >
                              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="700" color="#333" noWrap>
                                      {user.firstName} {user.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block', mt: 0.5 }}>
                                      {user.userID}
                                    </Typography>
                                  </Box>
                                  <Tooltip title="Add to team" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleAddMember(user)}
                                      sx={{
                                        color: '#8B2E2E',
                                        bgcolor: 'rgba(139, 46, 46, 0.05)',
                                        '&:hover': {
                                          bgcolor: '#8B2E2E',
                                          color: 'white'
                                        }
                                      }}
                                    >
                                      <AddIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                                <Box mt={1.5}>
                                  <Chip
                                    label={`EN${user.batch}`}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.7rem',
                                      bgcolor: 'rgba(139, 46, 46, 0.1)',
                                      color: '#8B2E2E',
                                      fontWeight: '600'
                                    }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                        {filteredMembers.length === 0 && (
                          <Grid item xs={12}>
                            <Box textAlign="center" py={6}>
                              <SearchIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                No matching students found
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column - Team Members */}
              <Grid item xs={12} lg={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: '2px solid #8B2E2E',
                    borderRadius: 2,
                    height: '100%',
                    bgcolor: 'rgba(139, 46, 46, 0.02)'
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 3 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight="600"
                            gutterBottom
                            display="flex"
                            alignItems="center"
                            sx={{ color: '#8B2E2E' }}
                          >
                            <PersonIcon sx={{ mr: 1 }} />
                            Your Team Members
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current team composition
                          </Typography>
                        </Box>
                        <Chip
                          label={`${teamMembers.length} ${teamMembers.length !== 1 ? 'Members' : 'Member'}`}
                          sx={{
                            bgcolor: '#8B2E2E',
                            color: '#fff',
                            fontWeight: '700',
                            fontSize: '0.9rem',
                            px: 1
                          }}
                        />
                      </Box>
                    </Box>

                    <TableContainer
                      sx={{
                        maxHeight: 450,
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        bgcolor: '#fff',
                        '&::-webkit-scrollbar': {
                          width: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: '#f1f1f1',
                          borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: '#8B2E2E',
                          borderRadius: '10px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: '#6B1E1E',
                        }
                      }}
                    >
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#8B2E2E', color: '#fff' }}>
                              ID
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#8B2E2E', color: '#fff' }}>
                              Name
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold', bgcolor: '#8B2E2E', color: '#fff' }}>
                              Role
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold', bgcolor: '#8B2E2E', color: '#fff' }}>
                              Action
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {teamMembers.map(member => (
                            <TableRow
                              key={member.userID}
                              hover
                              sx={{
                                '&:hover': {
                                  bgcolor: 'rgba(139, 46, 46, 0.05)'
                                }
                              }}
                            >
                              <TableCell sx={{ fontWeight: '500' }}>{member.userID}</TableCell>
                              <TableCell>{member.firstName} {member.lastName}</TableCell>
                              <TableCell>
                                <Chip
                                  label={member.role}
                                  size="small"
                                  sx={member.role === 'Lead' ? {
                                    bgcolor: '#4caf50',
                                    color: '#fff',
                                    fontWeight: '600'
                                  } : {
                                    bgcolor: '#e0e0e0',
                                    color: '#555',
                                    fontWeight: '600'
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">
                                {member.userID !== uID ? (
                                  <Tooltip title="Remove from team" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleRemoveMember(member.userID)}
                                      sx={{
                                        color: '#d32f2f',
                                        '&:hover': {
                                          bgcolor: 'rgba(211, 47, 47, 0.1)',
                                          transform: 'scale(1.1)'
                                        },
                                        transition: 'all 0.2s'
                                      }}
                                    >
                                      <RemoveIcon />
                                    </IconButton>
                                  </Tooltip>
                                ) : (
                                  <Chip
                                    label="Team Lead"
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                                      color: '#4caf50',
                                      fontWeight: '600',
                                      fontSize: '0.7rem'
                                    }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Action Button */}
            <Box display="flex" justifyContent="center" sx={{ mt: 5 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<GroupIcon />}
                onClick={handleCreateTeam}
                sx={{
                  px: 10,
                  py: 2,
                  borderRadius: 3,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  bgcolor: '#8B2E2E',
                  boxShadow: '0 6px 20px rgba(139, 46, 46, 0.3)',
                  '&:hover': {
                    bgcolor: '#6B1E1E',
                    boxShadow: '0 8px 25px rgba(139, 46, 46, 0.4)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                Create Team
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 2,
            fontWeight: '600'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateTeam;