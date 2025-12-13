import React, { useState } from 'react';
import './ReportUploadSlot.css'; // We'll create this css file
import { CloudUpload, CheckCircle, Cancel, AccessTime, Send } from '@mui/icons-material';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress
} from '@mui/material';

const ReportUploadSlot = ({
    reportNumber,
    report,
    projectId,
    onUpload,
    onSendForApproval,
    disabled
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const token = localStorage.getItem('token');
            const uploadRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/upload`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${token}`,
                },
                body: formData
            });

            if (!uploadRes.ok) {
                throw new Error('File upload failed');
            }

            const data = await uploadRes.json();
            const fileUrl = data.fileUrl;

            await onUpload(reportNumber, fileUrl);
            setConfirmOpen(true);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed: " + error.message);
        } finally {
            setUploading(false);
            setSelectedFile(null);
        }
    };

    const handleSendForApproval = async () => {
        await onSendForApproval(reportNumber);
        setConfirmOpen(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'error';
            case 'Pending Approval': return 'warning';
            default: return 'default';
        }
    };

    const status = report?.status || 'Not Uploaded';

    return (
        <Card variant="outlined" sx={{ mb: 2, opacity: disabled ? 0.6 : 1 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Report {reportNumber}</Typography>
                    <Chip
                        label={status}
                        color={getStatusColor(status)}
                        size="small"
                        icon={status === 'Approved' ? <CheckCircle /> : status === 'Rejected' ? <Cancel /> : <AccessTime />}
                    />
                </Box>

                {report?.rejectionReason && (
                    <Box bgcolor="#ffebee" p={1} borderRadius={1} mb={2}>
                        <Typography variant="body2" color="error">
                            <strong>Rejection Reason:</strong> {report.rejectionReason}
                        </Typography>
                    </Box>
                )}

                {report?.fileUrl && (
                    <Box mb={2}>
                        <Button
                            variant="outlined"
                            size="small"
                            href={report.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View Uploaded File
                        </Button>
                    </Box>
                )}

                {status === 'Approved' && (
                    <Box mb={2} p={1} bgcolor="#e8f5e9" borderRadius={1} border="1px solid #c8e6c9">
                        <Typography variant="body2" color="success.dark" fontWeight="500">
                            Report is approved. Uploading a new file will reset the approval status.
                        </Typography>
                    </Box>
                )}

                {status === 'Pending Approval' ? (
                    <Typography variant="body2" color="textSecondary">
                        Waiting for instructor approval.
                    </Typography>
                ) : (
                    <Box>
                        <Box display="flex" gap={2} alignItems="center">
                            <input
                                accept=".pdf,.docx"
                                style={{ display: 'none' }}
                                id={`raised-button-file-${reportNumber}`}
                                type="file"
                                onChange={handleFileChange}
                                disabled={disabled}
                            />
                            <label htmlFor={`raised-button-file-${reportNumber}`}>
                                <Button variant="outlined" component="span" disabled={disabled}>
                                    {selectedFile ? selectedFile.name : "Choose File"}
                                </Button>
                            </label>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                                onClick={handleUpload}
                                disabled={!selectedFile || disabled || uploading}
                            >
                                {uploading ? "Uploading..." : "Upload"}
                            </Button>

                            {status === 'Uploaded - Not Sent' && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    endIcon={<Send />}
                                    onClick={() => setConfirmOpen(true)}
                                >
                                    Send for Approval
                                </Button>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Confirmation Dialog */}
                <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                    <DialogTitle>Send for Approval?</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Do you want to send this report to the instructor for approval now?
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setConfirmOpen(false)}>No, Later</Button>
                        <Button onClick={handleSendForApproval} variant="contained" color="primary" autoFocus>
                            Yes, Send
                        </Button>
                    </DialogActions>
                </Dialog>

            </CardContent>
        </Card>
    );
};

export default ReportUploadSlot;
