import {
    Box,
    Button,
    TextField,
    MenuItem,
  } from "@mui/material";
  import { Formik } from "formik";
  import * as yup from "yup";
  import useMediaQuery from "@mui/material/useMediaQuery";
  import { useTheme } from "@mui/material/styles";
  import Header from "../../components/Header";
  import { useState } from "react";
  import { tokens } from "../../theme";
  
  const CreateTaskForm = () => {
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const isDarkMode = theme.palette.mode === "dark";
  
    const handleFormSubmit = (values) => {
      console.log(values);
    };
  
    return (
      <Box m="20px">
        <Header title="Add New Task" subtitle="Quickly create tasks for efficient project management" />
  
        <Formik
          onSubmit={handleFormSubmit}
          initialValues={initialValues}
          validationSchema={taskSchema}
        >
          {({ values, errors, touched, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
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
  
                {/* Project ID */}
                <TextField
                  fullWidth
                  variant="filled"
                  label="Project ID"
                  name="project"
                  value={values.project}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.project && !!errors.project}
                  helperText={touched.project && errors.project}
                  sx={{ gridColumn: "span 2" }}
                />
  
                {/* Owner ID */}
                <TextField
                  fullWidth
                  variant="filled"
                  label="Owner (User ID)"
                  name="owner"
                  value={values.owner}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.owner && !!errors.owner}
                  helperText={touched.owner && errors.owner}
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
                  name="requiredYearsOfExperience"
                  value={values.requiredYearsOfExperience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.requiredYearsOfExperience && !!errors.requiredYearsOfExperience}
                  helperText={touched.requiredYearsOfExperience && errors.requiredYearsOfExperience}
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
                    setFieldValue("requiredSkills", e.target.value.split(",").map(s => s.trim()))
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
                    setFieldValue("languagesSpoken", e.target.value.split(",").map(l => l.trim()))
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
                    setFieldValue("requiredCertifications", e.target.value.split(",").map(c => c.trim()))
                  }
                  onBlur={handleBlur}
                  error={!!touched.requiredCertifications && !!errors.requiredCertifications}
                  helperText={touched.requiredCertifications && errors.requiredCertifications}
                  sx={{ gridColumn: "span 2" }}
                />
              </Box>
  
              {/* Submit Button */}
              <Box display="flex" justifyContent="end" mt="20px">
                <Button type="submit" color="secondary" variant="contained">
                  Create Task
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    );
  };
  
  // Validation schema
  const taskSchema = yup.object().shape({
    owner: yup.string().required("Required"),
    taskName: yup.string().required("Required"),
    description: yup.string().required("Required"),
    project: yup.string().required("Required"),
    projectPhase: yup
      .string()
      .oneOf(["Design", "Development", "Testing"])
      .required("Required"),
    requiredYearsOfExperience: yup
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
    owner: "",
    taskName: "",
    description: "",
    project: "",
    projectPhase: "",
    requiredYearsOfExperience: 0,
    startDate: "",
    endDate: "",
    requiredSkills: [],
    languagesSpoken: [],
    requiredCertifications: [],
  };
  
  export default CreateTaskForm;
  