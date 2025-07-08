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
import { useEffect, useState } from "react";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createAbsence, resetAbsenceState } from "../../actions/absenceAction";

const AddAbsence = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDarkMode = theme.palette.mode === "dark";
  const dispatch = useDispatch();
  const [success, setSuccess] = useState(null);
  const error = useSelector((state) => state.absence.error);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(resetAbsenceState());
  }, [dispatch])
  

  const handleFormSubmit = async (values) => {
    console.log("Form Values on Submit:", values); // Debugging: Check if values are submitted correctly

    const result = await dispatch(createAbsence(values));
    if (result.success) {
      setSuccess("Absence created with success.");
      setTimeout(() => {
        navigate("/my-absences"); // ✅ Only navigate on success
      }, 1500);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="Add New absence"
        subtitle="Create your absence records here."
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={absenceSchema}
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
              {/* Absence type */}
              <TextField
                select
                fullWidth
                variant="filled"
                label="Absence type"
                name="type"
                value={values.type}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.type && !!errors.type}
                helperText={touched.type && errors.type}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value="Paid leave">Paid leave</MenuItem>
                <MenuItem value="unpaid leave">unpaid leave</MenuItem>
                <MenuItem value="Alternating training days">
                  Alternating training days
                </MenuItem>
              </TextField>
              {/* Start date and end date */}
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
                Create your absence
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
const absenceSchema = yup.object().shape({
  type: yup.string().required("Required"),
  startDate: yup.date().required("Required"),
  endDate: yup.date().required("Required"),
});

// Initial values
const initialValues = {
  type:"",
  startDate: "",
  endDate: "",
};

export default AddAbsence;
