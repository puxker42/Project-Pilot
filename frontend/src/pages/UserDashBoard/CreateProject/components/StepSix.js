// ============================================
import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Stack,
  Divider
} from '@mui/material';
import { stepAnimation } from '../utils/animations';

const StepSix = ({ formData, projectID, acknowledged, setAcknowledged, goBack, handleSubmit }) => {
  return (
    <motion.div key="step6" {...stepAnimation}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Review Summary
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Project ID
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {projectID}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Type
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formData.type}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Name
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formData.name}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {formData.description}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Team ID
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formData.teamID}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Guide ID
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formData.guideID}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Components
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.components.map((comp, i) => (
                    <TableRow key={i}>
                      <TableCell>{comp.id}</TableCell>
                      <TableCell>{comp.name}</TableCell>
                      <TableCell>{comp.purpose}</TableCell>
                      <TableCell>{comp.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />
              }
              label="I confirm all information is correct. And only components can be edited later."
            />
          </Box>

          <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={goBack}>
              Back
            </Button>
            <Button
              variant="contained"
              disabled={!acknowledged}
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default StepSix;
