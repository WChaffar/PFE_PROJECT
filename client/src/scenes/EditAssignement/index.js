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
  DialogActions,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import dayjs from "dayjs";
import { tokens } from "../../theme";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getOneTeamMember } from "../../actions/teamAction";
import { BACKEND_URL } from "../../config/ServerConfig";
import { Autocomplete, TextField } from "@mui/material";
import { getAllProjects, resetProjectState } from "../../actions/projectAction";
import { getTasksByProjectId, ResetTaskState } from "../../actions/taskAction";
import { Formik } from "formik";
import {
  createAssignement,
  deleteAssignement,
  getAssignementRecommendation,
  getEmployeeAssignement,
  resetAssignementErros,
  resetAssignementState,
  updateAssignement,
} from "../../actions/assignementsAction";
import WarningIcon from "@mui/icons-material/Warning";
import { getEmployeeAbsenceById } from "../../actions/absenceAction";
import { format, isValid, parseISO, startOfWeek } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { motion } from "framer-motion";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { Brain } from "lucide-react"; // Icône IA

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
        assignementId: assignment._id,
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
          grouped[key].fullRangeDates.push({
            assignementId: assignment._id,
            date: dateStr,
            period: "FULL",
          });
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

const EditStaffing = () => {
  const [startDate, setStartDate] = useState(
    dayjs(startOfWeek(new Date(), { weekStartsOn: 1 }))
  );
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [showAssignmentEditForm, setShowAssignmentEditForm] = useState(false);
  const [currentEditedAssignement, setCurrentEditedAssignement] =
    useState(null);
  const daysToShow = 14;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dates = Array.from({ length: daysToShow }).map((_, i) =>
    startDate.add(i, "day")
  );
  const dispatch = useDispatch();
  const selectedteamMember = useSelector(
    (state) => state.team.activeTeamMember
  );
  const [teamMember, setTeamMember] = useState({});
  const { id } = useParams();
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
  const [projects, setProjects] = useState([]);
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
  const [loadedRecommandedAssignment, setLoadedRecommandedAssignment] =
    useState(null);

  const [openRecommendationModal, setOpenRecommendationModal] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingLoadRecommendations, setLoadingLoadRecommendations] =
    useState(null);
  const [assignementRecommendation, setAssignementRecommendation] =
    useState(null);
  const [formKey, setFormKey] = useState(0); // Pour forcer le re-render du formulaire
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [recommendationFormData, setRecommendationFormData] = useState(null);

  useEffect(() => {
    if (selectedProjects.length !== 0) {
      const projectsMap = selectedProjects.map((project) => ({
        id: project._id,
        projectName: project.projectName,
      }));
      setProjects(projectsMap);
    }
  }, [selectedProjects]);

  useEffect(() => {
    if (selectedAbsences.length !== 0) {
      setAbsences(selectedAbsences);
      const mapped = mapAbsencesToDays(selectedAbsences);
      setAbsenceDayMap(mapped);
    }
  }, [selectedAbsences]);

  // Synchroniser les tâches du Redux store avec l'état local
  useEffect(() => {
    console.log("📋 Selected tasks changed:", selectedTasks.length, selectedTasks);
    if (selectedTasks.length !== 0) {
      const tasksMap = selectedTasks.map((task) => ({
        _id: task._id,
        taskName: task.taskName,
        project: task.project,
        RequiredyearsOfExper: task.RequiredyearsOfExper,
        projectPhase: task.projectPhase,
        startDate: task.startDate,
        endDate: task.endDate,
      }));
      setTasks(tasksMap);
      console.log("✅ Tasks updated locally:", tasksMap);
    }
  }, [selectedTasks]);

  useEffect(() => {
    dispatch(resetProjectState());
    dispatch(getAllProjects());
  }, [dispatch, id]);

  // Temporairement désactivé pour diagnostiquer le problème de chargement des recommandations
  /*
  useEffect(() => {
    if (!showAssignmentForm && (loadedRecommandedAssignment || recommendationFormData)) {
      setLoadedRecommandedAssignment(null);
      setRecommendationFormData(null);
      setFormKey(prev => prev + 1);
    }
  }, [showAssignmentForm, loadedRecommandedAssignment, recommendationFormData]);
  */



  useEffect(() => {
    dispatch(ResetTaskState());
    dispatch(resetAssignementState());
    dispatch(getEmployeeAbsenceById(id));
    dispatch(getEmployeeAssignement(id));
  }, [dispatch, id]);

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

  const getTasksOfSelectedProject = async (params) => {
    setTasksLoading(true);
    const result = await dispatch(getTasksByProjectId(params.id));
    if (result.success) {
      setTasksLoading(false);
    } else {
      setTasksLoading(false);
    }
  };

  const handleAddHalfDay = () => {
    if (!halfDayDate || !halfDayPeriod) return;

    setHalfDayAssignments((prev) => [
      ...prev,
      { date: halfDayDate, period: halfDayPeriod },
    ]);

    // Reset inputs
    setHalfDayDate("");
    setHalfDayPeriod("");
  };

  // Fonction pour réinitialiser complètement le formulaire
  const resetAssignmentForm = () => {
    setLoadedRecommandedAssignment(null);
    setRecommendationFormData(null);
    setHalfDayAssignments([]);
    setHalfDayDate("");
    setHalfDayPeriod("");
    setFormKey(prev => prev + 1);
  };

  useEffect(() => {
    if (Object.keys(selectedteamMember).length > 0) {
      setTeamMember(selectedteamMember);
    }
  }, [selectedteamMember]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(resetAssignementErros());
    dispatch(getOneTeamMember(id));
  }, [dispatch, id]); // <== Appelle une seule fois le fetch

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
    setAssignementErrors(null);
    setAssignementLoading(true);
    const result = await dispatch(createAssignement(data));
    if (result.success) {
      dispatch(getEmployeeAssignement(id));
      dispatch(resetAssignementErros());
      setAssignementLoading(false);
      setSuccess("Assignement created with success.");
      setHalfDayAssignments([]);
      setHalfDayDate(null);
      setTimeout(() => {
        setSuccess(null);
        setShowAssignmentForm(false);
        navigate(`/assignements/${id}/edit`); // ✅ Only navigate on success
      }, 2000);
    } else {
      setAssignementLoading(false);
    }
  };

  const handleEditFormSubmit = async (data) => {
    setAssignementLoading(true);
    const result = await dispatch(updateAssignement(data._id, data));
    if (result.success) {
      dispatch(getEmployeeAssignement(id));
      dispatch(resetAssignementErros());
      setAssignementLoading(false);
      setSuccess("Assignement updated with success.");
      setHalfDayAssignments([]);
      setHalfDayDate(null);
      setTimeout(() => {
        setSuccess(null);
        setShowAssignmentEditForm(false);
        navigate(`/assignements/${id}/edit`); // ✅ Only navigate on success
      }, 2000);
    } else {
      setAssignementLoading(false);
    }
  };

  const handleDeleteAssignement = async (assigId) => {
    setAssignementLoading(true);
    const result = await dispatch(deleteAssignement(assigId));
    if (result.success) {
      setAssignementLoading(false);
      setSuccess("Assignement deleted with success.");
      setTimeout(() => {
        dispatch(resetAssignementState());
        dispatch(getEmployeeAssignement(id));
        setSuccess(null);
        setShowAssignmentEditForm(false);
        window.location.reload();
        navigate(`/assignements/${id}/edit`); // ✅ Only navigate on success
      }, 1500);
    } else {
      setAssignementLoading(false);
    }
  };

  const weekendColor = "#f0f0f0"; // Light gray

  const handleGenerateRecommendations = async () => {
    setOpenRecommendationModal(true);
    setLoadingRecommendations(true);

    try {
      // Récupérer les IDs des projets du manager connecté
      const availableProjectIds = selectedProjects.map(p => p._id);
      console.log("📁 Manager's available projects for IA:", availableProjectIds);
      
      if (availableProjectIds.length === 0) {
        console.warn("⚠️ No projects available for current manager");
        setAssignementRecommendation({ recommendations: [] });
        setLoadingRecommendations(false);
        return;
      }

      // Passer les projets du manager à l'IA
      const res = await dispatch(getAssignementRecommendation(id, availableProjectIds));
      if (res.success === true) {
        console.log("🤖 IA recommendations (pre-filtered by manager projects):", res?.data);
        setAssignementRecommendation(res?.data);
      } else {
        console.error(res.error);
        setAssignementRecommendation({ recommendations: [] });
      }
    } catch (err) {
      console.error(err);
      setAssignementRecommendation({ recommendations: [] });
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // --- Modal Component ---

  const RecommendationModal = ({ open, onClose, loading, data, onAssign }) => {
    // Déterminer les priorités selon le classement des probabilités
    const getPriorities = (recommendations) => {
      if (!recommendations || recommendations.length === 0) return [];
      const sorted = [...recommendations].sort(
        (a, b) => b.probabilite_succes - a.probabilite_succes
      );
      const priorities = ["High", "Medium", "Low"];
      return sorted.map((rec, index) => ({
        ...rec,
        priority: priorities[index] || "Low", // si plus de 3 recommandations, le reste sera Low
      }));
    };

    const recommendationsWithPriority = getPriorities(data?.recommendations);

    // Définir la couleur selon la priorité
    const getColor = (priority) => {
      if (priority === "High") return "error";
      if (priority === "Medium") return "warning";
      return "success";
    };
    const AiAdvancedLoader = () => {
      return (
        <div className="flex flex-col items-center space-y-3">
          {/* Icône IA avec halo animé */}
          <motion.div
            className="relative flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            style={{ width: "48px", height: "48px" }} // 👈 réduit la zone de rotation
          >
            {/* Halo lumineux */}
            <motion.div
              className="absolute w-12 h-12 rounded-full bg-blue-400 opacity-30 blur-md"
              animate={{ scale: [1, 1.15, 1] }} // 👈 moins d’amplitude
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            />
            {/* Icône IA */}
            <Brain className="w-8 h-8 text-blue-600" />
          </motion.div>
        </div>
      );
    };
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Assignment Recommendation</DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              p={4}
            >
              <AiAdvancedLoader />
              <Typography variant="body2" color="text.secondary" mt={2}>
                Generating recommendations...
              </Typography>
            </Box>
          ) : (
            <>
              {recommendationsWithPriority.length > 0 ? (
                recommendationsWithPriority.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Box
                      mb={2}
                      p={2}
                      border="1px solid #ddd"
                      borderRadius="8px"
                      display="flex"
                      flexDirection="column"
                      gap={1}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box display="flex" alignItems="center" gap={1}>
                          <AssignmentIcon color={getColor(rec.priority)} />
                          <Typography variant="h6">{rec.task}</Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} mt={1}>
                          <Chip
                            label={rec.priority}
                            color={getColor(rec.priority)}
                            variant="outlined"
                            size="small"
                          />
                          <Button
                            variant="contained"
                            size="small"
                            color="warning"
                            onClick={() => onAssign(rec)}
                            sx={{
                              minWidth: 60,
                              padding: "2px 6px",
                              fontSize: "0.7rem",
                            }}
                          >
                            {loadingLoadRecommendations != null &&
                            loadingLoadRecommendations === rec?.task_id ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : (
                              "Load"
                            )}
                          </Button>
                        </Box>
                      </Box>

                      <Typography variant="subtitle2" color="text.secondary">
                        Project: {rec.project}
                      </Typography>
                      <Typography>
                        📅 {dayjs(rec.dates.start).format("DD MMM YYYY")} →{" "}
                        {dayjs(rec.dates.end).format("DD MMM YYYY")}
                      </Typography>
                      <Typography variant="body2" mt={1}>
                        {rec.justification}
                      </Typography>
                    </Box>
                  </motion.div>
                ))
              ) : (
                <Box textAlign="center" p={3}>
                  <Typography variant="h6" color="text.secondary" mb={2}>
                    🤖 No recommendations available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The AI couldn't find suitable task recommendations for this employee based on your available projects.
                    <br /><br />
                    This might happen if:
                    <br />• No tasks match the employee's skills in your projects
                    <br />• All matching tasks have scheduling conflicts
                    <br />• The employee is absent during recommended periods
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  // utils/getWorkingDays.js
  function getWorkingDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      throw new Error("Invalid date(s) provided");
    }

    if (start > end) {
      return 0; // no days if range is invalid
    }

    let count = 0;
    let current = new Date(start);

    while (current <= end) {
      const day = current.getDay(); // 0 = Sunday, 6 = Saturday
      if (day !== 0 && day !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  return (
    <Box p={3}>
      <Typography variant="h5" mb={1}>
        Staffing Collaborateur
      </Typography>
      <Typography variant="subtitle2" color="gray" mb={3}>
        Optimize Your Workforce, Maximize Your Potential
      </Typography>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" flexWrap="wrap" justifyContent="space-between">
          <Box display="flex" alignItems="center" mb={3}>
            <Avatar
              src={BACKEND_URL + teamMember?.profilePicture}
              sx={{ width: 56, height: 56, mr: 2 }}
            />
            <Typography variant="h6">{teamMember?.fullName}</Typography>
          </Box>
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
                    newValue instanceof dayjs ? newValue : dayjs(newValue);
                  if (dateObj.isValid()) {
                    setStartDate(
                      dayjs(startOfWeek(dateObj.toDate(), { weekStartsOn: 1 }))
                    );
                  }
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: { marginBottom: "-30px" },
                  },
                }}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Box>
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
            maxHeight: "160px", // adjust to your desired height
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
                      onClick={() => {
                        setShowAssignmentEditForm(false);
                        setCurrentEditedAssignement(null);
                        setShowAssignmentForm(false);
                        setShowAssignmentEditForm(true);
                        let newEditedAssignement = assignments?.find(
                          (a) => a._id === detailedSlot?.assignementId
                        );
                        setCurrentEditedAssignement({
                          ...newEditedAssignement,
                          dayDetails: newEditedAssignement?.dayDetails?.map(
                            (d) => {
                              return {
                                _id: d._id,
                                period: d.period,
                                date: d.date,
                              };
                            }
                          ),
                        });
                      }}
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
                      onClick={() => {
                        setShowAssignmentEditForm(false);
                        setCurrentEditedAssignement(null);
                        setShowAssignmentForm(false);
                        setShowAssignmentEditForm(true);
                        let newEditedAssignement = assignments?.find(
                          (a) => a._id === fullRangeSlot?.assignementId
                        );
                        setCurrentEditedAssignement(newEditedAssignement);
                      }}
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
          <Button
            variant="outlined"
            size="small"
            sx={{
              width: "130px",
              fontSize: "10px",
              px: 1,
              borderColor: colors.grey[100],
              backgroundColor: colors.primary,
              color: colors.grey[100],
            }}
            onClick={() => {
              setShowAssignmentEditForm(false);
              setShowAssignmentForm(true);
            }}
          >
            + Add mission
          </Button>
        </Box>

        {showAssignmentForm && (
          <Formik
            key={`form-${formKey}-${recommendationFormData ? 'loaded' : 'empty'}`}
            initialValues={(() => {
              console.log("📋 Building form initial values...");
              console.log("🎯 Recommendation form data:", recommendationFormData);
              console.log("🔍 Form key:", formKey);
              console.log("📅 Current timestamp:", new Date().toISOString());
              
              if (recommendationFormData) {
                console.log("✅ Using recommendation form data:", recommendationFormData);
                return recommendationFormData;
              }
              
              console.log("⚪ Using empty form values");
              return {
                project: null,
                task: null,
                startDate: "",
                endDate: "",
                exactDays: 0
              };
            })()}
            enableReinitialize={true}
            onSubmit={(values) => {
              console.log(values?.exactDays);
              const newAssignementData = {
                employee: id,
                project: values?.project?.id,
                taskId: values?.task._id,
                startDate: values?.startDate,
                endDate: values?.endDate,
                totalDays: values?.exactDays,
                dayDetails: halfDayAssignments,
              };
              // Vérifier si l'assignation existe déjà
              let findAssignment = selectedAssignements?.find((a) => {
                const sameEmployee =
                  a?.employee?._id === newAssignementData?.employee;
                const sameTask =
                  a?.taskId?._id === newAssignementData?.taskId ||
                  a?.taskId === newAssignementData?.taskId;

                // S'assurer que les dates sont comparées correctement (objets Date plutôt que strings)
                const newStart = new Date(newAssignementData?.startDate);
                const newEnd = new Date(newAssignementData?.endDate);
                const existingStart = new Date(a?.startDate);
                const existingEnd = new Date(a?.endDate);

                const overlap =
                  (newStart >= existingStart && newStart <= existingEnd) ||
                  (newEnd >= existingStart && newEnd <= existingEnd) ||
                  (newStart <= existingStart && newEnd >= existingEnd);

                return sameEmployee && sameTask && overlap;
              });

              if (findAssignment) {
                setAssignementErrors(
                  "The employee is already assigned to this task during the selected period."
                );
                setTimeout(() => {
                  setAssignementErrors(null);
                }, 10000);
              } else {
                handleFormSubmit(newAssignementData);
              }
            }}
          >
            {({ values, setFieldValue, handleChange, handleSubmit }) => (
              <Box
                mt={4}
                p={3}
                border="2px solid #D3BDF0"
                borderRadius="10px"
                component="form"
                onSubmit={handleSubmit}
              >
                <Typography variant="h6" mb={2}>
                  New assignment
                </Typography>
                {assignementErrors && (
                  <Box
                    mt={2}
                    mb={2}
                    p={2}
                    borderRadius="5px"
                    bgcolor={colors.redAccent[500]}
                    color="white"
                    fontWeight="bold"
                  >
                    {assignementErrors}
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
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      Project Name *
                    </Typography>
                    <Autocomplete
                      options={projects}
                      getOptionLabel={(option) => option.projectName}
                      value={values.project}
                      onChange={(event, newValue) => {
                        setFieldValue("project", newValue);
                        setSelectedProject(newValue);
                        if (newValue !== null) {
                          setTasks([]);
                          getTasksOfSelectedProject(newValue);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select a Project"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      sx={{ width: "100%" }}
                    />
                  </Box>

                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      Mission - Task Name *
                    </Typography>
                    <Autocomplete
                      options={tasks}
                      getOptionLabel={(option) => option.taskName}
                      value={values.task}
                      disabled={!values.project}
                      onChange={(event, newValue) => {
                        setFieldValue("task", newValue);
                        setSelectedTask(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select a Task"
                          variant="outlined"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {tasksLoading ? (
                                  <CircularProgress color="inherit" size={16} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      sx={{ width: "100%" }}
                    />
                  </Box>

                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      Start Date *
                    </Typography>
                    <input
                      type="date"
                      name="startDate"
                      value={values.startDate}
                      onChange={(e) => {
                        handleChange(e); // update startDate
                        if (values.endDate) {
                          setFieldValue(
                            "exactDays",
                            getWorkingDays(e.target.value, values.endDate)
                          );
                        }
                      }}
                      style={{ width: "100%", padding: 6, borderRadius: 4 }}
                    />
                  </Box>

                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      End Date *
                    </Typography>
                    <input
                      type="date"
                      name="endDate"
                      value={values.endDate}
                      onChange={(e) => {
                        handleChange(e); // update endDate
                        if (values.startDate) {
                          setFieldValue(
                            "exactDays",
                            getWorkingDays(values.startDate, e.target.value)
                          );
                        }
                      }}
                      style={{ width: "100%", padding: 6, borderRadius: 4 }}
                    />
                  </Box>

                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      Number of days *
                    </Typography>
                    <input
                      type="number"
                      name="exactDays"
                      value={values.exactDays}
                      readOnly
                      style={{
                        width: "100%",
                        padding: 6,
                        borderRadius: 4,
                        backgroundColor: "#f5f5f5",
                      }}
                    />
                  </Box>

                  <Box flex="1" minWidth="250px">
                    <Typography fontSize="14px" mb={0.5}>
                      Specify half of the day's assignment
                    </Typography>
                    <textarea
                      rows="5"
                      disabled
                      style={{
                        width: "100%",
                        padding: 6,
                        borderRadius: 4,
                        backgroundColor: "#f5f5f5",
                      }}
                      value={halfDayAssignments
                        .map((item) => `${item.date} - ${item.period}`)
                        .join("\n")}
                    />
                  </Box>
                  <Box
                    display="flex"
                    gap={2}
                    alignItems="center"
                    mt={1}
                    flexWrap="wrap"
                  >
                    <Box>
                      <Typography fontSize="14px" mb={0.5}>
                        Add Half-Day Date
                      </Typography>
                      <input
                        type="date"
                        value={halfDayDate}
                        onChange={(e) => setHalfDayDate(e.target.value)}
                        style={{ padding: 6, borderRadius: 4 }}
                      />
                    </Box>

                    <Box>
                      <Box display="flex" gap={1}>
                        <Box>
                          <Typography fontSize="14px" mb={0.5}>
                            Period *
                          </Typography>
                          <Box display="flex" gap={2}>
                            <label>
                              <input
                                type="radio"
                                name="halfDayPeriod"
                                value="Morning"
                                checked={halfDayPeriod === "Morning"}
                                onChange={(e) =>
                                  setHalfDayPeriod(e.target.value)
                                }
                              />{" "}
                              Morning
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="halfDayPeriod"
                                value="Afternoon"
                                checked={halfDayPeriod === "Afternoon"}
                                onChange={(e) =>
                                  setHalfDayPeriod(e.target.value)
                                }
                              />{" "}
                              Afternoon
                            </label>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleAddHalfDay}
                      sx={{ height: "36px" }}
                    >
                      + Add Half-Day
                    </Button>
                  </Box>
                </Box>

                <Box mt={2} display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AutoAwesomeIcon />}
                    sx={{
                      width: "250px",
                      fontSize: "10px",
                      px: 1,
                      borderRadius: "5px",
                      backgroundColor: colors.primary[100],
                      color: colors.grey[900],
                    }}
                    onClick={handleGenerateRecommendations}
                  >
                    Generate assignment recommendations
                  </Button>
                </Box>
                <Box mt={2} display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      resetAssignmentForm();
                      setShowAssignmentForm(false);
                    }}
                    sx={{
                      width: "130px",
                      fontSize: "10px",
                      px: 1,
                      borderColor: colors.redAccent[500],
                      backgroundColor: colors.primary,
                      color: colors.redAccent[500],
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    type="submit"
                    sx={{
                      width: "130px",
                      fontSize: "10px",
                      px: 1,
                      borderColor: colors.grey[100],
                      backgroundColor: colors.primary,
                      color: colors.grey[100],
                    }}
                  >
                    SAVE
                  </Button>
                  {assignementLoading && <CircularProgress />}
                </Box>
              </Box>
            )}
          </Formik>
        )}
        {showAssignmentEditForm && (
          <Formik
            initialValues={{
              project: {
                id: currentEditedAssignement?.project?._id,
                projectName: currentEditedAssignement?.project?.projectName,
              },
              task: currentEditedAssignement?.taskId,
              startDate: currentEditedAssignement?.startDate
                ? format(currentEditedAssignement?.startDate, "yyyy-MM-dd")
                : "",
              endDate: currentEditedAssignement?.endDate
                ? format(currentEditedAssignement?.endDate, "yyyy-MM-dd")
                : "",
              exactDays: currentEditedAssignement?.totalDays,
              dayDetails:
                currentEditedAssignement?.dayDetails
                  ?.map((item) => {
                    const parsedDate = parseISO(item?.date);
                    const dateStr = isValid(parsedDate)
                      ? format(parsedDate, "yyyy-MM-dd")
                      : "";
                    return `${dateStr} - ${item?.period}`;
                  })
                  .join("\n") || "",
            }}
            enableReinitialize
            onSubmit={(values) => {
              const newAssignementData = {
                _id: currentEditedAssignement?._id,
                employee: id,
                project: values?.project?.id,
                taskId: values?.task._id,
                startDate: values?.startDate,
                endDate: values?.endDate,
                totalDays: values?.exactDays,
                dayDetails: currentEditedAssignement?.dayDetails,
              };
              handleEditFormSubmit(newAssignementData);
            }}
          >
            {({ values, setFieldValue, handleChange, handleSubmit }) => (
              <Box
                mt={4}
                p={3}
                border="2px solid #D3BDF0"
                borderRadius="10px"
                component="form"
                onSubmit={handleSubmit}
              >
                <Typography variant="h6" mb={2}>
                  Edit assignment
                </Typography>
                {assignementErrors && (
                  <Box
                    mt={2}
                    mb={2}
                    p={2}
                    borderRadius="5px"
                    bgcolor={colors.redAccent[500]}
                    color="white"
                    fontWeight="bold"
                  >
                    {assignementErrors}
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
                <Box display="flex" flexWrap="wrap" gap={2}>
                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      Project Name *
                    </Typography>
                    <Autocomplete
                      options={projects}
                      getOptionLabel={(option) => option.projectName}
                      value={values.project}
                      onChange={(event, newValue) => {
                        setFieldValue("project", newValue);
                        setSelectedProject(newValue);
                        if (newValue !== null) {
                          setTasks([]);
                          getTasksOfSelectedProject(newValue);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select a Project"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      sx={{ width: "100%" }}
                    />
                  </Box>

                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      Mission - Task Name *
                    </Typography>
                    <Autocomplete
                      options={tasks}
                      getOptionLabel={(option) => option.taskName}
                      value={values.task}
                      disabled={!values.project}
                      onChange={(event, newValue) => {
                        setFieldValue("task", newValue);
                        setSelectedTask(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select a Task"
                          variant="outlined"
                          size="small"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {tasksLoading ? (
                                  <CircularProgress color="inherit" size={16} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                      sx={{ width: "100%" }}
                    />
                  </Box>

                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      Start Date *
                    </Typography>
                    <input
                      type="date"
                      name="startDate"
                      value={values.startDate}
                      onChange={handleChange}
                      style={{ width: "100%", padding: 6, borderRadius: 4 }}
                    />
                  </Box>

                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      End Date *
                    </Typography>
                    <input
                      type="date"
                      name="endDate"
                      value={values.endDate}
                      onChange={handleChange}
                      style={{ width: "100%", padding: 6, borderRadius: 4 }}
                    />
                  </Box>

                  <Box flex="1" minWidth="200px">
                    <Typography fontSize="14px" mb={0.5}>
                      Number of days *
                    </Typography>
                    <input
                      type="number"
                      name="exactDays"
                      value={values.exactDays}
                      onChange={handleChange}
                      style={{ width: "100%", padding: 6, borderRadius: 4 }}
                      disabled
                    />
                  </Box>

                  <Box flex="1" minWidth="250px">
                    <Typography fontSize="14px" mb={0.5}>
                      Specify half of the day's assignment
                    </Typography>
                    <textarea
                      rows="5"
                      disabled
                      style={{
                        width: "100%",
                        padding: 6,
                        borderRadius: 4,
                        backgroundColor: "#f5f5f5",
                      }}
                      value={values?.dayDetails}
                    />
                  </Box>
                  <Box
                    display="flex"
                    gap={2}
                    alignItems="center"
                    mt={1}
                    flexWrap="wrap"
                  >
                    <Box>
                      <Typography fontSize="14px" mb={0.5}>
                        Add Half-Day Date
                      </Typography>
                      <input
                        type="date"
                        value={halfDayDate}
                        onChange={(e) => setHalfDayDate(e.target.value)}
                        style={{ padding: 6, borderRadius: 4 }}
                      />
                    </Box>

                    <Box>
                      <Box display="flex" gap={1}>
                        <Box>
                          <Typography fontSize="14px" mb={0.5}>
                            Period *
                          </Typography>
                          <Box display="flex" gap={2}>
                            <label>
                              <input
                                type="radio"
                                name="halfDayPeriod"
                                value="Morning"
                                checked={halfDayPeriod === "Morning"}
                                onChange={(e) =>
                                  setHalfDayPeriod(e.target.value)
                                }
                              />{" "}
                              Morning
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="halfDayPeriod"
                                value="Afternoon"
                                checked={halfDayPeriod === "Afternoon"}
                                onChange={(e) =>
                                  setHalfDayPeriod(e.target.value)
                                }
                              />{" "}
                              Afternoon
                            </label>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        if (!halfDayDate || !halfDayPeriod) return;
                        setCurrentEditedAssignement({
                          ...currentEditedAssignement,
                          dayDetails: [
                            ...currentEditedAssignement?.dayDetails,
                            { date: halfDayDate, period: halfDayPeriod },
                          ],
                        });
                        // Reset inputs
                        setHalfDayDate("");
                        setHalfDayPeriod("");
                      }}
                      sx={{ height: "36px" }}
                    >
                      + Add Half-Day
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        setCurrentEditedAssignement({
                          ...currentEditedAssignement,
                          dayDetails: [],
                        });
                        setHalfDayAssignments([]);
                      }}
                      sx={{ height: "36px" }}
                    >
                      RESET
                    </Button>
                  </Box>
                </Box>
                <Box mt={2} display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setShowAssignmentEditForm(false)}
                    sx={{
                      width: "130px",
                      fontSize: "10px",
                      px: 1,
                      borderColor: colors.redAccent[500],
                      backgroundColor: colors.primary,
                      color: colors.redAccent[500],
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() =>
                      handleDeleteAssignement(currentEditedAssignement?._id)
                    }
                    sx={{
                      width: "130px",
                      fontSize: "10px",
                      px: 1,
                      borderColor: "orange",
                      backgroundColor: colors.primary,
                      color: "orange",
                    }}
                  >
                    DELETE
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    type="submit"
                    sx={{
                      width: "130px",
                      fontSize: "10px",
                      px: 1,
                      borderColor: colors.grey[100],
                      backgroundColor: colors.primary,
                      color: colors.grey[100],
                    }}
                  >
                    SAVE
                  </Button>
                  {assignementLoading && <CircularProgress />}
                </Box>
              </Box>
            )}
          </Formik>
        )}
      </Paper>
      <RecommendationModal
        open={openRecommendationModal}
        onClose={() => setOpenRecommendationModal(false)}
        loading={loadingRecommendations}
        data={assignementRecommendation}
        onAssign={async (rec) => {
          console.log("🔄 Loading recommendation:", rec);
          setLoadingLoadRecommendations(rec?.task_id);
          setIsLoadingRecommendation(true);
          
          try {
            // Fermer la modal immédiatement
            setOpenRecommendationModal(false);
            
            // Trouver le projet dans les projets disponibles
            const currentProjects = selectedProjects.length > 0 ? selectedProjects : projects;
            const foundProject = currentProjects.find((p) => p._id === rec?.project_id);
            
            console.log("� Available projects:", currentProjects);
            console.log("🔍 Found project:", foundProject);
            
            if (!foundProject) {
              console.error("❌ Project not found:", rec?.project_id);
              console.error("❌ Available project IDs:", currentProjects.map(p => p._id));
              alert(`Projet non trouvé dans la liste des projets disponibles.\n\nProjet demandé: ${rec?.project_id}\nCe projet n'appartient probablement pas à votre équipe.\n\nLes recommandations ont été filtrées, mais celle-ci a échappé au filtre.`);
              return;
            }
            
            // Créer un objet tâche basé sur les données de recommandation
            const taskFromRecommendation = {
              _id: rec?.task_id,
              taskName: rec?.task || "Task from recommendation",
              project: foundProject,
              RequiredyearsOfExper: 0,
              projectPhase: "Unknown",
              startDate: rec?.dates?.start,
              endDate: rec?.dates?.end,
            };
            
            console.log("🎯 Task created from recommendation:", taskFromRecommendation);
            
            // Préparer les données du formulaire directement avec la structure exacte attendue
            const formData = {
              project: foundProject, // Utiliser l'objet projet complet pour l'Autocomplete
              task: taskFromRecommendation,
              startDate: rec?.dates?.start ? new Date(rec.dates.start).toISOString().split('T')[0] : "",
              endDate: rec?.dates?.end ? new Date(rec.dates.end).toISOString().split('T')[0] : "",
              exactDays: rec?.duration || 0
            };
            
            console.log("✅ Prepared form data:", formData);
            
            // Charger les tâches pour le projet et mettre à jour l'état local
            try {
              console.log("📋 Loading tasks for project:", rec?.project_id);
              const tasksResult = await dispatch(getTasksByProjectId(rec?.project_id));
              
              if (tasksResult.success) {
                console.log("✅ Tasks loaded successfully");
                // Mettre à jour selectedProject pour déclencher le chargement des tâches
                setSelectedProject(foundProject);
              } else {
                console.warn("⚠️ Failed to load tasks, using recommendation task data");
                // Si le chargement des tâches échoue, au moins ajouter la tâche de la recommandation
                setTasks([taskFromRecommendation]);
              }
            } catch (taskError) {
              console.warn("⚠️ Error loading tasks, using recommendation task data:", taskError);
              // En cas d'erreur, utiliser au moins les données de la recommandation
              setTasks([taskFromRecommendation]);
            }
            
            // Sauvegarder les données pour le formulaire
            console.log("💾 Setting recommendation form data:", formData);
            setRecommendationFormData(formData);
            
            // Attendre un moment pour s'assurer que l'état est mis à jour
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Vérifier si les données ont été sauvegardées
            console.log("🔍 Form data set, current state should be:", formData);
            
            // Réinitialiser et rouvrir le formulaire
            setShowAssignmentForm(false);
            await new Promise(resolve => setTimeout(resolve, 100));
            
            setFormKey(prev => prev + 1);
            setShowAssignmentForm(true);
            
            console.log("✅ Form opened with recommendation data");
            
          } catch (error) {
            console.error("❌ Error loading recommendation:", error);
            alert("Erreur lors du chargement de la recommandation: " + error.message);
          } finally {
            setLoadingLoadRecommendations(null);
            setIsLoadingRecommendation(false);
          }
        }}
      />
    </Box>
  );
};

export default EditStaffing;
