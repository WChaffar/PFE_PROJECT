import {
  Box,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getAllProjects } from "../../actions/projectAction";
import { editTask, getTaskById } from "../../actions/taskAction";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";

const EditTaskForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const selectedProjects = useSelector((state) => state.projects.projects);
  const [projects, setProjects] = useState([]);
  const selectedTask = useSelector((state) => state.tasks.activeTask);
  const [task, setTask] = useState({});
  const { id } = useParams();
  const error = useSelector((state) => state.tasks.error);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProjects.length !== 0) {
      const projectsMap = selectedProjects.map((project) => ({
        _id: project._id,
        name: project.projectName,
      }));
      setProjects(projectsMap);
    }
  }, [selectedProjects]);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  const handleFormSubmit = async (values) => {
    values.project = values.project._id;
    console.log("Updated Task:", values);
    const result = await dispatch(editTask(values._id, values));
    if (result.success) {
      setSuccess("Task edited with success.");
      setTimeout(() => {
        navigate("/tasks"); // ✅ Only navigate on success
      }, 1500);
    }
    // You would call your updateTask API or function here
  };

  useEffect(() => {
    if (Object.keys(selectedTask).length > 0) {
      setTask(selectedTask);
    }
  }, [selectedTask]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getTaskById(id));
  }, [dispatch, id]); // <== Appelle une seule fois le fetch

  const initialValues = {
    _id: task?._id || "",
    taskName: task?.taskName || "",
    description: task?.description || "",
    project: task?.project || "",
    projectPhase: task?.projectPhase || "",
    RequiredyearsOfExper: task?.RequiredyearsOfExper || 0,
    startDate: (task?.startDate && format(task?.startDate, "yyyy-MM-dd")) || "",
    endDate: (task?.endDate && format(task?.endDate, "yyyy-MM-dd")) || "",
    requiredSkills: task?.requiredSkills || [],
    languagesSpoken: task?.languagesSpoken || [],
    requiredCertifications: task?.requiredCertifications || [],
    budget: task?.budget || 0,
  };

  if ((Object.keys(task).length < 1 || !task.project) && !error) {
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

  if (error && !Object.keys(task).length < 1) {
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
      <Header title="Edit Task" subtitle="Update task details as needed" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={taskSchema}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
              }}
            >
              <TextField
                fullWidth
                variant="filled"
                label="Task Name"
                name="taskName"
                value={values.taskName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.taskName && !!errors.taskName}
                helperText={touched.taskName && errors.taskName}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                variant="filled"
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                sx={{ gridColumn: "span 4" }}
              />

              <Autocomplete
                fullWidth
                options={projects}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option?.name || ""
                }
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                value={
                  projects.find((p) => p._id === values.project?._id) || null
                }
                onChange={(event, newValue) => {
                  setFieldValue("project", newValue); // Directly update the 'project' field with the object
                }}
                onBlur={handleBlur}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Project"
                    name="project"
                    variant="filled"
                    error={!!touched.project && !!errors.project}
                    helperText={touched.project && errors.project}
                  />
                )}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                select
                fullWidth
                variant="filled"
                label="Project Phase"
                name="projectPhase"
                value={values.projectPhase}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.projectPhase && !!errors.projectPhase}
                helperText={touched.projectPhase && errors.projectPhase}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value="Planning">Planning</MenuItem>
                <MenuItem value="Design">Design</MenuItem>
                <MenuItem value="Development">Development</MenuItem>
                <MenuItem value="Testing">Testing</MenuItem>
              </TextField>

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Years of Experience"
                name="RequiredyearsOfExper"
                value={values.RequiredyearsOfExper}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  !!touched.RequiredyearsOfExper &&
                  !!errors.RequiredyearsOfExper
                }
                helperText={
                  touched.RequiredyearsOfExper && errors.RequiredyearsOfExper
                }
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Start Date"
                name="startDate"
                InputLabelProps={{ shrink: true }}
                value={values.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.startDate && !!errors.startDate}
                helperText={touched.startDate && errors.startDate}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="End Date"
                name="endDate"
                InputLabelProps={{ shrink: true }}
                value={values.endDate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.endDate && !!errors.endDate}
                helperText={touched.endDate && errors.endDate}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Budget"
                name="budget"
                value={values.budget}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.budget && !!errors.budget}
                helperText={touched.budget && errors.budget}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                label="Required Skills (comma separated)"
                name="requiredSkills"
                value={values.requiredSkills.join(", ")}
                onChange={(e) =>
                  setFieldValue(
                    "requiredSkills",
                    e.target.value.split(",").map((s) => s.trim())
                  )
                }
                onBlur={handleBlur}
                error={!!touched.requiredSkills && !!errors.requiredSkills}
                helperText={touched.requiredSkills && errors.requiredSkills}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                label="Languages Spoken (comma separated)"
                name="languagesSpoken"
                value={values.languagesSpoken.join(", ")}
                onChange={(e) =>
                  setFieldValue(
                    "languagesSpoken",
                    e.target.value.split(",").map((l) => l.trim())
                  )
                }
                onBlur={handleBlur}
                error={!!touched.languagesSpoken && !!errors.languagesSpoken}
                helperText={touched.languagesSpoken && errors.languagesSpoken}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                label="Required Certifications (comma separated)"
                name="requiredCertifications"
                value={values.requiredCertifications.join(", ")}
                onChange={(e) =>
                  setFieldValue(
                    "requiredCertifications",
                    e.target.value.split(",").map((c) => c.trim())
                  )
                }
                onBlur={handleBlur}
                error={
                  !!touched.requiredCertifications &&
                  !!errors.requiredCertifications
                }
                helperText={
                  touched.requiredCertifications &&
                  errors.requiredCertifications
                }
                sx={{ gridColumn: "span 2" }}
              />
            </Box>

            <Box display="flex" justifyContent="end" mt="20px">
              <Button
                type="submit"
                sx={{
                  backgroundColor: colors.grey[100],
                  color: colors.grey[900],
                }}
              >
                Save Changes
              </Button>
            </Box>
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
          </form>
        )}
      </Formik>
    </Box>
  );
};

// Validation schema
const taskSchema = yup.object().shape({
  taskName: yup.string().required("Required"),
  description: yup.string().required("Required"),
  project: yup.object().required("Required"), // project is an object now
  projectPhase: yup
    .string()
    .oneOf(["Planning","Design", "Development", "Testing"])
    .required("Required"),
  RequiredyearsOfExper: yup
    .number()
    .min(0, "Experience must be a non-negative number")
    .required("Required"),
  startDate: yup.date().required("Required"),
  endDate: yup
    .date()
    .min(yup.ref("startDate"), "End date cannot be before start date")
    .required("Required"),
  requiredSkills: yup
    .array()
    .of(yup.string().required("Skill cannot be empty"))
    .min(1, "At least one skill is required"),
  languagesSpoken: yup
    .array()
    .of(yup.string().required("Language cannot be empty"))
    .min(1, "At least one language is required"),
  requiredCertifications: yup
    .array()
    .of(yup.string().required("Certification cannot be empty"))
    .min(1, "At least one certification is required"),
  budget: yup
    .number()
    .required("Required")
    .positive("Must be positive")
    .min(1, "Budget must be greater than zero."),
});

export default EditTaskForm;
