import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  MenuItem,
  useTheme,
  IconButton,
  Tooltip,
  LinearProgress,
  Menu,
} from "@mui/material";
import {
  Edit,
  ArrowBack,
  ArrowForward,
  ArrowBackOutlined,
} from "@mui/icons-material";
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { addDays, format, startOfWeek, endOfWeek } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjects } from "../../actions/projectAction";
import { getAllEmployeeAssignements } from "../../actions/assignementsAction";
import { getTasksByProjectId } from "../../actions/taskAction";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

const timeStatusColors = {
  billable: "#4CAF50",
  nonBillable: "#FF9800",
  none: "#ffffff00",
  inactive:
    "repeating-linear-gradient(45deg, #ccc 0, #ccc 2px, #fff 2px, #fff 4px)",
};

const CustomToolbar = () => (
  <GridToolbarContainer>
    {" "}
    <Box display="flex" gap={1} alignItems="center">
      {" "}
      <GridToolbarColumnsButton /> <GridToolbarFilterButton />{" "}
      <GridToolbarDensitySelector /> <GridToolbarExport />{" "}
    </Box>{" "}
  </GridToolbarContainer>
);

function StatusCell({ status, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (newStatus) => {
    onChange(newStatus);
    handleClose();
  };

  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Tooltip title={status}>
        <Box
          width={28}
          height={28}
          borderRadius="4px"
          sx={{
            background:
              status === "inactive"
                ? timeStatusColors.inactive
                : timeStatusColors[status],
            border: "1px solid #ccc",
          }}
        >
          <IconButton size="small" onClick={handleClick}>
            <Edit fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleChange("billable")}>Billable</MenuItem>
        <MenuItem onClick={() => handleChange("nonBillable")}>
          Non-Billable
        </MenuItem>
        <MenuItem onClick={() => handleChange("inactive")}>Inactive</MenuItem>
        <MenuItem onClick={() => handleChange("none")}>None</MenuItem>
      </Menu>
    </Box>
  );
}

function WeekStatusCell({ onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (newStatus) => {
    onChange(newStatus);
    handleClose();
  };
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      <Tooltip>
        <Box width={28} height={28} borderRadius="4px">
          <ArrowBackOutlined />
          <IconButton size="small" onClick={handleClick}>
            <Edit fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={() => handleChange("billable")}>Billable</MenuItem>
        <MenuItem onClick={() => handleChange("nonBillable")}>
          Non-Billable
        </MenuItem>
        <MenuItem onClick={() => handleChange("inactive")}>Inactive</MenuItem>
        <MenuItem onClick={() => handleChange("none")}>None</MenuItem>
      </Menu>
    </Box>
  );
}

export default function TimeTracking() {
  // Nouveau tableau de données : temps journalier pour chaque tâche
  const taskTimeEntries = [
    { taskId: 1, date: "2025-05-05", status: "billable" },
    { taskId: 1, date: "2025-05-06", status: "nonBillable" },
    { taskId: 1, date: "2025-05-07", status: "billable" },
    { taskId: 1, date: "2025-05-08", status: "inactive" },
    { taskId: 1, date: "2025-05-09", status: "none" },
    { taskId: 2, date: "2025-05-05", status: "billable" },
    { taskId: 2, date: "2025-05-06", status: "billable" },
    { taskId: 2, date: "2025-05-07", status: "nonBillable" },
    { taskId: 2, date: "2025-05-08", status: "none" },
    { taskId: 2, date: "2025-05-09", status: "billable" },
    { taskId: 3, date: "2025-05-05", status: "inactive" },
    { taskId: 3, date: "2025-05-06", status: "inactive" },
    { taskId: 3, date: "2025-05-07", status: "billable" },
    { taskId: 3, date: "2025-05-08", status: "nonBillable" },
    { taskId: 3, date: "2025-05-09", status: "billable" },
    // Ajoute les jours et tâches restants selon besoin
  ];
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTask, setSearchTask] = useState("");
  const [searchEmployer, setSearchEmployer] = useState("");
  const [startDate, setStartDate] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [viewMode, setViewMode] = useState("Cost");
  const [entries, setEntries] = useState(taskTimeEntries);
  const selectedProjects = useSelector((state) => state.projects.projects);
  const [projects, setProjects] = useState([]);
  const dispatch = useDispatch();
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [getProjectsError, setGetProjectsError] = useState(null);
  const [assignments, setAssignements] = useState([]);
  const selectedAssignements = useSelector(
    (state) => state.assignements.assignements
  );
  const selectedTasks = useSelector((state) => state.tasks.tasks);
  const [tasks, setTasks] = useState([]);

  const getTasksOfSelectedProject = (params) => {
    dispatch(getTasksByProjectId(params.row.id));
  };
  useEffect(() => {
    let selectTasks = selectedTasks.map((task) => {
      return {
        id: task?._id,
        name: task?.taskName,
        experience: task?.RequiredyearsOfExper,
        phase: task?.projectPhase,
        projectId: task?.projectId,
        workload: task?.workload,
      };
    });
    setTasks(selectTasks);
  }, [selectedTasks]);

  useEffect(() => {
    dispatch(getAllEmployeeAssignements());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    if (selectedAssignements.length !== 0) {
      const assignementsMap = selectedAssignements?.map((assignment) => {
        const memberId = assignment?.employee?._id;
        const task = assignment?.taskId?.taskName;
        const startDate = new Date(assignment?.startDate);
        const endDate = new Date(assignment?.endDate);
        const dayDetails = assignment?.dayDetails;
        const result = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          result.push({
            id: assignment?._id,
            dates: currentDate.toISOString().split("T")[0], // YYYY-MM-DD format
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return {
          id: assignment?._id,
          memberId,
          assignedTo: assignment?.employee?.fullName,
          avatar: assignment?.employee?.profilePicture,
          dates: result,
          taskName: assignment?.taskId?.taskName,
          dayDetails,
          projectId: assignment?.project?._id,
          startDate: assignment?.startDate,
          endDate: assignment?.endDate,
        };
      });
      setAssignements(assignementsMap);
    }
  }, [selectedAssignements]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    if (selectedProjects.length !== 0) {
      const projectsMap = selectedProjects.map((project) => ({
        id: project._id,
        name: project.projectName,
        status: "in progress",
        daysUsed: 45,
        budgetDays: project.budget,
        deadline: format(project.endDate, "yyyy-MM-dd"),
        extraMembers: 1,
      }));
      setProjects(projectsMap);
    }
  }, [selectedProjects]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    setLoadingProjects(true);
    async function fetchData(params) {
      const result = await dispatch(getAllProjects());
      if (result.success) {
        setLoadingProjects(false);
      } else {
        setLoadingProjects(false);
        setGetProjectsError(result.error);
      }
    }
    fetchData();
  }, [dispatch]);

  const daysToShow = 7;
  const visibleDays = Array.from({ length: daysToShow }, (_, i) =>
    format(addDays(startDate, i), "EE dd")
  );
  const weekRange = `${format(startDate, "MMM dd, yyyy")} - ${format(
    endOfWeek(startDate, { weekStartsOn: 1 }),
    "MMM dd, yyyy"
  )}`;

  const getStatus = (taskId, date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    const entry = entries.find(
      (e) =>
        String(e.taskId).trim() === String(taskId).trim() &&
        String(e.date).trim() === formattedDate
    );

    if (entry) return entry ? entry.status : "none";
  };

  const updateStatus = (taskId, date, newStatus) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setEntries((prev) => {
      const exists = prev.find(
        (e) => e.taskId === taskId && e.date === dateStr
      );
      if (exists) {
        return prev.map((e) =>
          e.taskId === taskId && e.date === dateStr
            ? { ...e, status: newStatus }
            : e
        );
      } else {
        return [...prev, { taskId, date: dateStr, status: newStatus }];
      }
    });
  };

  const updateWeekStatus = (taskId, newStatus) => {
    const mergeEntries = (entries, newEntries) => {
      // Extraire les taskIds uniques des newEntries
      const newTaskIds = new Set(newEntries.map((entry) => entry.taskId));

      // Filtrer les anciennes entrées pour supprimer celles avec un taskId présent dans newEntries
      const filteredOldEntries = entries.filter(
        (entry) => !newTaskIds.has(entry.taskId)
      );

      // Combiner les anciennes filtrées avec les nouvelles
      return [...newEntries, ...filteredOldEntries];
    };

    let newEntries = [];

    for (let i = 0; i < visibleDays.length; i++) {
      const dayIndex = i;
      const date = addDays(startDate, dayIndex);
      const dateStr = format(date, "yyyy-MM-dd");
      newEntries.push({ taskId, date: dateStr, status: newStatus });
    }
    const updatedEntries = mergeEntries(entries, newEntries);
    setEntries(updatedEntries);
  };

  const projectColumns = [
    {
      field: "name",
      headerName: "Project Name",
      flex: 1.5,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          {" "}
          <span role="img" aria-label="folder">
            📁
          </span>{" "}
          <strong>{row.name}</strong>{" "}
        </Box>
      ),
    },
    { field: "tnf", headerName: "TNF (Non-Billable)", flex: 1 },
    { field: "bt", headerName: "BT (Billable)", flex: 1 },
  ];
  function WorkloadCell({ workload, id, onChange }) {
    const [value, setValue] = React.useState(workload);

    React.useEffect(() => {
      setValue(workload); // Sync si workload change de l’extérieur
    }, [workload]);

    const changeValue = (delta) => {
      const newValue = Math.min(100, Math.max(0, value + delta));
      setValue(newValue);
      onChange(id, newValue);
    };

    let barColor = "#2196f3";
    if (value >= 90) barColor = "#f44336";
    else if (value >= 70) barColor = "#ff9800";
    else if (value >= 40) barColor = "#4caf50";
    else barColor = "#9e9e9e";

    return (
      <Box width="100%" pr={2}>
        <Tooltip title={`${value}%`}>
          <Box display="flex" alignItems="center" gap={1}>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                flex: 1,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: barColor,
                },
              }}
            />
            <Typography variant="body2" width={35}>
              {value}%
            </Typography>
            <IconButton
              size="small"
              onClick={() => changeValue(-10)}
              aria-label="decrease"
              sx={{ width: 24, height: 24, padding: 0.5 }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => changeValue(10)}
              aria-label="increase"
              sx={{ width: 24, height: 24, padding: 0.5 }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Tooltip>
      </Box>
    );
  }

  const assignementColumnsCost = [
    {
      field: "taskName",
      headerName: "Task Name",
      flex: 1,
    },
    {
      field: "assignedTo",
      headerName: "Assigned To / From - To",
      flex: 1.2,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1} width="100%">
          {params.row.avatar ? (
            <Box sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar src={params.row.avatar} sx={{ marginRight: "10px" }} />
                <Box>{params.row.assignedTo || "Unassigned"}</Box>
              </Box>
              <Box
                sx={{ marginTop: "-10px", textAlign: "right", width: "100%" }}
              >
                From : {format(params?.row?.startDate, "yyyy-MM-dd")} To :{" "}
                {format(params?.row?.endDate, "yyyy-MM-dd")}
              </Box>
            </Box>
          ) : (
            <Avatar>?</Avatar>
          )}
        </Box>
      ),
    },
    ...visibleDays.map((day, i) => {
      const dayIndex = i;
      return {
        field: day,
        headerName: day,
        flex: 0.5,
        sortable: false,
        renderCell: (params) => {
          const taskId = params.row.id;
          const date = addDays(startDate, dayIndex);
          const status = getStatus(taskId, date);
          return (
            <StatusCell
              status={status}
              onChange={(newStatus) => updateStatus(taskId, date, newStatus)}
              key={taskId}
            />
          );
        },
      };
    }),

    {
      headerName: "Update throughout the week",
      flex: 1.5,
      renderCell: (params) => {
        const taskId = params.row.id;
        return (
          <WeekStatusCell
            onChange={(newStatus) => updateWeekStatus(taskId, newStatus)}
          />
        );
      },
    },
  ];

  const taskColumnsWorkload = [
    {
      field: "name",
      headerName: "Task Name",
      flex: 1.5,
    },
    {
      field: "phase",
      headerName: "Project Phase",
      flex: 1.2,
    },
    {
      field: "workload",
      headerName: "Workload",
      flex: 2,
      renderCell: (params) => (
        <WorkloadCell
          workload={params.row.workload}
          id={params.row.id}
          onChange={(id, newVal) => {
            // Mets à jour le state global ou fais un appel API ici
            console.log("Update workload", id, newVal);
          }}
        />
      ),
    },
  ];

  const filteredAssignements =
    assignments?.length > 0
      ? assignments?.filter((a) => a?.projectId === selectedProject?.id)
      : [];

  const handleNavigate = (direction) => {
    const newDate = addDays(startDate, direction * 7);
    setStartDate(newDate);
  };

  return (
    <Box p={3}>
      {" "}
      <Typography variant="h4" fontWeight="bold">
        Time Tracking{" "}
      </Typography>{" "}
      <Typography variant="body2" color="textSecondary" mb={2}>
        Track employee time per project for efficient planning.{" "}
      </Typography>
      <Box
        height="35vh"
        mb={4}
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
          onRowClick={(params) => {
            setSelectedProject(params.row);
            getTasksOfSelectedProject(params);
          }}
          components={{ Toolbar: CustomToolbar }}
          pageSize={5}
          rowsPerPageOptions={[5]}
          pagination
        />
      </Box>
      {selectedProject && (
        <Box>
          <Box
            mb={2}
            display="flex"
            alignItems="center"
            gap={2}
            justifyContent="space-between"
          >
            <TextField
              select
              size="small"
              label="View"
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
            >
              <MenuItem value="Workload">Workload</MenuItem>
              <MenuItem value="Cost">Cost</MenuItem>
            </TextField>

            {viewMode === "Cost" && (
              <Box display="flex" alignItems="center" gap={2}>
                <IconButton
                  sx={{ width: "50px", marginBottom: "-30px" }}
                  onClick={() => handleNavigate(-1)}
                >
                  <ArrowBack />
                </IconButton>
                <Typography sx={{ marginBottom: "-30px" }} variant="h6">
                  {weekRange}
                </Typography>
                <IconButton
                  sx={{ width: "50px", marginBottom: "-30px" }}
                  onClick={() => handleNavigate(1)}
                >
                  <ArrowForward />
                </IconButton>
              </Box>
            )}
          </Box>

          <Box
            height="35vh"
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "none",
              },
              "& .name-column--cell": {},
              "& .MuiDataGrid-columnHeaders": {
                borderBottom: "none",
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-virtualScroller": {},
              "& .MuiDataGrid-footerContainer": {
                borderTop: "b",
                height: "5px",
                paddingTop: "10px",
                backgroundColor: colors.primary[400],
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
              marginTop: "-20px",
            }}
          >
            <DataGrid
              rows={viewMode === "Cost" ? filteredAssignements : tasks}
              columns={
                viewMode === "Cost"
                  ? assignementColumnsCost
                  : taskColumnsWorkload
              }
              getRowId={(row) => row.id}
              components={{ Toolbar: CustomToolbar }}
              pageSize={7}
              rowsPerPageOptions={[7]}
              rowHeight={60}
              pagination
            />
          </Box>

          {viewMode === "Cost" && (
            <Box
              display="flex"
              gap={3}
              mt={1}
              marginTop="-35px"
              position="relative"
              zIndex="1"
            >
              <Box display="flex" alignItems="center" gap={1}>
                <Box width={12} height={12} bgcolor="#4CAF50" />
                <Typography variant="body2">Billable Time</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box width={12} height={12} bgcolor="#FF9800" />
                <Typography variant="body2">Non-Billable Time</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  width={12}
                  height={12}
                  sx={{
                    background:
                      "repeating-linear-gradient(45deg, #ccc 0, #ccc 2px, #fff 2px, #fff 4px)",
                  }}
                />
                <Typography variant="body2">Inactive</Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
