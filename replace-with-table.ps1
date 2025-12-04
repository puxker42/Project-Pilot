$filePath = "e:\Coding\PMT\Project-Pilot\frontend\src\pages\InstructorDashBoard\ProjectApprovalManager.js"
$content = Get-Content $filePath -Raw

# Define the old Grid/Card section to replace
$oldSection = @'
            <Grid container spacing={3}>
              {pendingProjects.map((project) => (
                <Grid item xs={12} md={6} xl={4} key={project.ID}>
'@

# Define the new Table section
$newSection = @'
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2,
                boxShadow: 3,
                overflow: 'hidden'
              }}
            >
              <Table sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#1976d2' }}>
                    <TableCell sx={{ fontWeight: 700, color: 'white', py: 2.5, fontSize: '0.95rem' }}>
                      Project
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'white', py: 2.5, fontSize: '0.95rem' }}>
                      Guide
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'white', py: 2.5, fontSize: '0.95rem' }}>
                      Team
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'white', py: 2.5, fontSize: '0.95rem' }}>
                      Components
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'white', py: 2.5, fontSize: '0.95rem' }}>
                      Reports
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'white', py: 2.5, fontSize: '0.95rem' }}>
                      Status
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: 'white', py: 2.5, fontSize: '0.95rem', minWidth: 240 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingProjects.map((project, index) => (
                    <TableRow
                      key={project.ID}
                      hover
                      sx={{
                        bgcolor: index % 2 === 0 ? 'white' : '#f8f9fa',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#e3f2fd !important',
                          transform: 'scale(1.001)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      {/* Project Title & ID */}
                      <TableCell sx={{ py: 2.5, maxWidth: 300 }}>
                        <Box>
                          <Typography 
                            variant="body1" 
                            fontWeight={700}
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.4,
                              mb: 0.5
                            }}
                          >
                            {project.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontFamily: 'monospace',
                              bgcolor: '#e0e0e0',
                              px: 1,
                              py: 0.3,
                              borderRadius: 0.5,
                              display: 'inline-block'
                            }}
                          >
                            {project.ID}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Guide */}
                      <TableCell sx={{ py: 2.5 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            src={project.projectGuide?.image}
                            alt={`${project.projectGuide?.firstName} ${project.projectGuide?.lastName}`}
                            sx={{ width: 40, height: 40 }}
                          />
                          <Box>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {project.projectGuide
                                ? `${project.projectGuide.firstName} ${project.projectGuide.lastName}`
                                : 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                              {project.projectGuide?.userID || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Team */}
                      <TableCell sx={{ py: 2.5 }}>
                        <Box>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {project.team?.teamName || 'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {project.team?.teamID || 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Components */}
                      <TableCell align="center" sx={{ py: 2.5 }}>
                        <Chip
                          icon={<Storage sx={{ fontSize: 18 }} />}
                          label={`${project.components?.length || 0}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600, minWidth: 70 }}
                        />
                      </TableCell>

                      {/* Reports */}
                      <TableCell align="center" sx={{ py: 2.5 }}>
                        {project.reports?.some(r => r.status === 'Pending Approval') ? (
                          <Tooltip title="Has pending report approvals">
                            <Chip
                              icon={<Description sx={{ fontSize: 18 }} />}
                              label="Pending"
                              size="small"
                              color="warning"
                              sx={{ fontWeight: 600, minWidth: 90 }}
                            />
                          </Tooltip>
                        ) : (
                          <Chip
                            icon={<Description sx={{ fontSize: 18 }} />}
                            label={`${project.reports?.length || 0}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, minWidth: 70 }}
                          />
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" sx={{ py: 2.5 }}>
                        <Chip
                          label={getStatusLabel(project.status ?? 0)}
                          color={getStatusColor(project.status ?? 0)}
                          size="small"
                          sx={{ fontWeight: 600, minWidth: 100 }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center" sx={{ py: 2.5 }}>
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Visibility />}
                            onClick={() => handleViewDetails(project)}
                            sx={{ fontWeight: 600, minWidth: 100 }}
                          >
                            Details
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            color="success"
                            startIcon={processingIds.has(project.ID) ? null : <CheckCircle />}
                            onClick={() => handleApprove(project)}
                            disabled={processingIds.has(project.ID)}
                            sx={{ fontWeight: 600, minWidth: 100 }}
                          >
                            {processingIds.has(project.ID) ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              'Approve'
                            )}
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
'@

# Find and replace the entire card section
$pattern = '(?s)            <Grid container spacing=\{3\}>.*?            </Grid>'
$replacement = $newSection + "`r`n          </>
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

export default ProjectApprovalManager;"

# Perform the replacement
if ($content -match $pattern) {
    Write-Host "Pattern found, replacing..."
    $newContent = $content -replace $pattern, $replacement
    Set-Content -Path $filePath -Value $newContent -NoNewline
    Write-Host "File updated successfully!"
} else {
    Write-Host "Pattern not found in file"
}
