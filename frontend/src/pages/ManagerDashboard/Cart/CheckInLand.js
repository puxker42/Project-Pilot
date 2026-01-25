import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  CardActionArea,
  Typography,
  Grid,
  Container,
  Stack
} from '@mui/material';
import {
  AssignmentTurnedIn,
  ShoppingCartCheckout,
  ArrowForward
} from '@mui/icons-material';

const CheckInMaster = () => {
  const navigate = useNavigate();

  const handleProjectCheckIn = () => {
    navigate('/project-in');
  };

  const handleCartCheckIn = () => {
    navigate('/view-carts');
  };

  const MenuCard = ({ title, description, icon: Icon, onClick, color }) => (
    <Card
      elevation={4}
      sx={{
        height: '100%',
        borderRadius: 4,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
          '& .icon-box': {
            transform: 'scale(1.1)',
            bgcolor: `${color}.main`,
            color: 'white'
          }
        }
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{
          height: '100%',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          justifyContent: 'center'
        }}
      >
        <Box
          className="icon-box"
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
            transition: 'all 0.3s ease'
          }}
        >
          <Icon sx={{ fontSize: 40 }} />
        </Box>

        <Typography variant="h5" component="h2" fontWeight={700} gutterBottom>
          {title}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '80%' }}>
          {description}
        </Typography>

        <Box
          display="flex"
          alignItems="center"
          gap={1}
          color={`${color}.main`}
          sx={{ fontWeight: 600 }}
        >
          Proceed <ArrowForward fontSize="small" />
        </Box>
      </CardActionArea>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa' }}>


      <Container maxWidth="lg" sx={{ mt: 4, pb: 8 }}>
        <Stack spacing={4} alignItems="center" mb={6}>
          <Box textAlign="center">
            <Typography
              variant="h3"
              fontWeight={800}
              color="text.primary"
              sx={{
                background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Check In Dashboard
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={500}>
              Select a category to manage returns and check-ins
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={4} justifyContent="center" alignItems="stretch">
          <Grid item xs={6} md={5} lg={4}>
            <MenuCard
              title="Project Check Check In"
              description="Manage project components, verify returns, and update project status."
              icon={AssignmentTurnedIn}
              color="primary"
              onClick={handleProjectCheckIn}
            />
          </Grid>

          <Grid item xs={6} md={5} lg={4}>
            <MenuCard
              title="Cart Check In"
              description="Process cart returns, check damage reports, and restock inventory."
              icon={ShoppingCartCheckout}
              color="secondary"
              onClick={handleCartCheckIn}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CheckInMaster;
