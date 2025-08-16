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

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const user = useSelector((store) => store.auth.user);
  const selectedTasks = useSelector((state) => state.tasks.tasks);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const dispatch = useDispatch();
  const [projectWorkload, setProjectWorkload] = useState([]);

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
      setProjectWorkload(projectWorkloadData);
      setTasksLoading(false);
    }
  }, [selectedTasks]);

  useEffect(() => {
    setTasksLoading(true);
    dispatch(getTasksByManagerId());
  }, [dispatch]);

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
            title="+8"
            subtitle="Active Projects"
            progress="0.75"
            increase="14%"
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
            title="+33"
            subtitle="Completed Projects"
            progress="0.76"
            increase="86%"
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
            title="+40"
            subtitle="Team members"
            increase="80% assigned"
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
            title="123"
            subtitle="Tasks created"
            progress="0.80"
            increase="80% completed"
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
          {projectNotifications.map((notification, i) => (
            <Box
              key={`${notification.notifId}-${i}`}
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
                  {notification.title}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {notification.message}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>{notification.date}</Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
              >
                {notification.type === "deadline_overdue" && (
                  <Typography variant="body2" color={colors.grey[100]}>
                    Overdue by {notification.daysOverdue} days
                  </Typography>
                )}
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
            {/* <TeamMembersEvolLineChart isDashboard={true} /> */}
          </Box>
        </Box>
        {/* Project Risks */}
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
              Project Risks
            </Typography>
          </Box>

          {projectRisks.map((risk, i) => (
            <Box
              key={`${risk.riskId}-${i}`}
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
                  {risk.title}
                </Typography>
                <Typography color={colors.grey[1]}>
                  {risk.description}
                </Typography>
                <Typography color={colors.grey[2]} fontSize="12px">
                  Identified on: {risk.dateIdentified}
                </Typography>
              </Box>

              <Box textAlign="right">
                <Typography color={colors.greenAccent[500]} fontWeight="500">
                  Impact: {risk.impact}
                </Typography>
                <Box
                  mt="5px"
                  backgroundColor={
                    risk.status === "Open"
                      ? colors.greenAccent[500]
                      : risk.status === "Mitigated"
                      ? colors.greenAccent[2]
                      : colors.greenAccent[2]
                  }
                  p="5px 10px"
                  borderRadius="4px"
                >
                  <Typography variant="body2" color={colors.grey[0]}>
                    {risk.status}
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
