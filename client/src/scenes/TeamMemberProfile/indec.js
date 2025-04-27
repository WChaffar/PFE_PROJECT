import { Box, Typography, Avatar, Chip, Divider } from "@mui/material";

const data = {
    fullName: "Amira Ben Salah",
    email: "amira.bensalah@example.com",
    phoneNumber: "+216 50 123 456",
    profilePicture: "https://randomuser.me/api/portraits/women/44.jpg", // ou un base64 si tu préfères
    jobTitle: "Software Engineer",
    employmentType: "Full-time",
    dateOfJoining: "2021-06-10",
    seniorityLevel: "Mid-Level",
    remoteWorkAllowed: true,
    keySkills: ["JavaScript", "React", "Node.js", "Docker"],
    certifications: ["AWS Certified Developer", "Scrum Master Certified"],
    yearsOfExperience: 4,
  };
  

const TeamMemberProfile = () => {
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
        src={data.profilePicture}
        alt={data.fullName}
        sx={{ width: 120, height: 120, mb: 2 }}
      />

      {/* Full Name */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {data.fullName}
      </Typography>

      {/* Job Title */}
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {data.jobTitle}
      </Typography>

      {/* Contact Info */}
      <Box textAlign="center" mb={3}>
        <Typography variant="body1">{data.email}</Typography>
        <Typography variant="body1">{data.phoneNumber}</Typography>
      </Box>

      <Divider sx={{ width: "100%", mb: 3 }} />

      {/* Employment Details */}
      <Box width="100%" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">Employment Type:</Typography>
        <Typography variant="body2" mb={1}>{data.employmentType}</Typography>

        <Typography variant="subtitle1" fontWeight="bold">Date of Joining:</Typography>
        <Typography variant="body2" mb={1}>{new Date(data.dateOfJoining).toLocaleDateString()}</Typography>

        <Typography variant="subtitle1" fontWeight="bold">Seniority Level:</Typography>
        <Typography variant="body2" mb={1}>{data.seniorityLevel}</Typography>

        <Typography variant="subtitle1" fontWeight="bold">Remote Work Allowed:</Typography>
        <Typography variant="body2" mb={1}>{data.remoteWorkAllowed ? "Yes" : "No"}</Typography>
      </Box>

      <Divider sx={{ width: "100%", mb: 3 }} />

      {/* Key Skills */}
      <Box width="100%" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>Key Skills:</Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {data.keySkills.map((skill, idx) => (
            <Chip key={idx} label={skill} color="primary" />
          ))}
        </Box>
      </Box>

      {/* Certifications */}
      <Box width="100%" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold" mb={1}>Certifications:</Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {data.certifications.map((cert, idx) => (
            <Chip key={idx} label={cert} color="secondary" />
          ))}
        </Box>
      </Box>

      {/* Experience */}
      <Box width="100%" mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">Years of Experience:</Typography>
        <Typography variant="body2">{data.yearsOfExperience} year(s)</Typography>
      </Box>
    </Box>
  );
};

export default TeamMemberProfile;
