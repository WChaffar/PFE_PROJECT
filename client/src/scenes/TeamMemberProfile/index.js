import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getOneTeamMember } from "../../actions/teamAction";
import { tokens } from "../../theme";
import { BACKEND_URL } from "../../config/ServerConfig";

const TeamMemberProfile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const selectedTeamMember = useSelector(
    (state) => state.team.activeTeamMember
  );
  const [teamMember, setTeamMember] = useState({});
  const dispatch = useDispatch();
  const { id } = useParams();
  const error = useSelector((state) => state.team.error);

  useEffect(() => {
    if (Object.keys(selectedTeamMember).length > 0) {
      setTeamMember({
        ...selectedTeamMember,
        dateOfJoining: selectedTeamMember?.dateOfJoining
          ? format(selectedTeamMember?.dateOfJoining, "yyyy-MM-dd")
          : "",
      });
    }
  }, [selectedTeamMember]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getOneTeamMember(id));
  }, [dispatch]); // <== Appelle une seule fois le fetch

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

  return (
    <Box
      m="20px"
      p="30px"
      borderRadius="10px"
      boxShadow={3}
      display="flex"
      flexDirection="column"
      alignItems="center"
      maxWidth="800px"
      mx="auto"
    >
      {/* Profile Picture */}
      <Avatar
        src={BACKEND_URL + teamMember.profilePicture}
        alt={teamMember.fullName}
        sx={{ width: 120, height: 120, mb: 2 }}
      />

      {/* Full Name */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {teamMember.fullName}
      </Typography>

      {/* Job Title */}
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {teamMember.jobTitle}
      </Typography>

      {/* Contact Info */}
      <Box textAlign="center" mb={3}>
        <Typography variant="body1">{teamMember.email}</Typography>
        <Typography variant="body1">{teamMember.phoneNumber}</Typography>
      </Box>

      <Divider sx={{ width: "100%", mb: 3 }} />

      {/* Employment Details */}
      <Box width="100%" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          Employment Type:
        </Typography>
        <Typography variant="body2" mb={1}>
          {teamMember.employmentType}
        </Typography>

        <Typography variant="subtitle1" fontWeight="bold">
          Date of Joining:
        </Typography>
        <Typography variant="body2" mb={1}>
          {new Date(teamMember?.dateOfJoining).toLocaleDateString()}
        </Typography>

        <Typography variant="subtitle1" fontWeight="bold">
          Seniority Level:
        </Typography>
        <Typography variant="body2" mb={1}>
          {teamMember.seniorityLevel}
        </Typography>

        <Typography variant="subtitle1" fontWeight="bold">
          Remote Work Allowed:
        </Typography>
        <Typography variant="body2" mb={1}>
          {teamMember.remoteWorkAllowed ? "Yes" : "No"}
        </Typography>
      </Box>

      <Divider sx={{ width: "100%", mb: 3 }} />

      {/* Key Skills */}
      <Box width="100%" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Key Skills:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {teamMember.keySkills.map((skill, idx) => (
            <Chip key={idx} label={skill} color="primary" />
          ))}
        </Box>
      </Box>

      {/* Certifications */}
      <Box width="100%" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>
          Certifications:
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {teamMember.certifications.map((cert, idx) => (
            <Chip key={idx} label={cert} color="secondary" />
          ))}
        </Box>
      </Box>

      {/* Experience */}
      <Box width="100%" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          Years of Experience:
        </Typography>
        <Typography variant="body2">
          {teamMember.yearsOfExperience} year(s)
        </Typography>
      </Box>
    </Box>
  );
};

export default TeamMemberProfile;
