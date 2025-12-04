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
  Tabs,
  Tab,
  TextField,
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
  Description,
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

  // Report Rejection State
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedReportToReject, setSelectedReportToReject] = useState(null);

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

  const handleApproveReport = async (project, reportNumber) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/projects/${project.ID}/report/${reportNumber}/status`,
        { status: 'Approved' },
        { headers: { authorization: `Bearer ${token}` } }
      );
      fetchProjects();
      if (selectedProject && selectedProject.ID === project.ID) {
        const updatedReports = selectedProject.reports ? selectedProject.reports.map(r =>
          r.reportNumber === reportNumber ? { ...r, status: 'Approved' } : r
        ) : [];
        setSelectedProject({ ...selectedProject, reports: updatedReports });
      }
    } catch (error) {
      console.error("Error approving report", error);
    }
  };

  const handleRejectReport = async () => {
    if (!selectedReportToReject) return;
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/projects/${selectedReportToReject.projectId}/report/${selectedReportToReject.reportNumber}/status`,
        { status: 'Rejected', rejectionReason: rejectReason },
        { headers: { authorization: `Bearer ${token}` } }
      );
      fetchProjects();
      setRejectDialogOpen(false);
      setRejectReason('');

      if (selectedProject) {
        const updatedReports = selectedProject.reports ? selectedProject.reports.map(r =>
          r.reportNumber === selectedReportToReject.reportNumber ? { ...r, status: 'Rejected', rejectionReason: rejectReason } : r
        ) : [];
        setSelectedProject({ ...selectedProject, reports: updatedReports });
      }
    } catch (error) {
      console.error("Error rejecting report", error);
    }
  };

  const openRejectDialog = (projectId, reportNumber) => {
    setSelectedReportToReject({ projectId, reportNumber });
    setRejectDialogOpen(true);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const pendingProjects = projects.filter((p) => p.isApproved !== true || p.reports?.some(r => r.status === 'Pending Approval'));

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
    const [tabValue, setTabValue] = useState(0);

    if (!project) return null;

    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
    };

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
        <DialogTitle sx={{ pb: 0, pr: 6 }}>
          <Box mb={2}>
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

          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Details" />
            <Tab label={`Reports (${project.reports?.length || 0})`} />
          </Tabs>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {tabValue === 0 && (
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
          )}

          {tabValue === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Submitted Reports</Typography>
              {project.reports && project.reports.length > 0 ? (
                <Stack spacing={2}>
                  {project.reports.map((report) => (
                    <Card key={report.reportNumber} variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight="bold">
                            Report {report.reportNumber}
                          </Typography>
                          <Chip
                            label={report.status}
                            color={report.status === 'Approved' ? 'success' : report.status === 'Rejected' ? 'error' : 'warning'}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Uploaded: {new Date(report.uploadedAt).toLocaleString()}
                        </Typography>
                        <Box mt={2} display="flex" gap={2}>
                          <Button
                            variant="outlined"
                            startIcon={<Description />}
                            href={report.fileUrl}
                            target="_blank"
                          >
                            View File
                          </Button>
                          {report.status === 'Pending Approval' && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleApproveReport(project, report.reportNumber)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() => openRejectDialog(project.ID, report.reportNumber)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Box>
                        {report.rejectionReason && (
                          <Box mt={2} bgcolor="#ffebee" p={1} borderRadius={1}>
                            <Typography variant="body2" color="error">
                              Reason: {report.rejectionReason}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <Typography color="textSecondary">No reports submitted yet.</Typography>
              )}
            </Box>
          )}
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
          {tabValue === 0 && (
            <>
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
            </>
          )}
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
              Great job! You've cleared the queue.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {pendingProjects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.ID}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      borderColor: 'primary.main',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Chip
                        label={project.ID}
                        size="small"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          bgcolor: '#e3f2fd',
                          color: 'primary.main',
                        }}
                      />
                      <Chip
                        label={getStatusLabel(project.status ?? 0)}
                        color={getStatusColor(project.status ?? 0)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Typography variant="h6" gutterBottom fontWeight={700} sx={{ lineHeight: 1.3, mb: 2 }}>
                      {project.title}
                    </Typography>

                    <Stack spacing={1.5}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Person sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {project.projectGuide
                            ? `${project.projectGuide.firstName} ${project.projectGuide.lastName}`
                            : 'No Guide Assigned'}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Group sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Team: <strong>{project.team?.teamName || 'N/A'}</strong>
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(project.createdAt)}
                        </Typography>
                      </Box>
                      {project.reports?.some(r => r.status === 'Pending Approval') && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Description sx={{ fontSize: 18, color: 'warning.main' }} />
                          <Typography variant="body2" color="warning.main" fontWeight="bold">
                            Report Pending Approval
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 2, pt: 1.5 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleViewDetails(project)}
                      endIcon={<Visibility />}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <ProjectDetailsDialog
        project={selectedProject}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onApprove={handleApprove}
        onDeny={handleDeny}
      />

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Report</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for Rejection"
            fullWidth
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectReport} color="error" variant="contained">Reject</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectApprovalManager;