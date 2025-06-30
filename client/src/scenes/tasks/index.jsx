import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  useTheme,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { mockTasks, mockProjects } from "../../data/mockData"; // You'll define these
import { useNavigate } from "react-router-dom";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { getAllProjects } from "../../actions/projectAction";
import { deleteTaskById, getTasksByProjectId } from "../../actions/taskAction";

const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <Box display="flex" flexDirection="row" gap={2} alignItems="center">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );
};

const TasksManagement = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);
  const colors = tokens(theme.palette.mode);
  const selectedProjects = useSelector((state) => state.projects.projects);
  const [projects, setProjects] = useState([]);
  const dispatch = useDispatch();
  const selectedTasks = useSelector((state) => state.tasks.tasks);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = React.useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // Message for Snackbar
  const error = useSelector((state) => state.tasks.error);
   const [getProjectsError, setGetProjectsError ] = useState(null);

  useEffect(() => {
    if (selectedProjects.length !== 0) {
      const projectsMap = selectedProjects.map((project) => ({
        id: project._id,
        name: project.projectName,
        taskCount: 6,
        completed: 1,
        active: 3,
        overdue: 2,
      }));
      setProjects(projectsMap);
      setProjectLoading(false);
    }
  }, [selectedProjects]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    setProjectLoading(true);
    async function fetchData(params) {
      const result = await dispatch(getAllProjects());
      if (result.success) {
        setProjectLoading(false);
      } else {
        setProjectLoading(false);
        setGetProjectsError(result.error);
      }
    }
    fetchData();
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    let selectTasks = selectedTasks.map((task) => {
      return {
        id: task._id,
        name: task.taskName,
        skills: task.requiredSkills,
        assignedTo: "Sarah Wilson",
        avatar: "https://i.pravatar.cc/150?img=10",
        experience: task.RequiredyearsOfExper,
        phase: task.projectPhase,
        projectId: task.projectId,
      };
    });
    setTasks(selectTasks);
    setTasksLoading(false);
  }, [selectedTasks]);

  useEffect(() => {
    if (openSnackbar) {
      const timer = setTimeout(() => {
        handleSnackbarClose();
      }, 6000); // 10 secondes
      return () => clearTimeout(timer);
    }
  }, [openSnackbar]);

  const projectColumns = [
    {
      field: "name",
      headerName: "Project Name",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <span role="img" aria-label="folder">
            📁
          </span>
          {row.name}
        </Box>
      ),
    },
    { field: "taskCount", headerName: "Taks Number", flex: 1 },
    { field: "completed", headerName: "Completed", flex: 1 },
    { field: "active", headerName: "Active Taks", flex: 1 },
    { field: "overdue", headerName: "Overdue Tasks", flex: 1 },
  ];

  const taskColumns = [
    { field: "name", headerName: "Task Name", flex: 1.5 },
    {
      field: "skills",
      headerName: "Required skills",
      flex: 2,
      renderCell: (params) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {params.row.skills.map((skill, i) => (
            <Chip key={i} label={skill} size="small" />
          ))}
        </Box>
      ),
    },
    {
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 1.5,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={params.row.avatar} />
          <Typography fontWeight="bold">{params.row.assignedTo}</Typography>
        </Box>
      ),
    },
    {
      field: "experience",
      headerName: "Required Experience",
      flex: 1,
      renderCell: (params) => (
        <Typography>⏱ {params.row.experience} years</Typography>
      ),
    },
    { field: "phase", headerName: "Project Phase", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5,
      sortable: false,
      renderCell: ({ row }) => <ActionsMenu row={row} />,
    },
  ];

  const ActionsMenu = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [openConfirm, setOpenConfirm] = React.useState(false);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const handleClose = (action) => {
      if (action === "Edit") {
        navigate(`/tasks/${row.id}/edit`);
      }
      if (action === "Details") {
        navigate(`/tasks/${row.id}/détails`);
      }
      if (action === "Delete") {
        setOpenConfirm(true); // Show confirmation dialog
      }
      setAnchorEl(null);
    };
    const handleConfirmDelete = async () => {
      const result = await dispatch(deleteTaskById(row.id));
      if (result.success) {
        setSnackbarMessage("Task deleted successfully!"); // Set success message
        setOpenSnackbar(true); // Show Snackbar
        console.log("delete with success");
      }
      setOpenConfirm(false);
      handleCloseMenu();
    };
    return (
      <>
        <IconButton onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem onClick={() => handleClose("Edit")}>✏️ Edit</MenuItem>
          <MenuItem onClick={() => handleClose("Delete")}>🗑️ Delete</MenuItem>
          <MenuItem onClick={() => handleClose("Details")}>🔍 Details</MenuItem>
        </Menu>
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the task{" "}
              <strong>{row.name}</strong>?<br />
              This action can have significant consequences, including affecting
              team assignments, projects, and linked data. Proceed with caution.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const getTasksOfSelectedProject = async (params) => {
    setTasksLoading(true);
    const result = await dispatch(getTasksByProjectId(params.row.id));
    if (result.success) {
      setSelectedProject(params.row.id);
    }
  };
  const handleSnackbarClose = () => {
    setOpenSnackbar(false); // Close the Snackbar
  };

  function CustomErrorOverlay() {
    return (
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Typography color="error" variant="body1">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          {/* Header */}
          <Typography variant="h4" fontWeight="bold">
            Tasks Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Task management optimizes workloads and ensures deadlines are met
          </Typography>
        </Box>
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
            onClick={() => {
              navigate("/tasks/12345/create");
            }}
          >
            + Add Task
          </Button>
        </Box>
      </Box>
      {/* Project Table */}
      <Box
        m="-20px 0 0 0"
        height="35vh"
        marginTop="10px"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "b",
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
          "& .css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input":
            {
              marginTop: "-15px",
            },
          "& .css-oatl8s-MuiSvgIcon-root-MuiSelect-icon": {
            marginTop: "-8px",
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={projects}
          columns={projectColumns}
          onRowClick={(params) => getTasksOfSelectedProject(params)}
          components={{ Toolbar: CustomToolbar }}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          pagination
          loading={projectLoading && !getProjectsError}
        />
      </Box>
      {/* Tasks Table */}
      {selectedProject && (
        <Box
          borderRadius="8px"
          overflow="hidden"
          border="1px solid #ddd"
          bgcolor="background.paper"
          marginTop="25px"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" p={2}>
              Tasks
            </Typography>
            {openSnackbar && (
              <Alert
                onClose={handleSnackbarClose}
                severity="success"
                sx={{ width: "auto" }}
              >
                {snackbarMessage}
              </Alert>
            )}
          </Box>
          <Box
            m="-20px 0 0 0"
            height="40vh"
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
              },
              "& .name-column--cell": {
                color: colors.greenAccent[300],
              },
              "& .MuiTablePagination-actions": {
                display: "flex",
                flexDirection: "row",
                marginRight: "100px",
                marginTop: "-10px",
              },
              "& .css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input":
                {
                  marginTop: "-15px",
                },
              "& .css-oatl8s-MuiSvgIcon-root-MuiSelect-icon": {
                marginTop: "-8px",
              },
              "& .MuiCheckbox-root": {
                color: `${colors.greenAccent[200]} !important`,
              },
              "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                color: `${colors.grey[100]} !important`,
              },
            }}
          >
            <DataGrid
              rows={tasks}
              columns={taskColumns}
              components={{
                Toolbar: CustomToolbar,
                ErrorOverlay: CustomErrorOverlay,
              }}
              sx={{ border: "none" }}
              pageSize={5}
              rowsPerPageOptions={[5, 10, 25, 50, 100]}
              pagination
              loading={tasksLoading}
              error={!!error}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TasksManagement;
