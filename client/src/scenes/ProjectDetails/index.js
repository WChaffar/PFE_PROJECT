import { Box, CircularProgress, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOneProject } from "../../actions/projectAction";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
 
const ProjectDetails = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const selectedProject = useSelector((state) => state.projects.activeProject);
  const [project, setProject] = useState({});
  const dispatch = useDispatch();
  const { id } = useParams();
  const error = useSelector((state) => state.projects.error);

  useEffect(() => {
    if (Object.keys(selectedProject).length > 0) {
      setProject({
        ...selectedProject,
        startDate: format(selectedProject.startDate, "yyyy-MM-dd"),
        endDate: format(selectedProject.endDate, "yyyy-MM-dd"),
        deliveryDate: format(selectedProject.deliveryDate, "yyyy-MM-dd"),
      });
    }
  }, [selectedProject]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getOneProject(id));
  }, [dispatch]); // <== Appelle une seule fois le fetch


  if ((Object.keys(project).length < 1 || !project.projectName) && !error) {
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

  if (error && Object.keys(project).length < 1) {
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

  return (
    <Box m="20px">
      <Header
        title="Project Details"
        subtitle="Explore project specific information"
      />

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
