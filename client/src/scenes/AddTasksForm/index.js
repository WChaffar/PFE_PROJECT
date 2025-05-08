import { Box, Button, TextField, MenuItem, Autocomplete } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Header from "../../components/Header";
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { getAllProjects } from "../../actions/projectAction";
import { createTask } from "../../actions/taskAction";
import { useNavigate } from "react-router-dom";

const CreateTaskForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDarkMode = theme.palette.mode === "dark";
  const selectedProjects = useSelector((state) => state.projects.projects);
  const [projects, setProjects] = useState([]);
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(null);
   const error = useSelector((state) => state.tasks.error);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedProjects.length !== 0) {
      const projectsMap = selectedProjects.map((project) => ({
        id: project._id,
        name: project.projectName,
      }));
      setProjects(projectsMap);
    }
  }, [selectedProjects]);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  const handleFormSubmit = async (values) => {
    console.log("Form Values on Submit:", values); // Debugging: Check if values are submitted correctly
    const result = await dispatch(createTask({...values, project: values.project.id}));
    if (result.success) {
      setSuccess("Task created with success.");
      setTimeout(() => {
        navigate("/tasks"); // ✅ Only navigate on success
      }, 1500);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="Add New Task"
        subtitle="Quickly create tasks for efficient project management"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={taskSchema}
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
              {/* Task Name */}
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

              {/* Description */}
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

              {/* Project */}
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
                  projects.find((p) => p.id === values.project?.id) || null
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

              {/* Project Phase */}
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
                <MenuItem value="Design">Design</MenuItem>
                <MenuItem value="Development">Development</MenuItem>
                <MenuItem value="Testing">Testing</MenuItem>
              </TextField>

              {/* Required Years of Experience */}
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
                  touched.RequiredyearsOfExper &&
                  errors.RequiredyearsOfExper
                }
                sx={{ gridColumn: "span 2" }}
              />

              {/* Start Date */}
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

              {/* End Date */}
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

              {/* Required Skills */}
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

              {/* Languages Spoken */}
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

              {/* Certifications */}
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

            {/* Submit Button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button
                type="submit"
                sx={{
                  backgroundColor: colors.grey[100],
                  color: colors.grey[900],
                }}
              >
                Create Task
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
    .oneOf(["Design", "Development", "Testing"])
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
});

// Initial values
const initialValues = {
  taskName: "",
  description: "",
  project: {}, // Corrected from [] to {}
  projectPhase: "",
  RequiredyearsOfExper: 0,
  startDate: "",
  endDate: "",
  requiredSkills: [],
  languagesSpoken: [],
  requiredCertifications: [],
};

export default CreateTaskForm;
