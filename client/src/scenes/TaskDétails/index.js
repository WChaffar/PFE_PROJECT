import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, useTheme, CircularProgress } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { getTaskById } from "../../actions/taskAction";


const TaskDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

    const selectedTask = useSelector((state) => state.tasks.activeTask);
    const [task, setTask] = useState({});
    const dispatch = useDispatch();
    const { id } = useParams();
    const error = useSelector((state) => state.projects.error);

  
  useEffect(() => {
    if (Object.keys(selectedTask).length > 0) {
      setTask(selectedTask);
    }
  }, [selectedTask]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getTaskById(id));
  }, [dispatch]); // <== Appelle une seule fois le fetch


  if (!task || !task.project) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && !task) {
    return (
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
    );
  }

  // Optional date formatter for better UX
  const formatDate = (dateStr) =>
    new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr));

  return (
    <Box m="20px">
      <Header title="Task Details" subtitle="Explore task-specific information" />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Task Overview
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography><strong>Task Name:</strong> {task.taskName}</Typography>
          <Typography><strong>Description:</strong> {task.description}</Typography>
          <Typography><strong>Project:</strong> {task.project?.projectName || task.project}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Requirements
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography><strong>Project Phase:</strong> {task.projectPhase}</Typography>
          <Typography><strong>Required Experience:</strong> {task.RequiredyearsOfExper} years</Typography>
          <Typography><strong>Start Date:</strong> {formatDate(task.startDate)}</Typography>
          <Typography><strong>End Date:</strong> {formatDate(task.endDate)}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Skills and Certifications
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography><strong>Required Skills:</strong> {task.requiredSkills.join(", ")}</Typography>
          <Typography><strong>Languages Spoken:</strong> {task.languagesSpoken.join(", ")}</Typography>
          <Typography><strong>Certifications:</strong> {task.requiredCertifications.join(", ")}</Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default TaskDetails;
