import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, useTheme } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Header from "../../components/Header";
import { tokens } from "../../theme";


const TaskDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const task = {
    taskName: "Design Login Page",
    description: "Create wireframes and final UI for the login screen.",
    project: { projectName: "HR Management System" },
    owner: { fullName: "Jane Doe" },
    prjectPhase: "Design",
    RequiredyearsOfExper: 3,
    startDate: "2025-05-10",
    endDate: "2025-06-01",
    requiredSkills: ["Figma", "Adobe XD"],
    langaugesSpoken: ["English", "French"],
    requiredCertifications: ["UX Design Certification"]
  };
  

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
          <Typography><strong>Owner:</strong> {task.owner?.fullName || task.owner}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Requirements
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography><strong>Project Phase:</strong> {task.prjectPhase}</Typography>
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
          <Typography><strong>Languages Spoken:</strong> {task.langaugesSpoken.join(", ")}</Typography>
          <Typography><strong>Certifications:</strong> {task.requiredCertifications.join(", ")}</Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default TaskDetails;
