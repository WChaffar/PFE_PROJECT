import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  LinearProgress,
  Autocomplete,
  TextField,
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
import {
  changeProjectManager,
  deleteProject,
  getAllBuProjects,
} from "../../actions/projectAction";
import { differenceInCalendarDays, format } from "date-fns";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import { getAllEmployeeAssignements } from "../../actions/assignementsAction";
import {
  getBuTasksByProjectId,
  getTasksByProjectId,
} from "../../actions/taskAction";
import { parse, isAfter, isBefore, addDays } from "date-fns";
import { useRef } from "react";
import { getAllBuManagers } from "../../actions/teamAction";

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

const ProjectsBU = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedProjects = useSelector((state) => state.projects.projects);
  const userBu = useSelector((state) => state.auth.user.businessUnit);
  const [projects, setProjects] = useState([]);
  const [openSnackbar, setOpenSnackbar] = React.useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // Message for Snackbar
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [getProjectsError, setGetProjectsError] = useState(null);
  const [assignments, setAssignements] = useState([]);
  const businessUnitManagers = useSelector((state) => state.team.team);
  const selectedAssignements = useSelector(
    (state) => state.assignements.assignements
  );

  const selectedTasks = useSelector((state) => state.tasks.tasks);
  const [tasks, setTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [openedProject, setOpenedProject] = useState(null);
  const [projectWorkload, setProjectWorkload] = useState([]);
  const [overdueTask, setOverdueTask] = useState([]);
  const detailsRef = useRef(null);
  const [projectsBudgetDays, setProjectsBudgetDays] = useState([]);

  useEffect(() => {
    if (selectedAssignements.length !== 0) {
      setAssignements(selectedAssignements);
    }
  }, [selectedAssignements]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    if (
      selectedProjects.length > 0 &&
      selectedAssignements.length > 0 &&
      projectsBudgetDays.length === 0
    ) {
      const aggregatedProjectsConsumedDays = selectedAssignements.reduce(
        (acc, assignment) => {
          const projectId = assignment.project._id;

          // Calculer le total des jours pour cet assignment
          const daysForAssignment = assignment.timeEntries.reduce(
            (sum, entry) => {
              return sum + (entry.durationInDays || 0);
            },
            0
          );

          // Chercher si le projet existe déjà dans l'accumulateur
          const existingProject = acc.find((p) => p._id === projectId);

          if (existingProject) {
            existingProject.daysConsumed += daysForAssignment;
          } else {
            acc.push({
              _id: projectId,
              daysConsumed: daysForAssignment,
            });
          }

          return acc;
        },
        []
      );
      // Exemple de sortie : [ { _id: "686ebf6a40e1b4d1b7e1bebe", daysConsumed: 8 } ]
      //////////////////////
      const aggregatedProjectsBudgetDays = aggregatedProjectsConsumedDays.map(
        (p) => {
          const matchedProject = selectedProjects?.find(
            (pr) => pr._id === p._id
          );
          return {
            _id: matchedProject._id,
            budgetAmountUsed:
              p?.daysConsumed >= matchedProject?.budget
                ? matchedProject?.budget
                : p?.daysConsumed,
            remainingBudget:
              p?.daysConsumed >= matchedProject?.budget
                ? 0
                : matchedProject?.budget - p?.daysConsumed,
            additionalFunding: matchedProject?.additionalFunding,
            exceedingInitialBudget:
              p?.daysConsumed > matchedProject?.budget
                ? p?.daysConsumed - matchedProject?.budget
                : 0,
            fullBudget: matchedProject?.budget,
          };
        }
      );
      setProjectsBudgetDays(aggregatedProjectsBudgetDays);
    }
  }, [selectedProjects, selectedAssignements]);

  useEffect(() => {
    if (openedProject !== null && selectedProjects.length > 0) {
      const findProjectBudgetsUsed = projectsBudgetDays?.find(
        (p) => p._id === openedProject
      );
      if (findProjectBudgetsUsed === undefined) {
        setProjectsBudgetDays([
          ...projectsBudgetDays,
          {
            _id: openedProject,
            fullBudget: selectedProjects?.find((p) => p._id === openedProject)
              ?.budget,
          },
        ]);
      }
    }
  }, [openedProject]);

  useEffect(() => {
    let selectTasks = selectedTasks.map((task) => {
      // Récupère les noms sans doublons
      let uniqueEmployees = [
        ...new Map(
          assignments
            .filter((a) => a.taskId._id === task?._id)
            .map((a) => [a.employee.fullName, a.employee])
        ).values(),
      ];

      // Transforme chaque employé unique en <Box>
      let assigned = uniqueEmployees.map((employee) => (
        <Box key={employee._id}>{employee.fullName}</Box>
      ));
      return {
        id: task?._id,
        Task: task?.taskName,
        skills: task?.requiredSkills,
        assignedTo: assigned,
        experience: task?.RequiredyearsOfExper,
        phase: task?.projectPhase,
        projectId: task?.project?._id,
        Deadline: format(task?.endDate, "dd-MM-yyyy"),
        workload: task?.workload,
      };
    });
    const today = new Date();
    const in15Days = addDays(today, 15);

    const filteredTasks = selectTasks.filter((t) => {
      const taskDate = parse(t.Deadline, "dd-MM-yyyy", new Date());
      return isAfter(taskDate, today) && isBefore(taskDate, in15Days);
    });
    //////////////////////////////////////////////////////
    //Overdue tasks
    let overdueProjectTasks = selectTasks.filter((t) => {
      const taskDate = parse(t.Deadline, "dd-MM-yyyy", new Date());
      return isBefore(taskDate, today) && t.workload < 100;
    });
    let overdueProjectTasksMap = overdueProjectTasks.map((task) => {
      const taskDate = parse(task.Deadline, "dd-MM-yyyy", new Date());
      const overdueDays = differenceInCalendarDays(today, taskDate);
      return {
        ...task,
        overdueDays,
      };
    });

    //////////////////////////////////////////////////////
    setAllTasks(selectTasks);
    setTasks(filteredTasks);
    setOverdueTask(overdueProjectTasksMap);
    setTasksLoading(false);
  }, [selectedTasks]);

  const getTasksOfSelectedProject = async (params) => {
    setTasksLoading(true);
    const result = await dispatch(getBuTasksByProjectId(params.row.id));
    setTasksLoading(false);
  };

  useEffect(() => {
    dispatch(getAllEmployeeAssignements());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    dispatch(getAllBuManagers());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    if (selectedProjects.length !== 0) {
      const projectsMap = selectedProjects.map((project) => ({
        id: project._id,
        name: project.projectName,
        status: "in progress",
        owner: project.owner._id,
        managerName: project.owner.fullName,
        daysUsed: 45,
        budget: project.budget,
        startDate: format(project.startDate, "yyyy-MM-dd"),
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
    setLoadingProjects(true);
    async function fetchData(params) {
      const result = await dispatch(getAllBuProjects(userBu));
      if (result.success) {
        setLoadingProjects(false);
      } else {
        setLoadingProjects(false);
        setGetProjectsError(result.error);
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
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
    },
    {
      field: "deadline",
      headerName: "Deadline",
      flex: 1,
    },
    {
      field: "budget",
      headerName: "Budget",
      sortable: false,
      renderCell: ({ row }) => (
        <Box>
          {row.budget > 2 ? row.budget + " days" : row.budget + " day"}{" "}
        </Box>
      ),
    },
    {
      field: "managerName",
      headerName: "Manager",
      flex: 1,
    },
  ];

  const projectTasksColumns = [
    {
      field: "Overdue",
      headerName: "Overdue days",
      flex: 1,
      renderCell: (params) => {
        const days = parseInt(params.row.overdueDays);
        let color = "black";
        if (days <= 4) color = "blue";
        else if (days > 4) color = "red";

        return (
          <span style={{ color, fontWeight: "bold" }}>
            {params.row.overdueDays > 1
              ? params.row.overdueDays + " days"
              : params.row.overdueDays + " day"}
          </span>
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
      field: "assignedTo",
      headerName: "Assigned To",
      flex: 1,
      cellClassName: "name-column--cell",
      renderCell: (params) => {
        const value = params.row.assignedTo;
        if (value?.length > 0) {
          return <Box>{value}</Box>;
        } else {
          return <Box sx={{ color: "red" }}>Unassigned</Box>;
        }
      },
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
    // {
    //   field: "Workload",
    //   headerName: "Workload",
    //   flex: 1.5,
    //   renderCell: (params) => {
    //     const value = params.row.workload;
    //     return (
    //       <Box display="flex" alignItems="center" width="100%">
    //         <Box width="100%" mr={1}>
    //           <LinearProgress
    //             variant="determinate"
    //             value={value}
    //             sx={{
    //               height: 8,
    //               borderRadius: 5,
    //               backgroundColor: "#e0e0e0",
    //               "& .MuiLinearProgress-bar": {
    //                 backgroundColor: "#000066", // dark blue
    //               },
    //             }}
    //           />
    //         </Box>
    //         <Typography
    //           variant="body2"
    //           sx={{ color: "#0000FF", fontWeight: 600 }}
    //         >
    //           {`${value}%`}
    //         </Typography>
    //       </Box>
    //     );
    //   },
    // },
  ];

  const ActionsMenu = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [openConfirm, setOpenConfirm] = React.useState(false);
    const [selectedManager, setselectedManager] = useState(null);
    const [confirmError, setConfirmError] = useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const handleAction = (action) => {
      if (action === "Edit") {
        setOpenConfirm(true); // Show confirmation dialog
        handleCloseMenu();
      }
    };

    const handleConfirmEdit = async () => {
      const result = await dispatch(
        changeProjectManager(row.owner, selectedManager?._id)
      );
      if (result.success) {
        dispatch(getAllBuProjects());
        dispatch(getAllEmployeeAssignements());
        dispatch(getAllBuManagers());
        setSnackbarMessage("The manager of this project updated successfully!"); // Set success message
        setOpenSnackbar(true); // Show Snackbar
        // Using window.location.reload()
        setTimeout(() => {
          window.location.reload();
        }, 2500);
      }
      setOpenConfirm(false);
      handleCloseMenu();
    };

    return (
      <>
        <IconButton
          onClick={(event) => {
            event.stopPropagation(); // Prevent click from bubbling
            handleClick(event);
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
          <MenuItem onClick={() => handleAction("Edit")}>
            ✏️ Change Manager
          </MenuItem>
        </Menu>

        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Change Manager</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <br />
              This action can have significant consequences, including affecting
              team assignments, associated tasks, and linked data. Proceed with
              caution.
            </DialogContentText>
            <DialogContentText>
              {" "}
              You're about to update the manager :
              <Autocomplete
                fullWidth
                options={businessUnitManagers}
                getOptionLabel={(option) =>
                  typeof option === "string"
                    ? option
                    : "Manager id : " +
                        option?._id +
                        ", nom : " +
                        option?.fullName || ""
                }
                isOptionEqualToValue={(option, value) =>
                  option?._id === value?._id
                }
                value={
                  businessUnitManagers.find((p) => p._id === []?._id) || null
                }
                onChange={(event, newValue) => {
                  setselectedManager(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Manager"
                    name="Manager"
                    variant="filled"
                  />
                )}
                sx={{ gridColumn: "span 2" }}
              />
              {confirmError !== null && (
                <Box color={"red"}> {confirmError} </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEdit}
              color="primary"
              variant="contained"
            >
              Confirm
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
          title="Overview of Business Unit Projects"
          subtitle="A Comprehensive Overview of the Projects Managed Within the Business Unit."
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
          onRowClick={(params) => {
            setTasks([]);
            setAllTasks([]);
            setOverdueTask([]);
            getTasksOfSelectedProject(params);
            setOpenedProject(params.row.id);
            setTimeout(() => {
              detailsRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 500); // slight delay so details section renders first
          }}
        />
      </Box>
      {openedProject && (
        <Box ref={detailsRef}>
          <Box>
            <br />
            <h5>HR project 1 :</h5>
            <ProjectPipeline
              TasksData={allTasks}
              projectData={projects?.find((p) => p.id === openedProject)}
            />
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
                  <ProjectBudgetProgressPie
                    projectBudgetDays={projectsBudgetDays?.find(
                      (p) => p._id === openedProject
                    )}
                  />
                  <Typography
                    variant="h5"
                    color={colors.greenAccent[500]}
                    sx={{ mt: "-20px" }}
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
                      rows={overdueTask}
                      columns={projectTasksColumns}
                      hideFooter
                      loading={tasksLoading}
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
                  Upcoming Deadlines (-15 Days Left)
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
                      rows={tasks}
                      columns={projectTasksDeadlineColumns}
                      hideFooter
                      loading={tasksLoading}
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
                  Tasks Workload
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
                  <ProjectWorkLoadBarChart
                    isDashboard={true}
                    TasksWorkloadData={allTasks}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      {/*--------------------------------------------------------------------------------*/}
      <Box ref={detailsRef} />
    </Box>
  );
};

export default ProjectsBU;
