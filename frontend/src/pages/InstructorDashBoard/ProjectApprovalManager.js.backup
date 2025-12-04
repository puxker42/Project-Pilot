import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Paper,
  Divider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Badge,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  Group,
  CalendarToday,
  Assignment,
  Celebration,
  Visibility,
  Storage,
  CheckBox,
  CheckBoxOutlineBlank,
  ShoppingCart,
  Close,
  Email,
  Phone,
  School,
} from '@mui/icons-material';
import axios from 'axios';
import TopBarWithLogo from './TopBarWithLogo';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ProjectApprovalManager = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState(new Set());
  const [selectedProject, setSelectedProject] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/projects-me`, {
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectID, isApproved) => {
    setProcessingIds((prev) => new Set(prev).add(projectID));
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/${projectID}/approval`,
        { approved: isApproved },
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects((prev) =>
        prev.map((proj) =>
          proj.ID === projectID ? { ...proj, isApproved } : proj
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(projectID);
        return newSet;
      });
    }
  };

  const handleApprove = (project) => {
    updateProjectStatus(project.ID, true);
    setDialogOpen(false);
  };

  const handleDeny = (project) => {
    updateProjectStatus(project.ID, false);
    setDialogOpen(false);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const pendingProjects = projects.filter((p) => p.isApproved !== true);

  const getStatusColor = (status) => {
    switch (status) {
      case 0: return 'warning';
      case 1: return 'info';
      case 2: return 'success';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const InfoRow = ({ icon: Icon, label, value, color = 'text.secondary' }) => (
    <Box display="flex" alignItems="center" gap={1.5} minHeight={32}>
      <Icon sx={{ fontSize: 20, color: 'primary.main', flexShrink: 0 }} />
      <Box display="flex" alignItems="baseline" gap={1} flex={1} overflow="hidden">
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content', flexShrink: 0 }}>
          {label}:
        </Typography>
        <Typography variant="body2" fontWeight={500} color={color} noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );

  const ProjectDetailsDialog = ({ project, open, onClose, onApprove, onDeny }) => {
    if (!project) return null;

    return (
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ pb: 2, pr: 6 }}>
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
                {project.title}
              </Typography>
              <Chip
                label={getStatusLabel(project.status ?? 0)}
                color={getStatusColor(project.status ?? 0)}
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
              {project.ID}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 12,
              top: 12,
              color: 'text.secondary',
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 0 }}>
          <Box sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Description Section */}
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Assignment sx={{ fontSize: 20 }} />
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mt: 1 }}>
                  {project.description || 'No description provided'}
                </Typography>
              </Paper>

              {/* Project Information Grid */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  Project Information
                </Typography>
                <Grid container spacing={3}>
                  {/* Guide Information */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Person sx={{ fontSize: 22, color: 'primary.main' }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Project Guide
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="start" gap={2}>
                        <Avatar
                          src={project.projectGuide?.image}
                          alt={`${project.projectGuide?.firstName} ${project.projectGuide?.lastName}`}
                          sx={{ width: 56, height: 56, boxShadow: 2 }}
                        />
                        <Box flex={1} overflow="hidden">
                          <Typography variant="body1" fontWeight={600} noWrap>
                            {project.projectGuide
                              ? `${project.projectGuide.firstName} ${project.projectGuide.lastName}`
                              : 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
                            ID: {project.projectGuide?.userID || 'N/A'}
                          </Typography>
                          {project.projectGuide?.email && (
                            <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                              <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {project.projectGuide.email}
                              </Typography>
                            </Box>
                          )}
                          {project.projectGuide?.contactNumber && (
                            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                              <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {project.projectGuide.contactNumber}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Team Information */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Group sx={{ fontSize: 22, color: 'primary.main' }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Team Information
                        </Typography>
                      </Box>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {project.team?.teamName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {project.team?.teamID || 'N/A'}
                          </Typography>
                        </Box>
                        {project.team?.batch && (
                          <Box display="flex" alignItems="center" gap={1}>
                            <School sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Batch: <strong>{project.team.batch}</strong>
                            </Typography>
                          </Box>
                        )}
                        {project.team?.members && project.team.members.length > 0 && (
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                              MEMBERS ({project.team.members.length})
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                              {project.team.members.map((member, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${member.userID}`}
                                  size="small"
                                  color={member.role === 'Lead' ? 'primary' : 'default'}
                                  sx={{ fontFamily: 'monospace', fontWeight: 500 }}
                                />
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Grid>

                  {/* Additional Info */}
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <InfoRow
                            icon={CalendarToday}
                            label="Created"
                            value={formatDate(project.createdAt)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <InfoRow
                            icon={Storage}
                            label="Components"
                            value={`${project.components?.length || 0} items`}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <InfoRow
                            icon={Assignment}
                            label="Project ID"
                            value={project.ID}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Components Section */}
              <Box>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Storage sx={{ fontSize: 22, color: 'primary.main' }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Components List
                  </Typography>
                  <Chip 
                    label={`${project.components?.length || 0} Total`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                  />
                </Box>
                
                {project.components && project.components.length > 0 ? (
                  <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 700, py: 2 }}>Component ID</TableCell>
                          <TableCell sx={{ fontWeight: 700, py: 2 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, py: 2 }}>Purpose</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, py: 2, minWidth: 100 }}>Quantity</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, py: 2, minWidth: 120 }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, py: 2, minWidth: 100 }}>Carts</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {project.components.map((component, idx) => (
                          <TableRow 
                            key={component._id || idx} 
                            hover
                            sx={{ 
                              '&:last-child td': { border: 0 },
                              '&:hover': { bgcolor: '#f8f9fa' }
                            }}
                          >
                            <TableCell sx={{ py: 2 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: 'monospace', 
                                  fontWeight: 600,
                                  color: 'primary.main',
                                  bgcolor: '#e3f2fd',
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  display: 'inline-block'
                                }}
                              >
                                {component.id}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {component.name}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 2, maxWidth: 250 }}>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                                sx={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {component.purpose || '-'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              <Chip
                                label={component.quantity.toLocaleString()}
                                size="small"
                                sx={{ 
                                  fontWeight: 600,
                                  minWidth: 70,
                                  bgcolor: '#f5f5f5'
                                }}
                              />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              {component.accepted ? (
                                <Chip
                                  icon={<CheckCircle sx={{ fontSize: 16 }} />}
                                  label="Accepted"
                                  color="success"
                                  size="small"
                                  sx={{ fontWeight: 600, minWidth: 100 }}
                                />
                              ) : (
                                <Chip
                                  icon={<CheckBoxOutlineBlank sx={{ fontSize: 16 }} />}
                                  label="Pending"
                                  color="default"
                                  size="small"
                                  sx={{ fontWeight: 600, minWidth: 100 }}
                                />
                              )}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2 }}>
                              {component.carts && component.carts.length > 0 ? (
                                <Tooltip title={`${component.carts.length} cart(s)`}>
                                  <Badge 
                                    badgeContent={component.carts.length} 
                                    color="primary"
                                    sx={{
                                      '& .MuiBadge-badge': {
                                        fontWeight: 700
                                      }
                                    }}
                                  >
                                    <ShoppingCart sx={{ color: 'primary.main' }} />
                                  </Badge>
                                </Tooltip>
                              ) : (
                                <Typography variant="body2" color="text.disabled" fontWeight={500}>
                                  -
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Paper elevation={0} sx={{ p: 4, bgcolor: '#f8f9fa', textAlign: 'center', borderRadius: 2 }}>
                    <Storage sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      No components listed for this project
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Stack>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, bgcolor: '#f8f9fa', gap: 1.5 }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Close
          </Button>
          <Box flex={1} />
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => onDeny(project)}
            disabled={processingIds.has(project.ID)}
            sx={{ minWidth: 120, fontWeight: 600 }}
          >
            Deny Project
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => onApprove(project)}
            disabled={processingIds.has(project.ID)}
            sx={{ minWidth: 140, fontWeight: 600 }}
          >
            {processingIds.has(project.ID) ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              'Approve Project'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <TopBarWithLogo title="Project Approval Manager" />
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
            <CircularProgress size={60} />
          </Box>
        ) : pendingProjects.length === 0 ? (
          <Paper elevation={0} sx={{ p: 8, textAlign: 'center', bgcolor: 'white', borderRadius: 3 }}>
            <Celebration sx={{ fontSize: 120, color: '#4caf50', mb: 2 }} />
            <Typography variant="h4" gutterBottom fontWeight={600}>
              All Projects Approved!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              No pending approvals at the moment. Take a break 😊
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Pending Approvals
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {pendingProjects.length} project{pendingProjects.length !== 1 ? 's' : ''} awaiting your review
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {pendingProjects.map((project) => (
                <Grid item xs={12} md={6} xl={4} key={project.ID}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Stack spacing={2.5}>
                        {/* Header */}
                        <Box>
                          <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              sx={{
                                flex: 1,
                                mr: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: 1.4,
                              }}
                            >
                              {project.title}
                            </Typography>
                            <Chip
                              label={getStatusLabel(project.status ?? 0)}
                              color={getStatusColor(project.status ?? 0)}
                              size="small"
                              sx={{ fontWeight: 600, flexShrink: 0 }}
                            />
                          </Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                              fontFamily: 'monospace',
                              bgcolor: '#f5f5f5',
                              px: 1,
                              py: 0.5,
                              borderRadius: 0.5,
                              display: 'inline-block'
                            }}
                          >
                            {project.ID}
                          </Typography>
                        </Box>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            lineHeight: 1.6,
                            minHeight: 60,
                          }}
                        >
                          {project.description || 'No description provided'}
                        </Typography>

                        <Divider />

                        {/* Info Grid */}
                        <Stack spacing={1.5}>
                          <InfoRow
                            icon={Person}
                            label="Guide"
                            value={
                              project.projectGuide
                                ? `${project.projectGuide.firstName} ${project.projectGuide.lastName}`
                                : 'Unknown'
                            }
                          />
                          <InfoRow
                            icon={Group}
                            label="Team"
                            value={`${project.team?.teamName || 'N/A'} (${project.team?.teamID || 'N/A'})`}
                          />
                          <InfoRow
                            icon={Storage}
                            label="Components"
                            value={`${project.components?.length || 0} items`}
                            color="primary.main"
                          />
                          <InfoRow
                            icon={CalendarToday}
                            label="Created"
                            value={formatDate(project.createdAt)}
                          />
                        </Stack>

                        {/* Components Preview */}
                        {project.components && project.components.length > 0 && (
                          <>
                            <Divider />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                Top Components
                              </Typography>
                              <Stack spacing={1}>
                                {project.components.slice(0, 2).map((component, idx) => (
                                  <Paper
                                    key={component._id || idx}
                                    elevation={0}
                                    sx={{
                                      p: 1.5,
                                      bgcolor: '#f8f9fa',
                                      border: '1px solid #e0e0e0',
                                      borderRadius: 1,
                                    }}
                                  >
                                    <Box display="flex" justifyContent="space-between" alignItems="center" gap={1}>
                                      <Box flex={1} overflow="hidden">
                                        <Typography variant="body2" fontWeight={600} noWrap>
                                          {component.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                          {component.id} • Qty: {component.quantity.toLocaleString()}
                                        </Typography>
                                      </Box>
                                      <Box display="flex" gap={0.5} alignItems="center" flexShrink={0}>
                                        {component.accepted ? (
                                          <CheckBox sx={{ fontSize: 18, color: 'success.main' }} />
                                        ) : (
                                          <CheckBoxOutlineBlank sx={{ fontSize: 18, color: 'text.disabled' }} />
                                        )}
                                        {component.carts && component.carts.length > 0 && (
                                          <Badge badgeContent={component.carts.length} color="primary">
                                            <ShoppingCart sx={{ fontSize: 18 }} />
                                          </Badge>
                                        )}
                                      </Box>
                                    </Box>
                                  </Paper>
                                ))}
                                {project.components.length > 2 && (
                                  <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
                                    +{project.components.length - 2} more component{project.components.length - 2 !== 1 ? 's' : ''}
                                  </Typography>
                                )}
                              </Stack>
                            </Box>
                          </>
                        )}
                      </Stack>
                    </CardContent>

                    <Divider />

                    <CardActions sx={{ p: 2, gap: 1.5 }}>
                      <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => handleViewDetails(project)}
                        sx={{ flex: 1, fontWeight: 600 }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() => handleApprove(project)}
                        disabled={processingIds.has(project.ID)}
                        sx={{ flex: 1, fontWeight: 600 }}
                      >
                        {processingIds.has(project.ID) ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          'Approve'
                        )}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      <ProjectDetailsDialog
        project={selectedProject}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onApprove={handleApprove}
        onDeny={handleDeny}
      />
    </Box>
  );
};

export default ProjectApprovalManager;  