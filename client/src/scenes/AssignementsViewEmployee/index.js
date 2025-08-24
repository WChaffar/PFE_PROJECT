// (tout en haut, inchangé)
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Paper,
  useTheme,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import dayjs from "dayjs";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { BACKEND_URL } from "../../config/ServerConfig";
import {
  createAssignement,
  getEmployeeAssignement,
  getMyAssignements,
  resetAssignementErros,
  resetAssignementState,
} from "../../actions/assignementsAction";
import WarningIcon from "@mui/icons-material/Warning";
import { getMyAbsences } from "../../actions/absenceAction";
import { startOfWeek } from "date-fns";

const transformAssignmentsToMissions = (assignments) => {
  const grouped = {};

  assignments.forEach((assignment) => {
    const projectId = assignment.project?._id;
    const taskId = assignment.taskId?._id;
    const key = `${projectId}_${taskId}`;

    if (!grouped[key]) {
      grouped[key] = {
        id: key,
        title: `${assignment.project?.projectName || "Unknown Project"} - ${
          assignment.taskId?.taskName || "Unknown Task"
        }`,
        detailedDates: [],
        fullRangeDates: [],
        originalAssignments: [],
      };
    }

    // Merge original assignment for optional use later
    grouped[key].originalAssignments.push(assignment);

    // Merge dayDetails
    if (assignment.dayDetails && assignment.dayDetails.length > 0) {
      const details = assignment.dayDetails.map((day) => ({
        date: new Date(day.date).toISOString().split("T")[0],
        period: day.period,
      }));
      grouped[key].detailedDates.push(...details);
    }

    // Merge full range
    if (assignment.startDate && assignment.endDate) {
      const start = new Date(assignment.startDate);
      const end = new Date(assignment.endDate);
      const current = new Date(start);

      while (current <= end) {
        const dateStr = current.toISOString().split("T")[0];
        if (!grouped[key].detailedDates.some((d) => d.date === dateStr)) {
          grouped[key].fullRangeDates.push({ date: dateStr, period: "FULL" });
        }
        current.setDate(current.getDate() + 1);
      }
    }
  });

  return Object.values(grouped);
};

const absenceColors = {
  "Paid leave": "#b3e5fc", // Light Blue
  "unpaid leave": "#e0e0e0", // Light Grey
  "Alternating training days": "#c8e6c9", // Light Green
};

const mapAbsencesToDays = (absences) => {
  const days = {};

  absences.forEach((absence) => {
    const start = new Date(absence.startDate);
    const end = new Date(absence.endDate);
    const current = new Date(start);

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];

      if (!days[dateStr]) {
        days[dateStr] = [];
      }

      days[dateStr].push({
        id: absence._id,
        type: absence.type,
        color: absenceColors[absence.type] || "#f5f5f5", // fallback
      });

      current.setDate(current.getDate() + 1);
    }
  });

  return days;
};

const AssignementsViewEmployee = () => {
  const [startDate, setStartDate] = useState(
    dayjs(dayjs(startOfWeek(new Date(), { weekStartsOn: 1 })))
  );
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const daysToShow = 14;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dates = Array.from({ length: daysToShow }).map((_, i) =>
    startDate.add(i, "day")
  );
  const dispatch = useDispatch();
  const selectedUser = useSelector((state) => state.auth.user);
  const [teamMember, setTeamMember] = useState({});
  const error = useSelector((state) => state.tasks.error);
  const assignementError = useSelector((state) => state.assignements.error);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [halfDayAssignments, setHalfDayAssignments] = useState([]);
  const [halfDayDate, setHalfDayDate] = useState("");
  const [halfDayPeriod, setHalfDayPeriod] = useState("");
  const selectedProjects = useSelector((state) => state.projects.projects);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [assignementLoading, setAssignementLoading] = useState(false);
  const selectedTasks = useSelector((state) => state.tasks.tasks);
  const [tasks, setTasks] = useState([]);
  const [assignementErrors, setAssignementErrors] = useState(null);
  const selectedAbsences = useSelector((state) => state.absence.absences);
  const selectedAssignements = useSelector(
    (state) => state.assignements.assignements
  );
  // Add to your existing state
  const [assignments, setAssignments] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [absenceDayMap, setAbsenceDayMap] = useState({});

  useEffect(() => {
    if (selectedAbsences.length !== 0) {
      setAbsences(selectedAbsences);
      const mapped = mapAbsencesToDays(selectedAbsences);
      setAbsenceDayMap(mapped);
    }
  }, [selectedAbsences]);

  useEffect(() => {
    dispatch(getMyAbsences());
  }, [dispatch]); // <== Appelle une seule fois le fetch
  useEffect(() => {
    dispatch(resetAssignementState());
    dispatch(getMyAssignements());
  }, [dispatch]);

  useEffect(() => {
    if (Object.keys(selectedAssignements).length > 0) {
      setAssignments(selectedAssignements);
    }
  }, [selectedAssignements]);

  useEffect(() => {
    setAssignementErrors(assignementError);
  }, [assignementError]);

  useEffect(() => {
    if (selectedTasks.length !== 0) {
      setTasks(selectedTasks);
    }
  }, [selectedTasks]);

  useEffect(() => {
    if (Object.keys(selectedUser).length > 0) {
      setTeamMember(selectedUser);
    }
  }, [selectedUser]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(resetAssignementErros());
  }, [dispatch, teamMember?._id]); // <== Appelle une seule fois le fetch

  const handlePrev = () =>
    setStartDate((prev) => prev.subtract(daysToShow, "day"));
  const handleNext = () => setStartDate((prev) => prev.add(daysToShow, "day"));

  const monthRow = dates.map((date, i) => {
    const showLabel =
      i === 0 || date.format("MM") !== dates[i - 1].format("MM");
    return (
      <Box key={i} width="60px" textAlign="center">
        {showLabel ? (
          <Typography fontWeight="bold" fontSize="12px" sx={{ color: "#000" }}>
            {date.format("MMMM")}
          </Typography>
        ) : null}
      </Box>
    );
  });

  // Add this right after the monthRow declaration
  const yearRow = dates.map((date, i) => {
    const showLabel =
      i === 0 || date.format("YYYY") !== dates[i - 1].format("YYYY");
    return (
      <Box key={`year-${i}`} width="60px" textAlign="center">
        {showLabel ? (
          <Typography fontWeight="bold" fontSize="12px" sx={{ color: "#000" }}>
            {date.format("YYYY")}
          </Typography>
        ) : null}
      </Box>
    );
  });
  const handleFormSubmit = async (data) => {
    setAssignementLoading(true);
    const result = await dispatch(createAssignement(data));
    if (result.success) {
      dispatch(getEmployeeAssignement(teamMember?._id));
      dispatch(resetAssignementErros());
      setAssignementLoading(false);
      setSuccess("Assignement created with success.");
      setHalfDayAssignments([]);
      setHalfDayDate(null);
      setTimeout(() => {
        setSuccess(null);
        setShowAssignmentForm(false);
        navigate(`/assignements/${teamMember?._id}/edit`); // ✅ Only navigate on success
      }, 2000);
    } else {
      setAssignementLoading(false);
    }
  };
  const weekendColor = "#f0f0f0"; // Light gray

  return (
    <Box p={3}>
      <Typography variant="h5" mb={1}>
        My assignements
      </Typography>
      <Typography variant="subtitle2" color="gray" mb={3}>
        You can see your assignments for different tasks in each project.
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={BACKEND_URL + teamMember?.profilePicture}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Typography variant="h6">{teamMember?.fullName}</Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <IconButton onClick={handlePrev} sx={{ width: 30, height: 30 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Box flex={1} overflow="hidden" sx={{ marginLeft: 22 }}>
            <Box
              display="flex"
              bgcolor="#fff9c4"
              sx={{
                bgcolor: "#fff9c4",
                display: "flex",
                textAlign: "center",
              }}
            >
              {yearRow} {/* Add this line for the year row */}
            </Box>
            <Box display="flex" bgcolor="#fff9c4">
              {monthRow}
            </Box>
            <Box display="flex" bgcolor="#fff9c4" p={0.5}>
              {dates.map((date) => (
                <Box key={date.toString()} width="60px" textAlign="center">
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{ color: "#000" }}
                  >
                    {date.format("dd")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#000" }}>
                    {date.format("DD")}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          <IconButton onClick={handleNext} sx={{ width: 30, height: 30 }}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>
        <Box
          style={{
            maxHeight: "260px", // adjust to your desired height
            overflowY:
              transformAssignmentsToMissions(assignments).length > 1
                ? "auto" // "auto" is better than "scroll"
                : "hidden",
          }}
        >
          {transformAssignmentsToMissions(assignments).map((mission) => (
            <Box key={mission.id} display="flex" alignItems="center" mb={1}>
              <Typography
                style={{
                  borderBottom: "1px solid #eee", // ligne grise sous le titre
                  paddingBottom: "2px", // petit espace pour respirer
                }}
                width="200px"
                fontSize="14px"
              >
                {mission.title.length > 40
                  ? mission.title.slice(0, 45) + "..."
                  : mission.title}
              </Typography>
              {dates.map((date) => {
                const dateStr = date.format("YYYY-MM-DD");
                const dayOfWeek = date.day(); // 0 = Sunday, 6 = Saturday
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                if (isWeekend) {
                  // Empty slot (but highlight weekends)
                  return (
                    <Box
                      key={`${mission.id}-empty-${dateStr}`}
                      width="60px"
                      height="20px"
                      m="1px"
                      border="1px solid #eee"
                      bgcolor={isWeekend ? weekendColor : "transparent"}
                    />
                  );
                }
                // Check for absence
                if (absenceDayMap[dateStr]) {
                  return (
                    <Box
                      key={`${mission.id}-absence-${dateStr}`}
                      width="60px"
                      height="20px"
                      m="1px"
                      display="flex"
                    >
                      {absenceDayMap[dateStr].map((absence, idx) => (
                        <Box
                          key={absence.id + "-" + idx}
                          flex={1}
                          bgcolor={absence.color}
                          title={absence.type}
                          border="1px solid #ccc"
                        />
                      ))}
                    </Box>
                  );
                }

                // Check for detailed dates first (AM/PM)
                const detailedSlot = mission.detailedDates.find(
                  (d) => d.date === dateStr
                );
                if (detailedSlot) {
                  return (
                    <Box
                      key={`${mission.id}-detail-${dateStr}`}
                      width="60px"
                      height="20px"
                      m="1px"
                      display="flex"
                      flexDirection="column"
                    >
                      <Box
                        flex={1}
                        bgcolor={
                          detailedSlot.period === "Morning"
                            ? "#FFD580"
                            : "transparent"
                        }
                        border="1px solid #FFD580"
                      />
                      <Box
                        flex={1}
                        bgcolor={
                          detailedSlot.period === "Afternoon"
                            ? "#FFA500"
                            : "transparent"
                        }
                        border="1px solid #FFA500"
                      />
                    </Box>
                  );
                }

                // Check for full range dates
                const fullRangeSlot = mission.fullRangeDates.find(
                  (d) => d.date === dateStr
                );
                if (fullRangeSlot) {
                  return (
                    <Box
                      key={`${mission.id}-full-${dateStr}`}
                      width="60px"
                      height="20px"
                      m="1px"
                      bgcolor="#FFA500"
                    />
                  );
                }

                // Empty slot (but highlight weekends)
                return (
                  <Box
                    key={`${mission.id}-empty-${dateStr}`}
                    width="60px"
                    height="20px"
                    m="1px"
                    border="1px solid #eee"
                    bgcolor="transparent"
                  />
                );
              })}
            </Box>
          ))}
        </Box>

        <Box mt={2}>
          <Box display="flex" gap={2} mt={2}>
            {Object.entries(absenceColors).map(([type, color]) => (
              <Box key={type} display="flex" alignItems="center" gap={1}>
                <Box
                  width={16}
                  height={16}
                  bgcolor={color}
                  border="1px solid #ccc"
                />
                <Typography fontSize="12px">{type}</Typography>
              </Box>
            ))}
            <Box key={"Assigned"} display="flex" alignItems="center" gap={1}>
              <Box
                width={16}
                height={16}
                bgcolor="#FFA500"
                border="1px solid #ccc"
              />
              <Typography fontSize="12px">Production</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                width={16}
                height={16}
                bgcolor={weekendColor}
                border="1px solid #ccc"
              />
              <Typography fontSize="12px">Weekend</Typography>
            </Box>
          </Box>
          <br />
        </Box>
      </Paper>
    </Box>
  );
};

export default AssignementsViewEmployee;
