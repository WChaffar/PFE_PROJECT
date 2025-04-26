import { Box, Button, TextField, MenuItem, Checkbox, FormControlLabel } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Header from "../../components/Header";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import { useState } from "react";
import { tokens } from "../../theme";

const CreateTeamMemberForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDarkMode = theme.palette.mode === 'dark';
  const [selectedImageName, setSelectedImageName] = useState('');

  const handleFormSubmit = (values) => {
    console.log(values); 
  };

  const handleProfilePictureChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFieldValue("profilePicture", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box m="20px">
      <Header title="Add Team Member" subtitle="Create and define a new team member with all necessary details" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={teamMemberSchema}
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
              {/* Full Name */}
              <TextField
                fullWidth
                variant="filled"
                label="Full Name"
                name="fullName"
                value={values.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.fullName && !!errors.fullName}
                helperText={touched.fullName && errors.fullName}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Email */}
              <TextField
                fullWidth
                variant="filled"
                label="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Phone Number */}
              <Box sx={{ gridColumn: "span 2" }}>
                <PhoneInput
                  inputStyle={{
                    width: '100%',
                    height: '56px',
                    backgroundColor: isDarkMode ? '#424242' : '#f5f5f5',
                    color: isDarkMode ? '#fff' : '#000',
                    border: 'none',
                    borderBottom: '2px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                    paddingLeft: '50px'
                  }}
                  buttonStyle={{
                    backgroundColor: isDarkMode ? '#424242' : '#f5f5f5',
                    border: 'none',
                  }}
                  containerStyle={{ width: '100%' }}
                  country={'tn'}
                  value={values.phoneNumber}
                  onChange={(phone) => setFieldValue('phoneNumber', phone)}
                  onBlur={handleBlur}
                  inputProps={{
                    name: 'phoneNumber',
                    required: true,
                  }}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <div style={{ color: "red", fontSize: "12px" }}>{errors.phoneNumber}</div>
                )}
              </Box>

              {/* Profile Picture Upload */}
              <Box sx={{ gridColumn: "span 2" }}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{
                    backgroundColor: isDarkMode ? "#424242" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#000",
                    height: "56px",
                    justifyContent: "flex-start",
                    pl: "15px",
                    "&:hover": {
                      backgroundColor: isDarkMode ? "#333" : "#e0e0e0",
                    },
                  }}
                >
                  {selectedImageName || "Upload Profile Picture"}
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) => handleProfilePictureChange(e, setFieldValue)}
                  />
                </Button>
                {touched.profilePicture && errors.profilePicture && (
                  <div style={{ color: "red", fontSize: "12px" }}>{errors.profilePicture}</div>
                )}
              </Box>

              {/* Job Title */}
              <TextField
                fullWidth
                variant="filled"
                label="Job Title"
                name="jobTitle"
                value={values.jobTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.jobTitle && !!errors.jobTitle}
                helperText={touched.jobTitle && errors.jobTitle}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Employment Type */}
              <TextField
                select
                fullWidth
                variant="filled"
                label="Employment Type"
                name="employmentType"
                value={values.employmentType}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.employmentType && !!errors.employmentType}
                helperText={touched.employmentType && errors.employmentType}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value="Full-time">Full-time</MenuItem>
                <MenuItem value="Part-time">Part-time</MenuItem>
                <MenuItem value="Contract">Contract</MenuItem>
              </TextField>

              {/* Date of Joining */}
              <TextField
                fullWidth
                variant="filled"
                type="date"
                label="Date of Joining"
                InputLabelProps={{ shrink: true }}
                name="dateOfJoining"
                value={values.dateOfJoining}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.dateOfJoining && !!errors.dateOfJoining}
                helperText={touched.dateOfJoining && errors.dateOfJoining}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Seniority Level */}
              <TextField
                fullWidth
                variant="filled"
                label="Seniority Level"
                name="seniorityLevel"
                value={values.seniorityLevel}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.seniorityLevel && !!errors.seniorityLevel}
                helperText={touched.seniorityLevel && errors.seniorityLevel}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Remote Work Allowed */}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.remoteWorkAllowed}
                    onChange={handleChange}
                    name="remoteWorkAllowed"
                  />
                }
                label="Remote Work Allowed"
                sx={{ gridColumn: "span 2" }}
              />

              {/* Key Skills */}
              <TextField
                fullWidth
                variant="filled"
                label="Key Skills (comma separated)"
                name="keySkills"
                value={values.keySkills.join(", ")}
                onChange={(e) =>
                  setFieldValue('keySkills', e.target.value.split(",").map(skill => skill.trim()))
                }
                onBlur={handleBlur}
                error={!!touched.keySkills && !!errors.keySkills}
                helperText={touched.keySkills && errors.keySkills}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Certifications */}
              <TextField
                fullWidth
                variant="filled"
                label="Certifications (comma separated)"
                name="certifications"
                value={values.certifications.join(", ")}
                onChange={(e) =>
                  setFieldValue('certifications', e.target.value.split(",").map(cert => cert.trim()))
                }
                onBlur={handleBlur}
                error={!!touched.certifications && !!errors.certifications}
                helperText={touched.certifications && errors.certifications}
                sx={{ gridColumn: "span 2" }}
              />

              {/* Years of Experience */}
              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Years of Experience"
                name="yearsOfExperience"
                value={values.yearsOfExperience}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!touched.yearsOfExperience && !!errors.yearsOfExperience}
                helperText={touched.yearsOfExperience && errors.yearsOfExperience}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>

            {/* Submit Button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Team Member
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

// Validation schema
const teamMemberSchema = yup.object().shape({
  fullName: yup.string().required("Required"),
  email: yup.string().email("Invalid email address").required("Required"),
  phoneNumber: yup.string().required("Required"),
  jobTitle: yup.string().required("Required"),
  employmentType: yup.string().required("Required"),
  dateOfJoining: yup.date().required("Required"),
  seniorityLevel: yup.string().required("Required"),
  remoteWorkAllowed: yup.boolean(),
  keySkills: yup.array().of(yup.string().required("Required")).min(1, "At least one skill required"),
  certifications: yup.array().of(yup.string()).min(1, "At least one certification required"),
  yearsOfExperience: yup.number().required("Required").min(0, "Experience cannot be negative"),
  profilePicture: yup.string().nullable(),
});

// Initial values
const initialValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  profilePicture: "",
  jobTitle: "",
  employmentType: "",
  dateOfJoining: "",
  seniorityLevel: "",
  remoteWorkAllowed: false,
  keySkills: [],
  certifications: [],
  yearsOfExperience: 0,
};

export default CreateTeamMemberForm;
