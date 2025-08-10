import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  useTheme,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { tokens } from '../theme';
import { format } from 'date-fns';

const statusIconMap = {
  completed: <CheckCircleIcon color="success" />,
  inProgress: <RadioButtonUncheckedIcon color="primary" />,
  waiting: <AccessTimeIcon color="disabled" />,
};

const getProgressColor = (status) => {
  switch (status) {
    case 'completed': return 'limegreen';
    case 'inProgress': return 'orange';
    default: return 'grey';
  }
};

const ProjectPipeline = ({ TasksData = [] , projectData = [] }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Group tasks by phase
  const phases = [...new Set(TasksData.map(t => t.phase))];

  const steps = phases.map(phase => {
    const tasksInPhase = TasksData.filter(t => t.phase === phase);
    const avgProgress = tasksInPhase.reduce((sum, t) => sum + t.workload, 0) / tasksInPhase.length;

    let status;
    if (avgProgress === 100) status = 'completed';
    else if (avgProgress > 0) status = 'inProgress';
    else status = 'waiting';

    return {
      label: phase,
      status,
      progress: Math.round(avgProgress)
    };
  });

  return (
    <Box
      gridColumn="span 3"
      backgroundColor={colors.primary[400]}
      display="flex"
      justifyContent="space-between"
      alignItems="stretch"
      sx={{
        boxShadow: 3,
        padding: 3,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
    >
      {/* Launch Info - Left Side */}
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        sx={{
          minWidth: 250,
          borderRight: '1px solid',
          borderColor: 'divider',
          pr: 3,
        }}
      >
        <RocketLaunchIcon fontSize="large" />
        <Box>
          <Typography fontWeight="bold" variant="h6">
            Project Launch Date
          </Typography>
            <Typography variant="body3" color="text.secondary">
            {format(projectData.startDate, 'yyyy MMMM dd')}
          </Typography>
          <Typography variant="h4">{projectData.budget} Days</Typography>
        
        </Box>
      </Box>

      {/* Steps - Right Side */}
      <Box display="flex" flex={1} justifyContent="space-between" gap={2} pl={3}>
        {steps.map((step, index) => (
          <Box
            key={index}
            flex={1}
            textAlign="center"
            p={2}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              backgroundColor: 'background.paper',
              boxShadow: 2,
            }}
          >
            <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={1}>
              {statusIconMap[step.status]}
              <Typography fontWeight="bold">{step.label}</Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={step.progress}
              sx={{
                height: 8,
                borderRadius: 5,
                bgcolor: '#f0f0f0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getProgressColor(step.status),
                },
              }}
            />

            <Typography variant="body2" color="text.secondary" mt={1}>
              {step.progress}%
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {step.status === 'completed' && 'Completed'}
              {step.status === 'inProgress' && 'In Progress'}
              {step.status === 'waiting' && 'Waiting'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default ProjectPipeline;
