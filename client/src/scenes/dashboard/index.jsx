import { Box, Button, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { projectNotifications } from "../../data/NotificationsData"; // Replace with the new notification data
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FolderSpecialIcon from "@mui/icons-material/FolderSpecial";
import RuleFolderIcon from "@mui/icons-material/RuleFolder";
import AddTaskIcon from "@mui/icons-material/AddTask";
import Header from "../../components/Header";
import ProjectBarChart from "../../components/ProjectBarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import GeographyChart from "../../components/GeographyChart";
import { useDispatch, useSelector } from "react-redux";
import TeamMembersEvolLineChart from "../../components/TeamMembersEvolLineChart";
import { projectRisks, projectRiskcolors } from "../../data/ProjectRisksData";
import { useEffect, useState } from "react";
import { getTasksByManagerId } from "../../actions/taskAction";
import { getAllTeamMembersForManager } from "../../actions/teamAction";
import { getAllEmployeeAssignements } from "../../actions/assignementsAction";
import {
  addMonths,
  endOfQuarter,
  format,
  startOfQuarter,
  startOfYear,
} from "date-fns";
import { getAllNotifications } from "../../actions/notificationsAction";
import { getRisks } from "../../actions/riskActions";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const user = useSelector((store) => store.auth.user);
  const selectedTasks = useSelector((state) => state.tasks.tasks);
  const selectedNotifications = useSelector(
    (state) => state.notifications.notifications
  );
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const dispatch = useDispatch();
  const [projectWorkload, setProjectWorkload] = useState([]);
  const [activeProjectsCount, setActiveProjectsCount] = useState(null);
  const [completedProjectsCount, setCompletedProjectsCount] = useState(null);
  const [completedTasksCount, setCompletedTasksCount] = useState(null);
  const [totalProjectsCount, setTotalProjectsCount] = useState(null);
  const [assignedMembersCount, setAssignedMembersCount] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const selectedTeamMembers = useSelector((state) => state.team.team);
  const selectedRisks = useSelector((state) => state.risks.risks);
  const [assignments, setAssignements] = useState([]);
  const [risks, setRisks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const selectedAssignements = useSelector(
    (state) => state.assignements.assignements
  );

  useEffect(() => {
    if (selectedTasks?.length !== 0) {
      // project progress calculation
      const projectProgressMap = {};

      selectedTasks.forEach((task) => {
        const projectId = task.project._id;
        if (!projectProgressMap[projectId]) {
          projectProgressMap[projectId] = {
            totalWorkload: 0,
            taskCount: 0,
            projectName: task.project?.projectName || "Unnamed Project", // si c'est un objet
          };
        }

        projectProgressMap[projectId].totalWorkload += task.workload;
        projectProgressMap[projectId].taskCount += 1;
      });

      // Convertir en tableau [{ project: "Alpha", progress: 70 }, ...]
      const projectWorkloadData = Object.values(projectProgressMap).map(
        (entry) => ({
          project: entry.projectName,
          progress: Math.round(entry.totalWorkload / entry.taskCount),
        })
      );
      const activeProjects = projectWorkloadData?.filter(
        (p) => p.progress < 100
      );
      const completedProjects = projectWorkloadData?.filter(
        (p) => p.progress === 100
      );
      const countCompletedTasks = selectedTasks?.filter(
        (t) => t.workload === 100
      )?.length;
      setActiveProjectsCount(activeProjects?.length);
      setCompletedProjectsCount(completedProjects?.length);
      setTotalProjectsCount(projectWorkloadData?.length);
      setProjectWorkload(projectWorkloadData);
      setTasksLoading(false);
      setCompletedTasksCount(countCompletedTasks);
    }
  }, [selectedTasks]);

  useEffect(() => {
    setTasksLoading(true);
    dispatch(getTasksByManagerId());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllTeamMembersForManager());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    dispatch(getAllNotifications());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    if (selectedNotifications.length !== 0) {
      setNotifications(selectedNotifications);
    }
  }, [selectedNotifications]);

  useEffect(() => {
    if (selectedTeamMembers.length !== 0) {
      setTeamMembers(selectedTeamMembers);
    }
  }, [selectedTeamMembers]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    if (selectedAssignements.length !== 0) {
      setAssignements(selectedAssignements);
    }
  }, [selectedAssignements]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    if (selectedTeamMembers.length !== 0 && selectedAssignements.length !== 0) {
      const count = selectedTeamMembers.filter((t) =>
        selectedAssignements.some((a) => a.employee._id === t._id)
      ).length;
      setAssignedMembersCount(count);
    } else {
      setAssignedMembersCount(0);
    }
  }, [selectedTeamMembers, selectedAssignements]);

  useEffect(() => {
    dispatch(getAllEmployeeAssignements());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    dispatch(getRisks());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    if (selectedRisks.length !== 0 && selectedRisks.length !== 0) {
      setRisks(selectedRisks);
    }
  }, [selectedRisks]); // <== Appelle une seule fois le fetch

  // Générer les trimestres de l'année en cours
  function generateQuarters(year = new Date().getFullYear()) {
    const quarters = [];
    for (let i = 0; i < 12; i += 3) {
      const date = addMonths(startOfYear(new Date(year, 0, 1)), i);
      quarters.push(date); // garder Date
    }
    return quarters;
  }

  function generateQuarters(rangeInYears = 2) {
    const periods = [];
    const currentYear = new Date().getFullYear();

    // from (currentYear - rangeInYears) to (currentYear + rangeInYears)
    const startYear = currentYear - rangeInYears;
    const endYear = currentYear + rangeInYears;

    for (let year = startYear; year <= endYear; year++) {
      for (let q = 0; q < 4; q++) {
        const date = new Date(year, q * 3, 1); // Jan, Apr, Jul, Oct
        periods.push(date);
      }
    }
    return periods;
  }

  function buildTeamCompositionByJobTitle(selectedTeamMembers) {
    const colors = [
      "hsl(211, 70%, 50%)",
      "hsl(32, 90%, 55%)",
      "hsl(145, 63%, 45%)",
      "hsl(270, 60%, 60%)",
      "hsl(0, 80%, 60%)",
    ];

    if (selectedTeamMembers.length === 0) return [];

    // 1. Generate quarters for the current year
    const periods = generateQuarters(2);

    // 2. Get unique job titles
    const jobTitles = [
      ...new Set(selectedTeamMembers.map((m) => m.jobTitle).filter(Boolean)),
    ];

    // 3. Build the data series
    const result = jobTitles.map((title, i) => ({
      id: title,
      color: colors[i % colors.length],
      data: periods.map((period) => {
        const quarterStart = startOfQuarter(period);
        const quarterEnd = endOfQuarter(period);

        // Count unique employees with this job title active during this quarter
        const employeesInQuarter = new Set(
          selectedTeamMembers
            .filter(
              (member) =>
                member.jobTitle === title &&
                member.dateOfJoining &&
                new Date(member.dateOfJoining) <= quarterEnd // joined before quarter ends
            )
            .map((member) => member._id)
        );

        return {
          x: format(quarterStart, "MMM yyyy"),
          y: employeesInQuarter.size,
        };
      }),
    }));

    return result;
  }

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header
          title="Dashboard Overview"
          subtitle={`Welcome back, ${
            user?.firstname || "User"
          } ! Here’s what’s happening today.`}
        />
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button>
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={activeProjectsCount}
            subtitle="Active Projects"
            progress={(activeProjectsCount / totalProjectsCount).toFixed(2)}
            increase={`${(
              (activeProjectsCount / totalProjectsCount) *
              100
            ).toFixed(2)}%`}
            icon={
              <FolderSpecialIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={completedProjectsCount}
            subtitle="Completed Projects"
            progress={(completedProjectsCount / totalProjectsCount).toFixed(2)}
            increase={
              ((completedProjectsCount / totalProjectsCount) * 100).toFixed(2) +
              "%"
            }
            icon={
              <RuleFolderIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={selectedTeamMembers?.length}
            subtitle="Team members"
            increase={
              (
                (assignedMembersCount / selectedTeamMembers?.length) *
                100
              ).toFixed(2) + "% assigned"
            }
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            subtitle="Tasks"
            progress={(completedTasksCount / selectedTasks?.length).toFixed(2)}
            increase={
              ((completedTasksCount / selectedTasks?.length) * 100).toFixed(2) +
              " % completed"
            }
            icon={
              <AddTaskIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "2px 2px 0 30px" }}
          >
            Project Progress Overview
          </Typography>
          <Box height="250px" mt="-40px">
            <ProjectBarChart
              isDashboard={true}
              projectWorkload={projectWorkload?.filter((p) => p.progress < 100)}
            />
          </Box>
        </Box>
        {/* Notifications */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Notifications
            </Typography>
          </Box>
          {[...notifications]
            .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
            .map((notification, i) => (
              <Box
                key={`${notification._id}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box>
                  <Typography
                    color={colors.greenAccent[500]}
                    variant="h5"
                    fontWeight="600"
                  >
                    {notification.type}
                  </Typography>
                  <Typography color={colors.grey[100]}>
                    {notification.message}
                  </Typography>
                </Box>

                <Box color={colors.grey[100]}>
                  {new Date(notification.dateTime).toLocaleString()}
                </Box>
              </Box>
            ))}
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <IconButton>
                <DownloadOutlinedIcon
                  sx={{ fontSize: "26px", color: colors.greenAccent[500] }}
                />
              </IconButton>
            </Box>
          </Box>
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "2px 2px 0 30px" }}
          >
            Team Composition Growth Over Time
          </Typography>
          <Box height="250px" mt="-40px">
            <TeamMembersEvolLineChart
              isDashboard={true}
              data={buildTeamCompositionByJobTitle(selectedTeamMembers)}
            />
          </Box>
        </Box>
        {/* Projects Risks */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Projects Risks
            </Typography>
          </Box>

          {[...risks]
            .sort((a, b) => new Date(b.identificationDate) - new Date(a.identificationDate))
            .map((risk, i) => (
              <Box
                key={`${risk._id}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box>
                  <Typography
                    color={colors.greenAccent[500]}
                    variant="h5"
                    fontWeight="600"
                  >
                    {risk.name}
                  </Typography>
                  <Typography color={colors.grey[100]}>
                    {risk.description}
                  </Typography>
                  <Typography color={colors.grey[200]} fontSize="12px">
                    Identified on:{" "}
                    {new Date(risk.identificationDate).toLocaleString()}
                  </Typography>
                </Box>

                <Box textAlign="right">
                  <Typography color={colors.greenAccent[500]} fontWeight="500">
                    Severity: {risk.severity}
                  </Typography>
                  <Box
                    mt="5px"
                    backgroundColor={
                      risk.severity === "High"
                        ? colors.redAccent[500]
                        : risk.severity === "Medium"
                        ? colors.yellowAccent[500]
                        : colors.greenAccent[500]
                    }
                    p="5px 10px"
                    borderRadius="4px"
                  >
                    <Typography variant="body2" color={colors.grey[0]}>
                      {risk.severity}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ))}
        </Box>

        {/*------------------------------*/}
      </Box>
    </Box>
  );
};

export default Dashboard;
