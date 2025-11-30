// ============================================
import React from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  TextField,
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

const StepFour = ({ formData, handleComponentChange, goBack, goNext }) => {
  return (
    <motion.div key="step4" {...stepAnimation}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Set Purpose for Each Component
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Component</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.components.map((comp, index) => (
                <TableRow key={index}>
                  <TableCell>{comp.id}</TableCell>
                  <TableCell>{comp.name}</TableCell>
                  <TableCell>
                    <TextField
                      value={comp.purpose}
                      onChange={(e) => handleComponentChange(index, 'purpose', e.target.value)}
                      size="small"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={comp.quantity}
                      onChange={(e) => handleComponentChange(index, 'quantity', parseInt(e.target.value))}
                      inputProps={{ min: 1 }}
                      size="small"
                      sx={{ width: 100 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 3 }}>
          <Button variant="outlined" onClick={goBack}>
            Back
          </Button>
          <Button variant="contained" onClick={() => goNext(5)}>
            Next
          </Button>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default StepFour;