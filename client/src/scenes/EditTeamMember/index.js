import {
  Box,
  Button,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Header from "../../components/Header";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/material.css";
import { useState, useEffect } from "react";
import { tokens } from "../../theme";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { editTeamMember, getOneTeamMember } from "../../actions/teamAction";
import { format } from "date-fns";
import { BACKEND_URL } from "../../config/ServerConfig";

const EditTeamMemberForm = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDarkMode = theme.palette.mode === "dark";
  const [selectedImageName, setSelectedImageName] = useState("");
  const dispatch = useDispatch();
  const selectedteamMember = useSelector(
    (state) => state.team.activeTeamMember
  );
  const [teamMember, setTeamMember] = useState({});
  const { id } = useParams();
  const error = useSelector((state) => state.tasks.error);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (Object.keys(selectedteamMember).length > 0) {
      setTeamMember(selectedteamMember);
    }
  }, [selectedteamMember]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getOneTeamMember(id));
  }, [dispatch, id]); // <== Appelle une seule fois le fetch

  const handleFormSubmit = async (values) => {
    console.log("Updated values:", values);
    const newData = { ...values };
    if (newData.profilePicture === teamMember.profilePicture) {
      delete newData.profilePicture;
    }
    const formData = new FormData();
    for (const key in newData) {
      if (key === "keySkills" || key === "certifications") {
        newData[key].forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, newData[key]);
      }
    }
    // 🔍 Afficher les valeurs du formData
    console.log("FormData entries:");
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }
    const result = await dispatch(editTeamMember(values._id, formData));
    if (result.success) {
      setSuccess("Team member edited with success.");
      setTimeout(() => {
        navigate("/team"); // ✅ Only navigate on success
      }, 1500);
    }
  };

  const handleProfilePictureChange = (e, setFieldValue) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageName(file.name);
      setFieldValue("profilePicture", file); // ✅ store the File directly
    }
  };

  const initialValues = {
    _id: teamMember?._id || "",
    fullName: teamMember?.fullName || "",
    email: teamMember?.email || "",
    phoneNumber: teamMember?.phoneNumber || "",
    profilePicture: teamMember?.profilePicture || "",
    jobTitle: teamMember?.jobTitle || "",
    employmentType: teamMember?.employmentType || "",
    dateOfJoining:
      (teamMember?.dateOfJoining &&
        format(teamMember?.dateOfJoining, "yyyy-MM-dd")) ||
      "",
    seniorityLevel: teamMember?.seniorityLevel || "",
    remoteWorkAllowed: teamMember?.remoteWorkAllowed || false,
    keySkills: teamMember?.keySkills || [],
    certifications: teamMember?.certifications || [],
    yearsOfExperience: teamMember?.yearsOfExperience || 0,
  };

  //
  // ERRORS
  if ((Object.keys(teamMember).length < 1 || !teamMember.fullName) && !error) {
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

  if (error && Object.keys(teamMember).length < 1) {
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

  /////

  return (
    <Box m="20px">
      <Header
        title="Edit Team Member"
        subtitle="Modify the details of an existing team member"
      />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={teamMemberSchema}
        enableReinitialize // Important: to update form if memberData changes
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
              {/* Same fields as before */}

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
                    width: "100%",
                    height: "56px",
                    backgroundColor: isDarkMode ? "#424242" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#000",
                    border: "none",
                    borderBottom: "2px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "16px",
                    paddingLeft: "50px",
                  }}
                  buttonStyle={{
                    backgroundColor: isDarkMode ? "#424242" : "#f5f5f5",
                    border: "none",
                  }}
                  containerStyle={{ width: "100%" }}
                  country={"tn"}
                  value={values.phoneNumber}
                  onChange={(phone) => setFieldValue("phoneNumber", phone)}
                  onBlur={handleBlur}
                  inputProps={{
                    name: "phoneNumber",
                    required: true,
                  }}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <div style={{ color: "red", fontSize: "12px" }}>
                    {errors.phoneNumber}
                  </div>
                )}
              </Box>

              {/* Profile Picture */}
              <Box
                sx={{
                  gridColumn: "span 2",
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                {console.log(values?.profilePicture)}
                {/* Profile Picture */}
                <Avatar
                  src={
                    typeof values?.profilePicture === "string"
                      ? BACKEND_URL + values?.profilePicture
                      : URL.createObjectURL(values?.profilePicture)
                  }
                  alt={values?.fullName}
                  sx={{ width: 80, height: 80, mb: 2 }}
                />
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  sx={{
                    backgroundColor: isDarkMode ? "#424242" : "#f5f5f5",
                    color: isDarkMode ? "#fff" : "#000",
                    height: "56px",
                    width: "300px",
                    justifyContent: "flex-start",
                    pl: "15px",
                    "&:hover": {
                      backgroundColor: isDarkMode ? "#333" : "#e0e0e0",
                    },
                    marginLeft: "30px",
                  }}
                >
                  {selectedImageName || "Upload Profile Picture"}
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={(e) =>
                      handleProfilePictureChange(e, setFieldValue)
                    }
                  />
                </Button>
                {touched.profilePicture && errors.profilePicture && (
                  <div style={{ color: "red", fontSize: "12px" }}>
                    {errors.profilePicture}
                  </div>
                )}
              </Box>

              {/* Other fields (Job Title, Employment Type, etc.) */}
              {/* exactly like you had them - no need to retype here */}

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

              <TextField
                fullWidth
                variant="filled"
                label="Key Skills (comma separated)"
                name="keySkills"
                value={values.keySkills.join(", ")}
                onChange={(e) =>
                  setFieldValue(
                    "keySkills",
                    e.target.value.split(",").map((skill) => skill.trim())
                  )
                }
                onBlur={handleBlur}
                error={!!touched.keySkills && !!errors.keySkills}
                helperText={touched.keySkills && errors.keySkills}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                label="Certifications (comma separated)"
                name="certifications"
                value={values.certifications.join(", ")}
                onChange={(e) =>
                  setFieldValue(
                    "certifications",
                    e.target.value.split(",").map((cert) => cert.trim())
                  )
                }
                onBlur={handleBlur}
                error={!!touched.certifications && !!errors.certifications}
                helperText={touched.certifications && errors.certifications}
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                fullWidth
                variant="filled"
                type="number"
                label="Years of Experience"
                name="yearsOfExperience"
                value={values.yearsOfExperience}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  !!touched.yearsOfExperience && !!errors.yearsOfExperience
                }
                helperText={
                  touched.yearsOfExperience && errors.yearsOfExperience
                }
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <br />
            <br />
            {/* Submit Button */}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button
                type="submit"
                sx={{
                  backgroundColor: colors.grey[100],
                  color: colors.grey[900],
                }}
              >
                Update Team Member
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

// Validation schema (same as before)
const teamMemberSchema = yup.object().shape({
  fullName: yup.string().required("Required"),
  email: yup.string().email("Invalid email address").required("Required"),
  phoneNumber: yup.string().required("Required"),
  jobTitle: yup.string().required("Required"),
  employmentType: yup.string().required("Required"),
  dateOfJoining: yup.date().required("Required"),
  seniorityLevel: yup.string().required("Required"),
  remoteWorkAllowed: yup.boolean(),
  keySkills: yup
    .array()
    .of(yup.string().required("Required"))
    .min(1, "At least one skill required"),
  certifications: yup
    .array()
    .of(yup.string())
    .min(1, "At least one certification required"),
  yearsOfExperience: yup
    .number()
    .required("Required")
    .min(0, "Experience cannot be negative"),
  profilePicture: yup.string().nullable(),
});

export default EditTeamMemberForm;
