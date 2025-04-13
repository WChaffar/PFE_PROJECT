import React from 'react';
import { Box, Typography, LinearProgress, Grid, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { tokens } from '../theme';

const steps = [
  { label: 'Planning', status: 'completed', icon: <CheckCircleIcon /> },
  { label: 'Design', status: 'completed', icon: <CheckCircleIcon /> },
  { label: 'Development', status: 'inProgress', icon: <RadioButtonUncheckedIcon color="success" /> },
  { label: 'Testing', status: 'waiting', icon: <AccessTimeIcon /> },
];

const ProjectPipeline = () => {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100; // Dynamic progress calculation
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      gridColumn="span 3"
      backgroundColor={colors.primary[400]}
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        boxShadow: 3,
        padding: 3,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        },
      }}
    >
      <Grid container spacing={3} alignItems="center">
        {/* Launch Info */}
        <Grid item xs={12} sm={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <RocketLaunchIcon fontSize="large" />
            <Box>
              <Typography fontWeight="bold" variant="h6">Project Launched Date</Typography>
              <Typography variant="h4">60 Days</Typography>
              <Typography variant="body2" color="text.secondary">Friday, December 15</Typography>
            </Box>
          </Box>
        </Grid>

        {/* Progress Bar + Steps */}
        <Grid item xs={12} sm={9}>
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': { bgcolor: 'limegreen' },
              }}
            />
          </Box>
          <Grid container spacing={3} justifyContent="space-between">
            {steps.map((step, index) => (
              <Grid item key={index}>
                <Box textAlign="center">
                  <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                    {step.icon}
                    <Typography fontWeight="bold">{step.label}</Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {step.status === 'completed' && 'Completed'}
                    {step.status === 'inProgress' && 'In Progress'}
                    {step.status === 'waiting' && 'In Waiting'}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProjectPipeline;
