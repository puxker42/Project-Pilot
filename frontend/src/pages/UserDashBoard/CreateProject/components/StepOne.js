import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  Card,
  CardContent,
  Stack,
  Divider
} from '@mui/material';
import { stepAnimation } from '../utils/animations';

const StepOne = ({ formData, setFormData, projectID, acknowledged, setAcknowledged, goNext }) => {
  return (
    <motion.div key="step1" {...stepAnimation}>
      <Stack spacing={3}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Project Setup
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Project Type</InputLabel>
              <Select
                value={formData.type}
                label="Project Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="Mini">Mini</MenuItem>
                <MenuItem value="Mega">Mega</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Project ID"
              value={projectID}
              InputProps={{
                readOnly: true,
              }}
              fullWidth
            />

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                  />
                }
                label="I acknowledge that I have read instructions"
              />
            </Box>

            <Button
              variant="contained"
              size="large"
              disabled={!acknowledged || !formData.type}
              onClick={() => goNext(2)}
              sx={{ alignSelf: 'flex-end' }}
            >
              Next
            </Button>
          </Stack>
        </Paper>

        <Card sx={{ bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Instructions
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Project ID is system-generated and shown only now. Note it
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Only components can be edited later.
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Specify clear purpose for each component.
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                Team with incomplete project members needs HoD approval.
              </Typography>
              <Typography component="li" variant="body2">
                Unreturned components incur 70% cost penalty.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>
    </motion.div>
  );
};

export default StepOne;