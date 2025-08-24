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
import {
  getAllEmployeeAssignements,
  updateAssignementTimeEntries,
  updateAssignementTimeEntry,
} from "../../actions/assignementsAction";
import { editTask, getTasksByProjectId } from "../../actions/taskAction";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { getEmployeeAbsencesForManager } from "../../actions/absenceAction";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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
    dayjs(startOfWeek(new Date(), { weekStartsOn: 1 }))
  );
  const [viewMode, setViewMode] = useState("Cost");
  const [entries, setEntries] = useState([]);
  const selectedProjects = useSelector((state) => state.projects.projects);
  const [projects, setProjects] = useState([]);
  const dispatch = useDispatch();
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [getProjectsError, setGetProjectsError] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [assignments, setAssignements] = useState([]);
  const selectedAssignements = useSelector(
    (state) => state.assignements.assignements
  );
  const selectedTasks = useSelector((state) => state.tasks.tasks);
  const [tasks, setTasks] = useState([]);
  const selectedAbsences = useSelector((state) => state.absence.absences);
  const [absences, setAbsences] = useState([]);

  useEffect(() => {
    dispatch(getEmployeeAbsencesForManager());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    if (selectedAbsences.length !== 0) {
      setAbsences(selectedAbsences);
    }
  }, [selectedAbsences]); // <== Appelle une seule fois le fetch

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
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
  }, [success, error]);

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
          timeEntries: assignment?.timeEntries,
        };
      });
      setAssignements(assignementsMap);
      const dynamicEntries = [];

      assignementsMap.forEach((assignment) => {
        assignment.dates.forEach((dateObj) => {
          const dateStr = dateObj.dates;
          const matchingEntry = assignment.timeEntries?.find(
            (entry) =>
              format(entry.date, "yyyy-MM-dd") === format(dateStr, "yyyy-MM-dd")
          );

          dynamicEntries.push({
            assignmentId: assignment.id,
            date: dateStr,
            status: matchingEntry ? matchingEntry.timeType : "none",
          });
        });
      });

      setEntries(dynamicEntries);
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
    if (selectedAssignements?.length > 0 && projects?.length > 0) {
      const projectMap = projects.map((project) => {
        let totalBillable = 0;
        let totalNonBillable = 0;

        selectedAssignements.forEach((assignment) => {
          if (assignment.project?._id === project.id) {
            assignment.timeEntries?.forEach((entry) => {
              if (entry.timeType === "billable") {
                totalBillable += 1;
              } else if (entry.timeType === "nonBillable") {
                totalNonBillable += 1;
              }
            });
          }
        });

        return {
          ...project,
          totalBillable: totalBillable,
          totalNonBillable: totalNonBillable,
        };
      });
      setProjects(projectMap);
    }
  }, [selectedAssignements, selectedProject]);

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

  const isAbsent = (memberId, date) => {
    return absences.some((absence) => {
      return (
        absence.employee._id === memberId &&
        dayjs(date).isSameOrAfter(dayjs(absence.startDate), "day") &&
        dayjs(date).isSameOrBefore(dayjs(absence.endDate), "day")
      );
    });
  };

  const getAbsenceType = (memberId, date) => {
    const absence = absences.find((absence) => {
      return (
        absence.employee._id === memberId &&
        dayjs(date).isSameOrAfter(dayjs(absence.startDate), "day") &&
        dayjs(date).isSameOrBefore(dayjs(absence.endDate), "day")
      );
    });

    return absence?.type || null;
  };

  const absenceColors = {
    "Paid leave": "#42a5f5",
    "Unpaid leave": "#ef5350",
    "Alternating training days": "#ab47bc",
  };

  const daysToShow = 7;

  const visibleDays = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(startDate, i);
    const dayIndex = day.getDay();
    if (dayIndex !== 0 && dayIndex !== 6) {
      visibleDays.push(format(day, "EE dd"));
    }
  }

  const weekRange = `${format(startDate, "MMM dd, yyyy")} - ${format(
    endOfWeek(startDate, { weekStartsOn: 1 }),
    "MMM dd, yyyy"
  )}`;

  const getStatus = (assignmentId, date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    const entry = entries?.find(
      (e) =>
        String(e.assignmentId).trim() === String(assignmentId).trim() &&
        String(e.date).trim() === formattedDate
    );

    return entry ? entry.status : "none";
  };

  const updateStatus = async (assignmentId, date, newStatus) => {
    const dateStr = format(date, "yyyy-MM-dd");
    let result = await dispatch(
      updateAssignementTimeEntry(assignmentId, date, newStatus)
    );

    if (result.success) {
      setSuccess("Time status updated successfully.");
      dispatch(getAllEmployeeAssignements()); // 🔄 reload fresh data
    } else {
      setError("Time status update has failed.");
    }

    setEntries((prev) => {
      const exists = prev.find(
        (e) => e.assignmentId === assignmentId && e.date === dateStr
      );
      if (exists) {
        return prev.map((e) =>
          e.assignmentId === assignmentId && e.date === dateStr
            ? { ...e, status: newStatus }
            : e
        );
      } else {
        return [...prev, { assignmentId, date: dateStr, status: newStatus }];
      }
    });
  };

  const updateWeekStatus = async (assignmentId, newStatus) => {
    const mergeEntries = async (entries, newEntries) => {
      const newAssignmentIds = new Set(
        newEntries.map((entry) => entry.assignmentId)
      );

      const filteredOldEntries = entries.filter(
        (entry) => !newAssignmentIds.has(entry.assignmentId)
      );

      return [...newEntries, ...filteredOldEntries];
    };

    let newEntries = [];

    for (let i = 0; i < visibleDays.length; i++) {
      const date = addDays(startDate, i);
      const dateStr = format(date, "yyyy-MM-dd");
      newEntries.push({ assignmentId, date: dateStr, status: newStatus });
    }
    let newEntriesUpdate = newEntries?.map((e) => {
      return {
        date: e.date,
        timeType: e.status,
        durationInDays: 1,
      };
    });

    let result = await dispatch(
      updateAssignementTimeEntries(assignmentId, newEntriesUpdate)
    );
    if (result.success) {
      const updatedEntries = await mergeEntries(entries, newEntries);
      setEntries(updatedEntries);
      setSuccess("Time status updated successfully.");
    } else {
      setError("Time status update has failed.");
    }
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
    {
      field: "totalBillable",
      headerName: "TNF (Non-Billable)",
      flex: 1,
      renderCell: ({ row }) => {
        return <Box>{row.totalBillable}</Box>;
      },
    },
    {
      field: " totalNonBillable",
      headerName: "BT (Billable)",
      flex: 1,
      renderCell: ({ row }) => {
        return <Box>{row.totalNonBillable}</Box>;
      },
    },
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
    if (value >= 90) barColor = "#4caf50";
    else if (value >= 70) barColor = "#ff9800";
    else if (value >= 40) barColor = "#f44336";
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
      headerName: "Assigned To",
      flex: 1.2,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1} width="100%">
          {params.row.assignedTo ? (
            <Box sx={{ width: "100%" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar src={params?.row?.avatar} sx={{ marginRight: "10px" }} />
                <Box>{params?.row?.assignedTo || "Unassigned"}</Box>
              </Box>
            </Box>
          ) : (
            <Avatar>?</Avatar>
          )}
        </Box>
      ),
    },
    {
      field: "startDate",
      headerName: "From",
      flex: 1,
      renderCell: (params) => (
        <Box>{format(params?.row?.startDate, "dd-MM-yyyy")}</Box>
      ),
    },
    {
      field: "endDate",
      headerName: "To",
      flex: 1,
      renderCell: (params) => (
        <Box> {format(params?.row?.endDate, "dd-MM-yyyy")}</Box>
      ),
    },
    ...Array.from({ length: 7 }, (_, i) => addDays(startDate, i))
      .filter((date) => {
        const day = date.getDay();
        return day !== 0 && day !== 6; // Skip Sunday(0) and Saturday(6)
      })
      .map((date) => {
        const dayLabel = format(date, "EE dd");
        return {
          field: dayLabel,
          headerName: dayLabel,
          flex: 0.5,
          sortable: false,
          renderCell: (params) => {
            const assignmentId = params.row.id;
            const status = getStatus(assignmentId, date);
            const dateStr = format(date, "yyyy-MM-dd");
            const assignmentDates = params.row.dates.map((d) => d.dates);
            const memberId = params.row.memberId;

            if (!assignmentDates.includes(dateStr)) return null;

            if (isAbsent(memberId, dateStr)) {
              const absenceType = getAbsenceType(memberId, dateStr);
              const bgColor = absenceColors[absenceType] || "#9e9e9e";

              return (
                <Tooltip title={absenceType}>
                  <Box
                    width={28}
                    height={28}
                    borderRadius="4px"
                    sx={{
                      backgroundColor: bgColor,
                      border: "1px solid #ccc",
                    }}
                  />
                </Tooltip>
              );
            }

            return (
              <StatusCell
                status={status}
                onChange={(newStatus) =>
                  updateStatus(assignmentId, dateStr, newStatus)
                }
              />
            );
          },
        };
      }),
    {
      headerName: "Update throughout the week",
      flex: 1.5,
      renderCell: (params) => {
        const assignmentId = params.row.id;
        return (
          <WeekStatusCell
            onChange={(newStatus) => updateWeekStatus(assignmentId, newStatus)}
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
            dispatch(editTask(id, { workload: newVal }));
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
        Time and Workload Tracking{" "}
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
          {" "}
          {error && (
            <Box
              mt={2}
              mb={2}
              p={2}
              borderRadius="5px"
              bgcolor={colors.redAccent[500]}
              color="white"
              fontWeight="bold"
            >
              {error}
            </Box>
          )}
          {success && (
            <Box
              mt={2}
              mb={2}
              p={2}
              borderRadius="5px"
              bgcolor={colors.greenAccent[500]}
              color="white"
              fontWeight="bold"
            >
              {success}
            </Box>
          )}
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
                <Box display="flex" alignItems="center" gap={2}>
                  {/* 🎯 Ajout du DatePicker */}
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Aller à une date"
                      value={dayjs(startDate)}
                      inputFormat="YYYY-MM-DD"
                      disableMaskedInput
                      onChange={(newValue) => {
                        const dateObj =
                          newValue instanceof dayjs
                            ? newValue
                            : dayjs(newValue);
                        if (dateObj.isValid()) {
                          setStartDate(
                            dayjs(
                              startOfWeek(dateObj.toDate(), { weekStartsOn: 1 })
                            )
                          );
                        }
                      }}
                      slotProps={{
                        textField: {
                          size: "small",
                          sx: { marginBottom: "-30px" },
                        },
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth />
                      )}
                    />
                  </LocalizationProvider>
                </Box>
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
              <Box display="flex" alignItems="center" gap={1}>
                <Box width={12} height={12} bgcolor="#42a5f5" />
                <Typography variant="body2">Paid Leave</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box width={12} height={12} bgcolor="#ef5350" />
                <Typography variant="body2">Unpaid Leave</Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Box width={12} height={12} bgcolor="#ab47bc" />
                <Typography variant="body2">
                  Alternating Training Days
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
