import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Collapse,
  InputAdornment,
  Alert,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { stepAnimation } from '../utils/animations';
import ComponentSearchTable from './ComponentSearchTable';
import ComponentRequestForm from './ComponentRequestForm';

const StepThree = ({ formData, setFormData, allComponents, goBack, goNext }) => {
  const [search, setSearch] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  return (
    <motion.div key="step3" {...stepAnimation}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Component Selection
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Component Search
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                placeholder="Search component..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <IconButton
                onClick={() => setShowAvailable(!showAvailable)}
                sx={{ border: 1, borderColor: 'divider' }}
              >
                {showAvailable ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
          </Box>

          <Collapse in={showAvailable}>
            <ComponentSearchTable
              allComponents={allComponents}
              search={search}
              formData={formData}
              setFormData={setFormData}
            />
          </Collapse>

          <Alert severity="info">
            Can't find your component?{' '}
            <Box
              component="span"
              sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 'bold' }}
              onClick={() => setShowRequestForm(!showRequestForm)}
            >
              Request it here
            </Box>
          </Alert>

          <Collapse in={showRequestForm}>
            <ComponentRequestForm
              setFormData={setFormData}
              setShowRequestForm={setShowRequestForm}
            />
          </Collapse>

          {formData.components.length > 0 && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Selected Components:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.components.map((comp, i) => (
                  <Chip key={i} label={comp.name} color="primary" size="small" />
                ))}
              </Stack>
            </Box>
          )}

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button variant="outlined" onClick={goBack}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => goNext(4)}
              disabled={formData.components.length === 0}
            >
              Next
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </motion.div>
  );
};

export default StepThree;
