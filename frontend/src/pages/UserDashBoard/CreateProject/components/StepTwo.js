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

const StepTwo = ({ formData, setFormData, goBack, goNext }) => {
  return (
    <motion.div key="step2" {...stepAnimation}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Project Details
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Stack spacing={3}>
          <TextField
            label="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
          />
          
          <TextField
            label="Project Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={4}
            fullWidth
          />

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button variant="outlined" onClick={goBack}>
              Back
            </Button>
            <Button variant="contained" onClick={() => goNext(3)}>
              Next
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default StepTwo;