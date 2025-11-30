// ============================================
import React from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Divider
} from '@mui/material';
import { stepAnimation } from '../utils/animations';

const StepFive = ({ formData, setFormData, goBack, goNext }) => {
  return (
    <motion.div key="step5" {...stepAnimation}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Team Information
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <TextField
            label="Team ID"
            value={formData.teamID}
            onChange={(e) => setFormData({ ...formData, teamID: e.target.value })}
            fullWidth
          />
          
          <TextField
            label="Guide ID"
            value={formData.guideID}
            onChange={(e) => setFormData({ ...formData, guideID: e.target.value })}
            fullWidth
          />

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button variant="outlined" onClick={goBack}>
              Back
            </Button>
            <Button variant="contained" onClick={() => goNext(6)}>
              Next
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default StepFive;