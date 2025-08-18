import {
  Box,
  Button,
  TextField,
  MenuItem,
  Autocomplete,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
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
import { BuResetState, createBU } from "../../actions/businessUnitAction";

const CreateBUForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDarkMode = theme.palette.mode === "dark";
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(null);
  const error = useSelector((state) => state.businessUnit.error);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(BuResetState());
  }, [dispatch])
  

  const handleFormSubmit = async (values) => {
    console.log("Form Values on Submit:", values); // Debugging: Check if values are submitted correctly

    const result = await dispatch(
      createBU(values)
    );
    if (result.success) {
      setSuccess("Business unit created with success.");
      setTimeout(() => {
        navigate("/add-review-bu"); // ✅ Only navigate on success
      }, 1500);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="Add New Business Unit"
        subtitle="Create a new business unit to expand your organizational structure."
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={businessUnitSchema}
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
              {/* Task Unit Name */}
              <TextField
                fullWidth
                variant="filled"
                label="Business Unit Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                sx={{ gridColumn: "span 2" }}
              />
              {/* Task Unit Code */}
              <TextField
                fullWidth
                variant="filled"
                label="Business Unit Code"
                name="code"
                value={values.code}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.code && !!errors.code}
                helperText={touched.code && errors.code}
                sx={{ gridColumn: "span 2" }}
              />
              {/* Task Unit description */}
              <TextField
                fullWidth
                variant="filled"
                label="Business Unit Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.description && !!errors.description}
                helperText={touched.description && errors.description}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            {/* Remote Work Allowed */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.isActive}
                  onChange={handleChange}
                  name="isActive"
                />
              }
              label="Is active"
              sx={{ gridColumn: "span 2" }}
            />

            {/* Submit Button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button
                type="submit"
                sx={{
                  backgroundColor: colors.grey[100],
                  color: colors.grey[900],
                }}
              >
                Create Business Unit
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
const businessUnitSchema = yup.object().shape({
  name: yup.string().required("Required"),
  code: yup.string().required("Required"),
  description: yup.string().required("Required"),
});

// Initial values
const initialValues = {
  name: "",
  code: "",
  description: "",
  isActive: false,
};

export default CreateBUForm;
