import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjects } from "../../actions/projectAction";
import { getTasksByManagerId } from "../../actions/taskAction";
import { getAllEmployeeAssignements } from "../../actions/assignementsAction";
import { generateProjectReport, generateBulkReport } from "../../actions/reportAction";
import { generatePDFReport, generateExcelReport, generateWordReport } from "../../services/documentGeneratorService";

// Helper function pour créer un nom de fichier avec timestamp
const createTimestampedFilename = (baseName) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  
  // Format: YYYY-MM-DD_HH-mm-ss-SSS
  const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}-${milliseconds}`;
  
  return `${baseName}_${timestamp}`;
};

const CustomToolbar = () => (
  <GridToolbarContainer>
    <Box display="flex" flexDirection="row" gap={2} alignItems="center">
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </Box>
  </GridToolbarContainer>
);

const Reports = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  
  // Redux state
  const { projects, error } = useSelector((state) => state.projects);
  const selectedTasks = useSelector((state) => state.tasks.tasks);
  const selectedAssignements = useSelector((state) => state.assignements.assignements);
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState({});
  const [projectWorkload, setProjectWorkload] = useState([]);
  const [assignments, setAssignements] = useState([]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await dispatch(getAllProjects());
        await dispatch(getTasksByManagerId());
        await dispatch(getAllEmployeeAssignements());
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [dispatch]);

  // Update assignments when selected assignments change
  useEffect(() => {
    if (selectedAssignements.length !== 0) {
      setAssignements(selectedAssignements);
    }
  }, [selectedAssignements]);

  // Calculate project workload based on phase progress (like ProjectPipeline component)
  useEffect(() => {
    if (selectedTasks?.length !== 0) {
      // Fixed step order (same as ProjectPipeline)
      const STEP_ORDER = ["Planning", "Design", "Development", "Testing"];
      
      // Group tasks by project and calculate phase-based progress
      const projectProgressMap = {};

      selectedTasks.forEach((task) => {
        const projectId = task.project._id;
        const projectName = task.project?.projectName || "Unnamed Project";
        const phase = task.projectPhase;
        
        if (!projectProgressMap[projectId]) {
          projectProgressMap[projectId] = {
            projectName,
            phases: {}
          };
        }

        if (!projectProgressMap[projectId].phases[phase]) {
          projectProgressMap[projectId].phases[phase] = {
            tasks: [],
            totalWorkload: 0,
            taskCount: 0
          };
        }

        projectProgressMap[projectId].phases[phase].tasks.push(task);
        projectProgressMap[projectId].phases[phase].totalWorkload += task.workload || 0;
        projectProgressMap[projectId].phases[phase].taskCount += 1;
      });

      // Calculate progress for each project based on phase averages
      const projectWorkloadData = Object.entries(projectProgressMap).map(
        ([projectId, projectData]) => {
          const phaseProgresses = [];
          
          // Calculate progress for each phase (same logic as ProjectPipeline)
          STEP_ORDER.forEach((phase) => {
            const phaseData = projectData.phases[phase];
            if (phaseData && phaseData.taskCount > 0) {
              const avgPhaseProgress = Math.round(phaseData.totalWorkload / phaseData.taskCount);
              phaseProgresses.push(avgPhaseProgress);
            } else {
              // Phase has no tasks, consider it as 0% progress
              phaseProgresses.push(0);
            }
          });
          
          // Project progress = average of all phase progresses
          const projectProgress = phaseProgresses.length > 0 
            ? Math.round(phaseProgresses.reduce((sum, progress) => sum + progress, 0) / phaseProgresses.length)
            : 0;

          return {
            projectId,
            project: projectData.projectName,
            progress: projectProgress,
            phaseProgresses: STEP_ORDER.map((phase, index) => ({
              phase,
              progress: phaseProgresses[index]
            })),
            taskCount: Object.values(projectData.phases).reduce((sum, phase) => sum + phase.taskCount, 0),
          };
        }
      );

      setProjectWorkload(projectWorkloadData);
    }
  }, [selectedTasks]);

  // Format projects data for DataGrid
  const formattedProjects = projects.map(project => ({
    id: project._id,
    projectName: project.projectName,
    client: project.client,
    projectType: project.projectType,
    projectCategory: project.projectCategory,
    projectPriority: project.projectPriority,
    budget: project.budget,
    startDate: new Date(project.startDate).toLocaleDateString(),
    endDate: new Date(project.endDate).toLocaleDateString(),
    deliveryDate: new Date(project.deliveryDate).toLocaleDateString(),
    status: getProjectStatus(project),
    progress: calculateProjectProgress(project),
  }));

  // Helper function to determine project status based on task workload
  function getProjectStatus(project) {
    return getProjectStatusFromProgress(project);
  }

  // Helper function to calculate project progress based on tasks
  function calculateProjectProgress(project) {
    const projectProgress = projectWorkload.find(
      (p) => p.projectId === project._id
    );
    return projectProgress ? projectProgress.progress : 0;
  }

  // Helper function to determine project status based on phase progress (like ProjectPipeline)
  function getProjectStatusFromProgress(project) {
    const STEP_ORDER = ["Planning", "Design", "Development", "Testing"];
    
    // Get tasks for this project grouped by phase
    const projectTasks = selectedTasks.filter(task => task.project._id === project._id);
    
    if (projectTasks.length === 0) return 'Not Started';
    
    // Calculate phase progresses
    const phaseProgresses = STEP_ORDER.map((phase) => {
      const tasksInPhase = projectTasks.filter(t => t.projectPhase === phase);
      if (tasksInPhase.length === 0) return 0;
      
      const avgProgress = tasksInPhase.reduce((sum, t) => sum + (t.workload || 0), 0) / tasksInPhase.length;
      return Math.round(avgProgress);
    });
    
    // Project status based on phase completion (same logic as ProjectPipeline)
    const completedPhases = phaseProgresses.filter(progress => progress === 100).length;
    const startedPhases = phaseProgresses.filter(progress => progress > 0).length;
    
    if (completedPhases === STEP_ORDER.length) return 'Completed';
    if (startedPhases === 0) return 'Not Started';
    return 'In Progress';
  }

  // Handle individual project export
  const handleProjectExport = async (projectId, format) => {
    setExportLoading(prev => ({ ...prev, [`${projectId}-${format}`]: true }));
    
    try {
      // Generate report using API
      const result = await dispatch(generateProjectReport(projectId, format));
      
      if (result.success) {
        // Create and download the file
        const project = projects.find(p => p._id === projectId);
        const projectName = project ? project.projectName : 'Project';
        const filename = createTimestampedFilename(`${projectName}_Report`);
        await downloadReportFile(result.data.data, format, filename);
        alert(`${format.toUpperCase()} report generated successfully!`);
      } else {
        throw new Error(result.error || 'Failed to generate report');
      }
      
    } catch (error) {
      console.error(`Error exporting ${format} for project ${projectId}:`, error);
      alert(`Error generating ${format.toUpperCase()} report: ${error.message}`);
    } finally {
      setExportLoading(prev => ({ ...prev, [`${projectId}-${format}`]: false }));
    }
  };

  // Handle bulk export for all projects
  const handleBulkExport = async (format) => {
    setExportLoading(prev => ({ ...prev, [`bulk-${format}`]: true }));
    
    try {
      // Generate bulk report using API
      const result = await dispatch(generateBulkReport(format));
      
      if (result.success) {
        // Create and download the file
        const filename = createTimestampedFilename('All_Projects_Report');
        await downloadReportFile(result.data.data, format, filename);
        alert(`Bulk ${format.toUpperCase()} report generated successfully!`);
      } else {
        throw new Error(result.error || 'Failed to generate bulk report');
      }
    } catch (error) {
      console.error(`Error exporting bulk ${format}:`, error);
      alert(`Error generating bulk ${format.toUpperCase()} report: ${error.message}`);
    } finally {
      setExportLoading(prev => ({ ...prev, [`bulk-${format}`]: false }));
    }
  };

  // Download report file based on API data
  const downloadReportFile = async (reportData, format, filename) => {
    switch (format) {
      case 'pdf':

        await generatePDFReport(reportData, filename);
        break;
      case 'excel':
        generateExcelReport(reportData, filename);
        break;
      case 'word':
        await generateWordReport(reportData, filename);
        break;
      default:
        throw new Error('Unsupported format');
    }
  };





  const columns = [
    {
      field: "projectName",
      headerName: "Project Name",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <span role="img" aria-label="folder">📁</span>
          {row.projectName}
        </Box>
      ),
    },
    {
      field: "client",
      headerName: "Client",
      flex: 1,
    },
    {
      field: "projectType",
      headerName: "Type",
      flex: 0.8,
      renderCell: ({ row }) => (
        <Chip 
          label={row.projectType} 
          size="small"
          color={row.projectType === 'external' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      field: "projectCategory",
      headerName: "Category",
      flex: 1,
    },
    {
      field: "projectPriority",
      headerName: "Priority",
      flex: 0.8,
      renderCell: ({ row }) => {
        const priorityColors = {
          low: 'success',
          medium: 'warning',
          high: 'error',
          critical: 'error'
        };
        return (
          <Chip 
            label={row.projectPriority} 
            size="small"
            color={priorityColors[row.projectPriority] || 'default'}
          />
        );
      },
    },
    {
      field: "budget",
      headerName: "Budget (jours)",
      flex: 0.8,
      renderCell: ({ row }) => `${row.budget?.toLocaleString()} jours`,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.8,
      renderCell: ({ row }) => {
        const statusColors = {
          'Not Started': 'default',
          'In Progress': 'primary',
          'Completed': 'success'
        };
        return (
          <Chip 
            label={row.status} 
            size="small"
            color={statusColors[row.status] || 'default'}
          />
        );
      },
    },
    {
      field: "progress",
      headerName: "Progress",
      flex: 0.8,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2">{row.progress}%</Typography>
          <Typography variant="caption" color={colors.grey[400]}>
            (task-based)
          </Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Export",
      flex: 1.5,
      sortable: false,
      filterable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap={0.5}>
          {['pdf', 'excel', 'word'].map((format) => {
            const isLoading = exportLoading[`${row.id}-${format}`];
            const Icon = format === 'pdf' ? PictureAsPdfIcon : 
                        format === 'excel' ? TableChartIcon : DescriptionIcon;
            
            return (
              <Button
                key={format}
                size="small"
                variant="outlined"
                disabled={isLoading}
                onClick={() => handleProjectExport(row.id, format)}
                sx={{
                  minWidth: '32px',
                  padding: '4px',
                  color: colors.grey[100],
                  borderColor: colors.grey[400],
                }}
              >
                {isLoading ? (
                  <CircularProgress size={16} />
                ) : (
                  <Icon fontSize="small" />
                )}
              </Button>
            );
          })}
        </Box>
      ),
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading projects...</Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box m="20px">
        <Header
          title="Reports"
          subtitle="Generate detailed reports on project for informed decision-making."
        />
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading projects: {error}
        </Alert>
      </Box>
    );
  }

  // Show empty state
  if (!projects || projects.length === 0) {
    return (
      <Box m="20px">
        <Header
          title="Reports"
          subtitle="Generate detailed reports on project for informed decision-making."
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          No projects found. Create some projects first to generate reports.
        </Alert>
      </Box>
    );
  }

  return (
    <Box m="20px">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Reports"
          subtitle="Generate detailed reports on your projects with task-based progress tracking."
        />
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="h6" fontWeight="300" whiteSpace="nowrap">
            Export all projects:
          </Typography>
          <Button
            startIcon={exportLoading['bulk-pdf'] ? <CircularProgress size={16} /> : <PictureAsPdfIcon />}
            onClick={() => handleBulkExport("pdf")}
            disabled={exportLoading['bulk-pdf']}
            sx={buttonStyle(colors)}
          >
            PDF
          </Button>
          <Button
            startIcon={exportLoading['bulk-word'] ? <CircularProgress size={16} /> : <DescriptionIcon />}
            onClick={() => handleBulkExport("word")}
            disabled={exportLoading['bulk-word']}
            sx={buttonStyle(colors)}
          >
            Word
          </Button>
          <Button
            startIcon={exportLoading['bulk-excel'] ? <CircularProgress size={16} /> : <TableChartIcon />}
            onClick={() => handleBulkExport("excel")}
            disabled={exportLoading['bulk-excel']}
            sx={buttonStyle(colors)}
          >
            Excel
          </Button>
        </Box>
      </Box>

      {/* Project Statistics */}
      <Box mt={2} mb={3}>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Chip 
            label={`Total Projects: ${projects.length}`} 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label={`Active: ${formattedProjects.filter(p => p.status === 'In Progress').length}`} 
            color="success" 
            variant="outlined"
          />
          <Chip 
            label={`Completed: ${formattedProjects.filter(p => p.status === 'Completed').length}`} 
            color="info" 
            variant="outlined"
          />
          <Chip 
            label={`Not Started: ${formattedProjects.filter(p => p.status === 'Not Started').length}`} 
            color="warning" 
            variant="outlined"
          />
          <Chip 
            label={`Total Tasks: ${selectedTasks.length}`} 
            color="secondary" 
            variant="outlined"
          />
          <Typography variant="caption" color={colors.grey[300]} sx={{ ml: 2 }}>
            📊 Statistics based on task completion
          </Typography>
        </Box>
      </Box>

      {/* DataGrid */}
      <Box
        height="60vh"
        sx={gridStyles(colors)}
      >
        <DataGrid
          rows={formattedProjects}
          columns={columns}
          components={{ Toolbar: CustomToolbar }}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50, 100]}
          pagination
          disableRowSelectionOnClick
          density="standard"
        />
      </Box>

      {/* Quick Generation Boxes */}
      <Box mt={4}>
        <Typography variant="h5" mb={2} color={colors.grey[100]}>
          Quick Report Generation
        </Typography>
        <Box
          display="grid"
          gridTemplateColumns="repeat(auto-fit, minmax(250px, 1fr))"
          gap="20px"
        >
          {["PDF", "Word", "Excel"].map((type) => {
            const icons = {
              PDF: <PictureAsPdfIcon sx={{ fontSize: 40 }} />,
              Word: <DescriptionIcon sx={{ fontSize: 40 }} />,
              Excel: <TableChartIcon sx={{ fontSize: 40 }} />,
            };

            const isLoading = exportLoading[`bulk-${type.toLowerCase()}`];

            return (
              <Box
                key={type}
                backgroundColor={colors.primary[400]}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                padding="20px"
                borderRadius="8px"
                sx={{ 
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: !isLoading ? colors.primary[300] : colors.primary[400],
                    transform: !isLoading ? 'translateY(-2px)' : 'none',
                  }
                }}
                onClick={() => !isLoading && handleBulkExport(type.toLowerCase())}
              >
                {isLoading ? (
                  <CircularProgress sx={{ fontSize: 40 }} />
                ) : (
                  icons[type]
                )}
                <Typography variant="h6" fontWeight="300" mt={1} textAlign="center">
                  {isLoading ? `Generating ${type}...` : `Generate ${type} Report`}
                </Typography>
                <Typography variant="body2" color={colors.grey[300]} textAlign="center" mt={1}>
                  Export all {projects.length} projects to {type}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

const buttonStyle = (colors) => ({
  color: colors.grey[100],
  fontSize: "14px",
  fontWeight: "bold",
  padding: "10px 20px",
});

const gridStyles = (colors) => ({
  "& .MuiDataGrid-root": { border: "none" },
  "& .MuiDataGrid-cell": { borderBottom: "none" },
  "& .MuiDataGrid-columnHeaders": {
    backgroundColor: colors.blueAccent[700],
    borderBottom: "none",
  },
  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: colors.primary[400],
  },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "none",
    backgroundColor: colors.blueAccent[700],
    height: "5px",
    paddingTop: "10px",
  },
  "& .MuiTablePagination-actions": {
    display: "flex",
    flexDirection: "row",
    marginRight: "100px",
    marginTop: "-10px",
  },
  "& .MuiCheckbox-root": {
    color: `${colors.greenAccent[200]} !important`,
  },
  "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
    color: `${colors.grey[100]} !important`,
  },
});

export default Reports;
