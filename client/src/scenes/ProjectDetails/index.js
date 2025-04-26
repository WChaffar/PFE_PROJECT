import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const ProjectDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Fake project data (later you will fetch this from backend)
  const project = {
    projectName: "HR Management System",
    description: "A web application to manage all HR activities like recruitment, payroll, employee management, etc.",
    client: "TechCorp Ltd.",
    projectType: "External",
    projectCategory: "Web Development",
    projectPriority: "High",
    budget: 50000,
    startDate: "2025-05-01",
    endDate: "2025-12-01",
    deliveryDate: "2025-11-25"
  };

  return (
    <Box m="20px">
      <Header title="Project Details" subtitle="Explore project specific information" />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Project Name
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{project.projectName}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Description
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{project.description}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Client
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{project.client}</Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography color={colors.greenAccent[500]} variant="h5">
            Project Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            <strong>Type:</strong> {project.projectType} <br />
            <strong>Category:</strong> {project.projectCategory} <br />
            <strong>Priority:</strong> {project.projectPriority} <br />
            <strong>Budget:</strong> ${project.budget.toLocaleString()} <br />
            <strong>Start Date:</strong> {project.startDate} <br />
            <strong>End Date:</strong> {project.endDate} <br />
            <strong>Delivery Date:</strong> {project.deliveryDate}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ProjectDetails;
