import { Box, Button, TextField, MenuItem, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import {
  createProject,
  reset,
  resetProjectState,
} from "../../actions/projectAction";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const CreateProjectForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector((state) => state.projects.error);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    dispatch(resetProjectState());
  }, [dispatch]);

  const handleFormSubmit = async (values) => {
    const result = await dispatch(createProject(values));
    if (result.success) {
      setSuccess("Project created with success.");
      setTimeout(() => {
        navigate("/projects"); // ✅ Only navigate on success
      }, 1500);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="Add project"
        subtitle="Create and define a new project with all necessary details"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={projectSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
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
                label="Project Name"
                name="projectName"
                value={values.projectName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.projectName && !!errors.projectName}
                helperText={touched.projectName && errors.projectName}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                label="Client"
                name="client"
                value={values.client}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.client && !!errors.client}
                helperText={touched.client && errors.client}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                sx={{ gridColumn: "span 4" }}
                multiline
                rows={4}
              />
              <TextField
                select
                fullWidth
                variant="filled"
                label="Project Type"
                name="projectType"
                value={values.projectType}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.projectType && !!errors.projectType}
                helperText={touched.projectType && errors.projectType}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value="internal">Internal</MenuItem>
                <MenuItem value="external">External</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                variant="filled"
                label="Project Category"
                name="projectCategory"
                value={values.projectCategory}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.projectCategory && !!errors.projectCategory}
                helperText={touched.projectCategory && errors.projectCategory}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value="Web Development">Web Development</MenuItem>
                <MenuItem value="Mobile App">Mobile App</MenuItem>
                <MenuItem value="Software">Software</MenuItem>
                <MenuItem value="Database">Database</MenuItem>
                <MenuItem value="Design">Design</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                variant="filled"
                label="Project Priority"
                name="projectPriority"
                value={values.projectPriority}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.projectPriority && !!errors.projectPriority}
                helperText={touched.projectPriority && errors.projectPriority}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
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
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                name="startDate"
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
                InputLabelProps={{ shrink: true }}
                name="endDate"
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
                type="date"
                label="Delivery Date"
                InputLabelProps={{ shrink: true }}
                name="deliveryDate"
                value={values.deliveryDate}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.deliveryDate && !!errors.deliveryDate}
                helperText={touched.deliveryDate && errors.deliveryDate}
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
                Create New Project
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

const projectSchema = yup.object().shape({
  projectName: yup.string().required("Required"),
  description: yup.string().required("Required"),
  client: yup.string().required("Required"),
  projectType: yup.string().required("Required"),
  projectCategory: yup.string().required("Required"),
  projectPriority: yup.string().required("Required"),
  budget: yup.number().required("Required").positive("Must be positive"),
  startDate: yup.date().required("Required"),
  endDate: yup.date().required("Required"),
  deliveryDate: yup.date().required("Required"),
});

const initialValues = {
  projectName: "",
  description: "",
  client: "",
  projectType: "",
  projectCategory: "",
  projectPriority: "",
  budget: "",
  startDate: "",
  endDate: "",
  deliveryDate: "",
  additionalFunding: 0,
};

export default CreateProjectForm;
