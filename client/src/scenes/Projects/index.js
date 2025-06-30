import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  LinearProgress,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert"; // Icône pour les trois points
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
import {
  projectsData,
  projectTasksData,
  projectTasksDeadlineData,
} from "../../data/ProjectsData";
import ProjectPipeline from "../../components/ProjectPipeline";
import ProjectBudgetProgressPie from "../../components/ProjectBudgetProgressPie";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import ProjectWorkLoadBarChart from "../../components/ProjectWorkLoadBarChart";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { deleteProject, getAllProjects } from "../../actions/projectAction";
import { format } from "date-fns";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Snackbar, Alert } from "@mui/material";

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

const Projects = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedProjects = useSelector((state) => state.projects.projects);
  const [projects, setProjects] = useState([]);
  const [openSnackbar, setOpenSnackbar] = React.useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // Message for Snackbar
  const [loadingProjects,setLoadingProjects] = useState(false);
  const [getProjectsError, setGetProjectsError ] = useState(null);

  useEffect(() => {
    if (selectedProjects.length !== 0) {
      const projectsMap = selectedProjects.map((project) => ({
        id: project._id,
        name: project.projectName,
        status: "in progress",
        daysUsed: 45,
        budgetDays: project.budget,
        deadline: format(project.endDate, "yyyy-MM-dd"),
        team: [
          "/avatars/avatar1.png",
          "/avatars/avatar2.png",
          "/avatars/avatar3.png",
        ],
        extraMembers: 1,
      }));
      setProjects(projectsMap);
    }
  }, [selectedProjects]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    setLoadingProjects(true)
    async function fetchData(params) {
      const result = await dispatch(getAllProjects());
      if (result.success) {
        setLoadingProjects(false);
      }else {
         setLoadingProjects(false);
        setGetProjectsError(result.error)
      }
    }
    fetchData();
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    if (openSnackbar) {
      const timer = setTimeout(() => {
        handleSnackbarClose();
      }, 6000); // 10 secondes
      return () => clearTimeout(timer);
    }
  }, [openSnackbar]);

  const columns = [
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
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          px={1.5}
          py={0.5}
          borderRadius="8px"
          bgcolor={row.status === "Completed" ? "limegreen" : "lightgray"}
          color={row.status === "Completed" ? "white" : "black"}
          fontWeight="bold"
          width="fit-content"
        >
          {row.status}
        </Box>
      ),
    },
    {
      field: "progress",
      headerName: "Progress",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => {
        const percent = Math.round((row.daysUsed / row.budgetDays) * 100);
        return (
          <Box width="100%" mr={1}>
            <Box height="10px" bgcolor="#e0e0e0" borderRadius="4px">
              <Box
                height="100%"
                width={`${percent}%`}
                bgcolor="#555"
                borderRadius="4px"
              />
            </Box>
          </Box>
        );
      },
    },
    {
      field: "budget",
      headerName: "Budget",
      flex: 1,
      valueGetter: ({ row }) => `${row.daysUsed}/${row.budgetDays} days`,
    },
    {
      field: "deadline",
      headerName: "Deadline",
      flex: 1,
    },
    {
      field: "team",
      headerName: "Team",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center">
          {row.team.map((avatar, index) => (
            <img
              key={index}
              src={avatar}
              alt={`avatar-${index}`}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "2px solid white",
                marginLeft: index !== 0 ? -8 : 0,
              }}
            />
          ))}
          {row.extraMembers > 0 && (
            <Box
              width={32}
              height={32}
              display="flex"
              justifyContent="center"
              alignItems="center"
              bgcolor="#d3d3d3"
              borderRadius="50%"
              ml={-1}
              fontSize="0.8rem"
              fontWeight="bold"
            >
              +{row.extraMembers}
            </Box>
          )}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      renderCell: ({ row }) => <ActionsMenu row={row} />,
    },
  ];

  const projectTasksColumns = [
    {
      field: "Overdue",
      headerName: "Overdue",
      flex: 1,
      renderCell: (params) => {
        const days = parseInt(params.value);
        let color = "black";
        if (days <= 4) color = "blue";
        else if (days > 4) color = "red";

        return (
          <span style={{ color, fontWeight: "bold" }}>{params.value}</span>
        );
      },
    },
    {
      field: "Task",
      headerName: "Task",
      flex: 1,
    },
    {
      field: "Deadline",
      headerName: "Deadline",
      flex: 1,
    },
    {
      field: "Employee",
      headerName: "Employee",
      flex: 1,
    },
  ];

  const projectTasksDeadlineColumns = [
    {
      field: "Overdue",
      headerName: "Overdue",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "Task",
      headerName: "Task",
      headerAlign: "left",
      align: "left",
      flex: 1,
    },
    {
      field: "Deadline",
      headerName: "Deadline",
      flex: 1,
    },
    {
      field: "Workload",
      headerName: "Workload",
      flex: 1.5,
      renderCell: (params) => {
        const value = params.value;
        return (
          <Box display="flex" alignItems="center" width="100%">
            <Box width="100%" mr={1}>
              <LinearProgress
                variant="determinate"
                value={value}
                sx={{
                  height: 8,
                  borderRadius: 5,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#000066", // dark blue
                  },
                }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ color: "#0000FF", fontWeight: 600 }}
            >
              {`${value}%`}
            </Typography>
          </Box>
        );
      },
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

    const handleAction = (action) => {
      if (action === "Delete") {
        setOpenConfirm(true); // Show confirmation dialog
      } else if (action === "Edit") {
        navigate(`/projects/project/${row.id}/edit`);
        handleCloseMenu();
      } else if (action === "Details") {
        navigate(`/projects/project/${row.id}/details`);
        handleCloseMenu();
      }
    };

    const handleConfirmDelete = async () => {
      const result = await dispatch(deleteProject(row.id));
      if (result.success) {
        setSnackbarMessage("Project deleted successfully!"); // Set success message
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
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
          <MenuItem onClick={() => handleAction("Edit")}>✏️ Edit</MenuItem>
          <MenuItem onClick={() => handleAction("Delete")}>🗑️ Delete</MenuItem>
          <MenuItem onClick={() => handleAction("Details")}>
            🔍 Details
          </MenuItem>
        </Menu>

        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the project{" "}
              <strong>{row.name}</strong>?<br />
              This action can have significant consequences, including affecting
              team assignments, associated tasks, and linked data. Proceed with
              caution.
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

  const handleSnackbarClose = () => {
    setOpenSnackbar(false); // Close the Snackbar
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Project Management"
          subtitle="Centralize project management for better control and productivity."
        />
        {openSnackbar && (
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ width: "auto" }}
          >
            {snackbarMessage}
          </Alert>
        )}
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
              navigate("/projects/create");
            }}
          >
            Create new project
          </Button>
          {/* Snackbar for success message */}
        </Box>
      </Box>
      <Box
        m="-20px 0 0 0"
        height="35vh"
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
          columns={columns}
          components={{ Toolbar: CustomToolbar }}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          pagination
          loading={loadingProjects && !getProjectsError}
        />
      </Box>
      <Box>
        <br />
        <h5>HR project 1 :</h5>
        <ProjectPipeline />
      </Box>
      <br />
      {/*--------------------------------------------------------------------------------*/}
      <Box>
        <Box
          display="grid"
          gridTemplateColumns="repeat(12, 1fr)"
          gridAutoRows="140px"
          gap="20px"
        >
          <Box
            gridColumn="span 6"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            p="10px"
          >
            <Typography variant="h5" fontWeight="300">
              Project Budget
            </Typography>
            <Box display="flex" flexDirection="column" alignItems="center">
              <ProjectBudgetProgressPie />
              <Typography
                variant="h5"
                color={colors.greenAccent[500]}
                sx={{ mt: "15px" }}
              >
                Project Budget Distribution Overview
              </Typography>
              <Typography>
                Visual Breakdown of Project Budget Allocation{" "}
              </Typography>
            </Box>
          </Box>
          {/*-------------------------------------------------------------------------------------------*/}
          <Box
            gridColumn="span 6"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            padding="10px"
          >
            <Typography variant="h5" fontWeight="300">
              Overdue Task
            </Typography>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              paddingTop="10px"
            >
              <Box
                m="0px 0 0 0"
                height="30vh"
                width="100%"
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
                    backgroundColor: colors.grey[700],
                    borderBottom: "none",
                    paddingLeft: "15px",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.primary[400],
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "none",
                    backgroundColor: colors.blueAccent[700],
                  },
                  "& .MuiCheckbox-root": {
                    color: `${colors.greenAccent[200]} !important`,
                  },
                }}
              >
                <DataGrid
                  rows={projectTasksData}
                  columns={projectTasksColumns}
                  hideFooter
                />
              </Box>
            </Box>
          </Box>
          {/*-----------------------------------------------*/}
          <Box
            gridColumn="span 6"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            padding="10px"
          >
            <Typography variant="h5" fontWeight="300">
              Upcoming Deadlines
            </Typography>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              paddingTop="10px"
            >
              <Box
                m="0px 0 0 0"
                height="30vh"
                width="100%"
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
                    backgroundColor: colors.grey[700],
                    borderBottom: "none",
                    paddingLeft: "15px",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    backgroundColor: colors.primary[400],
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: "none",
                    backgroundColor: colors.blueAccent[700],
                  },
                  "& .MuiCheckbox-root": {
                    color: `${colors.greenAccent[200]} !important`,
                  },
                }}
              >
                <DataGrid
                  rows={projectTasksDeadlineData}
                  columns={projectTasksDeadlineColumns}
                  hideFooter
                />
              </Box>
            </Box>
          </Box>
          {/* ROW 2 */}
          <Box
            gridColumn="span 6"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            padding="10px"
          >
            <Typography variant="h5" fontWeight="300">
              Workload
            </Typography>
            <Box
              mt="25px"
              p="0 30px"
              display="flex "
              justifyContent="space-between"
              alignItems="center"
            >
              <br />
            </Box>

            <Box height="250px" mt="-40px">
              <ProjectWorkLoadBarChart isDashboard={true} />
            </Box>
          </Box>
        </Box>
      </Box>
      {/*--------------------------------------------------------------------------------*/}
    </Box>
  );
};

export default Projects;
