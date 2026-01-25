import React, { useEffect, useState } from 'react';
import './ProjectDashboard.css';


import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Tabs,
  Tab,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Badge,
  TextField
} from '@mui/material';
import {
  Close,
  Assignment,
  Person,
  Email,
  Phone,
  CalendarToday,
  Storage,
  CheckCircle,
  CheckBoxOutlineBlank,
  ShoppingCart,
  Description,
  Group,
  Celebration,
  Visibility,
  Cancel,
  Download
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const YEAR_MAP = {
  1: "First Year",
  2: "Second Year",
  3: "Third Year",
  4: "Final Year"
};

const BATCH_MAP = {
  1: "EN-1",
  2: "EN-2",
  3: "EN-3",
  4: "EN-4",
  5: "EN-5",
  6: "EN-6"
};

/* --- Helper Components & Functions adapted for Manager Dashboard --- */

const getStatusColor = (approved) => {
  return approved ? 'success' : 'warning';
};

const getStatusLabel = (approved) => {
  return approved ? 'Approved' : 'Pending';
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

const ManagerProjectDetailsDialog = ({
  project,
  open,
  onClose,
  selectedComponents = [],
  onCheckboxChange,
  onSelectAll,
  onBulkAccept,
  onRejectClick,
  isRejecting,
  remark,
  setRemark,
  onConfirmReject,
  onCancelReject
}) => {
  const [tabValue, setTabValue] = useState(0);

  if (!project) return null;

  // Map Manager attributes to Instructor view expected structure
  const mappedProject = {
    ...project,
    statusLabel: getStatusLabel(project.approved),
    statusColor: getStatusColor(project.approved),
    projectGuide: project.guideID, // Map guideID to projectGuide
    team: project.teamID // Map teamID to team
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 15;
    let yPos = 20;

    // Helper for styled text
    const addSectionHeader = (text, y) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 35, 126); // Navy Blue
      doc.text(text, margin, y);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y + 2, pageWidth - margin, y + 2);
      return y + 10;
    };

    const addLabelValue = (label, value, x, y) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100);
      doc.text(label + ':', x, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      doc.text(String(value), x + 35, y);
    };

    // --- Title Scope ---
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    // Split title if too long
    const titleLines = doc.splitTextToSize(mappedProject.title.toUpperCase(), pageWidth - (margin * 2));
    doc.text(titleLines, margin, yPos);
    yPos += (titleLines.length * 10);

    // --- Status & Basic Info ---
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Project ID: ${String(mappedProject.ID)}   |   Status: ${mappedProject.statusLabel}`, margin, yPos);
    yPos += 15;

    // --- Description ---
    yPos = addSectionHeader("Description", yPos);
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(mappedProject.description || 'No description provided', pageWidth - (margin * 2));
    doc.text(descLines, margin, yPos);
    yPos += (descLines.length * 5) + 10;

    // --- Project Guide ---
    // Check if space needed
    if (yPos > 240) { doc.addPage(); yPos = 20; }

    yPos = addSectionHeader("Project Guide", yPos);
    const guideName = mappedProject.projectGuide ? `${mappedProject.projectGuide.firstName} ${mappedProject.projectGuide.lastName}` : 'Unknown';
    const guideEmail = mappedProject.projectGuide?.email || 'N/A';
    const guideContact = mappedProject.projectGuide?.contactNumber ? String(mappedProject.projectGuide.contactNumber) : 'N/A';

    addLabelValue("Name", guideName, margin, yPos);
    addLabelValue("Email", guideEmail, margin, yPos + 6);
    addLabelValue("Contact", guideContact, margin, yPos + 12);
    yPos += 25;

    // --- Team Table ---
    if (yPos > 220) { doc.addPage(); yPos = 20; }
    yPos = addSectionHeader("Team Details", yPos);

    const teamData = mappedProject.team?.members?.map(m => [
      m.firstName ? `${m.firstName} ${m.lastName}` : 'Unknown',
      m.email || '-',
      String(m.userID),
      m.contactNumber ? String(m.contactNumber) : '-',
      m.role
    ]) || [];

    autoTable(doc, {
      startY: yPos,
      head: [['Student Name', 'Email', 'PRN', 'Contact', 'Role']],
      body: teamData,
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // --- Components Table ---
    // Check if new page needed for header
    if (yPos > 240) { doc.addPage(); yPos = 20; }
    yPos = addSectionHeader("Review Components", yPos);

    const compData = mappedProject.components?.map(c => [
      c.id,
      c.name,
      c.quantity.toString(),
      c.accepted ? 'Accepted' : 'Pending',
      c.purpose || '-'
    ]) || [];

    autoTable(doc, {
      startY: yPos,
      head: [['ID', 'Name', 'Qty', 'Status', 'Purpose']],
      body: compData,
      theme: 'striped',
      headStyles: { fillColor: [66, 66, 66], textColor: 255 },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        3: { fontStyle: 'bold', textColor: [0, 100, 0] } // Green-ish for status? Logic could be better but keeping simple
      },
      margin: { left: margin, right: margin }
    });

    // --- Footer ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Page ${i} of ${totalPages}  |  Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 290, { align: 'right' });
    }

    doc.save(`${mappedProject.ID}_Report.pdf`);
  };

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
              {mappedProject.title}
            </Typography>
            <Chip
              label={mappedProject.statusLabel}
              color={mappedProject.statusColor}
              sx={{ fontWeight: 600 }}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={handleDownloadPDF}
              sx={{ fontWeight: 600, ml: 2, borderColor: 'primary.main', color: 'primary.main' }}
            >
              PDF
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {mappedProject.ID}
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
          <Tab label={`Reports (${mappedProject.reports?.length || 0})`} />
          <Tab label="Team Details" />
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
                  {mappedProject.description || 'No description provided'}
                </Typography>
              </Paper>

              {/* Project Information Grid */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                  Project Information
                </Typography>
                <Grid container spacing={3}>
                  {/* Guide Information */}
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2.5, height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Person sx={{ fontSize: 22, color: 'primary.main' }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Project Guide
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="start" gap={2}>
                        <Avatar
                          src={mappedProject.projectGuide?.image}
                          alt={`${mappedProject.projectGuide?.firstName} ${mappedProject.projectGuide?.lastName}`}
                          sx={{ width: 56, height: 56, boxShadow: 2 }}
                        />
                        <Box flex={1} overflow="hidden">
                          <Typography variant="body1" fontWeight={600} noWrap>
                            {mappedProject.projectGuide
                              ? `${mappedProject.projectGuide.firstName} ${mappedProject.projectGuide.lastName}`
                              : 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block' }}>
                            ID: {mappedProject.projectGuide?.userID || 'N/A'}
                          </Typography>
                          {mappedProject.projectGuide?.email && (
                            <Box display="flex" alignItems="center" gap={0.5} mt={1}>
                              <Email sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {mappedProject.projectGuide.email}
                              </Typography>
                            </Box>
                          )}
                          {mappedProject.projectGuide?.contactNumber && (
                            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                              <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {mappedProject.projectGuide.contactNumber}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
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
                            value={formatDate(mappedProject.createdAt)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <InfoRow
                            icon={Storage}
                            label="Components"
                            value={`${mappedProject.components?.length || 0} items`}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <InfoRow
                            icon={Assignment}
                            label="Project ID"
                            value={mappedProject.ID}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              {/* Components Section */}
              <Box>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Storage sx={{ fontSize: 22, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Components List
                    </Typography>
                    <Chip
                      label={`${mappedProject.components?.length || 0} Total`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      onClick={onBulkAccept}
                      disabled={selectedComponents.length === 0}
                    >
                      Accept Selected
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={onRejectClick}
                      disabled={selectedComponents.length === 0}
                    >
                      Reject Selected
                    </Button>
                  </Box>
                </Box>

                {isRejecting && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#fff0f0', borderColor: '#ffcdd2' }}>
                    <Typography variant="subtitle2" color="error" gutterBottom fontWeight={600}>
                      Rejection Remark
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter reason for rejection..."
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      error={!remark.trim()}
                      helperText={!remark.trim() ? "Remark is required" : ""}
                      sx={{ mb: 2, bgcolor: 'white' }}
                    />
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      <Button size="small" onClick={onCancelReject} sx={{ color: 'text.secondary' }}>
                        Cancel
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={onConfirmReject}
                      >
                        Confirm Rejection
                      </Button>
                    </Box>
                  </Paper>
                )}

                {mappedProject.components && mappedProject.components.length > 0 ? (
                  <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                          <TableCell padding="checkbox">
                            <Box
                              onClick={onSelectAll}
                              sx={{
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {selectedComponents.length > 0 && selectedComponents.length === mappedProject.components.length ? (
                                <CheckCircle color="primary" fontSize="small" />
                              ) : (
                                <CheckBoxOutlineBlank color="action" fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, py: 2 }}>Component ID</TableCell>
                          <TableCell sx={{ fontWeight: 700, py: 2 }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 700, py: 2 }}>Purpose</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, py: 2, minWidth: 100 }}>Quantity</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, py: 2, minWidth: 120 }}>Status</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, py: 2, minWidth: 100 }}>Carts</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {mappedProject.components.map((component, idx) => {
                          const isSelected = selectedComponents.includes(component.id || component._id);
                          return (
                            <TableRow
                              key={component._id || idx}
                              hover
                              selected={isSelected}
                              sx={{
                                '&:last-child td': { border: 0 },
                                '&:hover': { bgcolor: '#f8f9fa' }
                              }}
                            >
                              <TableCell padding="checkbox">
                                <Box
                                  onClick={() => onCheckboxChange(component.id || component._id)}
                                  sx={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  {isSelected ? (
                                    <CheckCircle color="primary" fontSize="small" />
                                  ) : (
                                    <CheckBoxOutlineBlank color="action" fontSize="small" />
                                  )}
                                </Box>
                              </TableCell>
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
                          );
                        })}
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
            {mappedProject.reports && mappedProject.reports.length > 0 ? (
              <Stack spacing={2}>
                {mappedProject.reports.map((report) => (
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

        {tabValue === 2 && (
          <Box sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <Group sx={{ fontSize: 28, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight={600}>
                Team Details
              </Typography>
              {mappedProject.team?.teamName && (
                <Chip
                  label={mappedProject.team.teamName}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            {mappedProject.team?.members && mappedProject.team.members.length > 0 ? (
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>PRN</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Role</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappedProject.team.members.map((member, idx) => (
                      <TableRow key={idx} hover>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Avatar
                              src={member.image}
                              alt={member.firstName}
                              sx={{ width: 40, height: 40 }}
                            >
                              {member.firstName ? member.firstName.charAt(0) : <Person />}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {member.firstName ? `${member.firstName} ${member.lastName}` : 'Unknown Name'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {member.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={member.userID}
                            size="small"
                            sx={{ fontFamily: 'monospace', fontWeight: 600, bgcolor: '#e3f2fd', color: 'primary.main' }}
                          />
                        </TableCell>
                        <TableCell>
                          {member.contactNumber ? (
                            <Box display="flex" alignItems="center" gap={1}>
                              <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2">{member.contactNumber}</Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.disabled">-</Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {member.role === 'Lead' ? (
                            <Chip
                              icon={<Celebration sx={{ fontSize: 16 }} />}
                              label="Lead"
                              color="primary"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          ) : (
                            <Chip
                              label="Member"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Group sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="subtitle1" color="text.secondary">
                  No team members found for this project.
                </Typography>
              </Paper>
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
      </DialogActions>
    </Dialog>
  );
};

/* ----------------------------------------------------------------- */

const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [isRejecting, setIsRejecting] = useState(false);
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'not_approved'
  const [filterYear, setFilterYear] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}/get-all-projects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (data.success) {
          setProjects(data.data);
        } else {
          setError(data.message || 'Failed to fetch projects.');
        }
      } catch (err) {
        console.error(err);
        setError('Network or server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setSelectedComponents([]);
    setIsRejecting(false);
    setRemark('');
  };

  const closeModal = () => {
    setSelectedProject(null);
    setSelectedComponents([]);
    setIsRejecting(false);
    setRemark('');
  };

  const handleSelectAll = () => {
    if (!selectedProject) return;
    const allIds = selectedProject.components.map(comp => comp.id || comp._id);
    setSelectedComponents(
      selectedComponents.length === allIds.length ? [] : allIds
    );
  };

  const handleCheckboxChange = (id) => {
    setSelectedComponents(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkAccept = () => {
    if (selectedComponents.length === 0) return alert('Select components first.');
    handleBulkAcceptReject(true);
  };

  const handleRejectClick = () => {
    if (selectedComponents.length === 0) return alert('Select components first.');
    setIsRejecting(true);
  };

  const handleConfirmReject = () => {
    if (!remark.trim()) {
      alert('Please provide a remark before rejecting.');
      return;
    }
    handleBulkAcceptReject(false);
  };

  const handleBulkAcceptReject = async (status) => {
    const updatedComponents = selectedProject.components
      .filter(comp => selectedComponents.includes(comp.id || comp._id))
      .map(comp => ({
        id: comp.id || comp._id,
        accepted: status,
      }));

    const payload = {
      updatedComponents,
      remark: !status ? remark.trim() : null,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${BASE_URL}/update-project-components/${selectedProject.ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          status
            ? `Accepted ${selectedComponents.length} component(s).`
            : `Rejected ${selectedComponents.length} component(s) with remark: "${remark}"`
        );

        // Update the selected project components
        const newComponents = selectedProject.components.map(comp =>
          selectedComponents.includes(comp.id || comp._id)
            ? { ...comp, accepted: status }
            : comp
        );

        const updatedProject = {
          ...selectedProject,
          components: newComponents,
        };

        setSelectedProject(updatedProject);
        setProjects(prev =>
          prev.map(p => (p.ID === selectedProject.ID ? updatedProject : p))
        );

        setSelectedComponents([]);
        setRemark('');
        setIsRejecting(false);
        closeModal(); // Close modal after action
      } else {
        alert(data.message || 'Failed to update project components.');
      }
    } catch (err) {
      console.error(err);
      alert('Network or server error.');
    }
  };

  const isProjectApproved = (components = []) =>
    components.length > 0 && components.every(comp => comp.accepted);

  // Filter projects based on search term and selected filter status
  const filteredProjects = projects.filter((proj) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      proj.ID.toLowerCase().includes(term) ||
      proj.title.toLowerCase().includes(term) ||
      (proj.teamID?.teamID?.toLowerCase() || '').includes(term);

    const isApproved = isProjectApproved(proj.components);
    if (filterStatus === 'approved' && !isApproved) return false;
    if (filterStatus === 'not_approved' && isApproved) return false;

    if (filterYear !== 'all' && proj.year !== parseInt(filterYear)) return false;
    if (filterBatch !== 'all' && proj.batch !== parseInt(filterBatch)) return false;

    return matchesSearch;
  });

  return (
    <div className="project-dashboard1">
      <div className="mst1">
        <div className="controls1">
          <input
            type="text"
            placeholder="Search by Project ID, Name, or Team ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input1"
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select1"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="not_approved">Not Approved</option>
          </select>

          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="filter-select1"
          >
            <option value="all">All Years</option>
            <option value="1">First Year</option>
            <option value="2">Second Year</option>
            <option value="3">Third Year</option>
            <option value="4">Final Year</option>
          </select>

          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="filter-select1"
          >
            <option value="all">All Batches</option>
            <option value="1">EN-1</option>
            <option value="2">EN-2</option>
            <option value="3">EN-3</option>
            <option value="4">EN-4</option>
            <option value="5">EN-5</option>
            <option value="6">EN-6</option>
          </select>
        </div>

        {loading ? (
          <p>Loading projects...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : projects.length === 0 ? (
          <Box className="no-projects-container" display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={5}>
            <Assignment sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No projects available.
            </Typography>
          </Box>
        ) : filteredProjects.length === 0 ? (
          <div className="no-projects-container" style={{ textAlign: 'center' }}>
            <p>No matching projects found.</p>
          </div>
        ) : (
          <table className="project-table1">
            <thead className="mobile-hidden-header">
              <tr>
                <th>Project ID</th>
                <th>Project Name</th>
                <th>Team ID</th>
                <th>Year</th>
                <th>Approved</th>
                <th>Guide Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj, index) => (
                <tr key={index} className="project-mobile-card">
                  <td className="project-mobile-row-content" data-label="Project ID">{proj.ID}</td>
                  <td className="project-mobile-row-content" data-label="Project Name">{proj.title}</td>
                  <td className="project-mobile-row-content" data-label="Team ID">{proj.teamID?.teamID || 'N/A'}</td>
                  <td className="project-mobile-row-content" data-label="Year">{YEAR_MAP[proj.year] || 'N/A'}</td>
                  <td className="project-mobile-row-content" data-label="Approved" style={{ fontWeight: 'bold', color: proj.approved ? 'green' : 'red' }}>
                    {proj.approved ? 'Yes' : 'No'}
                  </td>
                  <td className="project-mobile-row-content" data-label="Guide Name">
                    {proj.guideID
                      ? `${proj.guideID.firstName} ${proj.guideID.lastName}`
                      : 'N/A'}
                  </td>
                  <td className="project-mobile-row-content" data-label="Action">
                    <button className="view-btn1" onClick={() => handleViewDetails(proj)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Use the new ManagerProjectDetailsDialog instead of the old modal */}
        <ManagerProjectDetailsDialog
          project={selectedProject}
          open={!!selectedProject}
          onClose={closeModal}
          selectedComponents={selectedComponents}
          onCheckboxChange={handleCheckboxChange}
          onSelectAll={handleSelectAll}
          onBulkAccept={handleBulkAccept}
          onRejectClick={handleRejectClick}
          isRejecting={isRejecting}
          remark={remark}
          setRemark={setRemark}
          onConfirmReject={handleConfirmReject}
          onCancelReject={() => setIsRejecting(false)}
        />
      </div>
    </div>
  );
};

export default ProjectDashboard;
