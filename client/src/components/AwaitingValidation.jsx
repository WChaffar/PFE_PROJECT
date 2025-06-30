import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const AwaitingValidation = () => {
  const navigate = useNavigate(); // Navigate to other routes
  
  const handleLogout = () => {
    // Clear localStorage or session storage
    localStorage.removeItem("reduxState");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    //dispatch(logout());
    // Refresh the page
    window.location.reload();
    // Redirect user to the login page after logging out
    navigate("/login");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper
        elevation={3}
        sx={{ padding: 4, maxWidth: 500, textAlign: "center" }}
      >
        <Typography variant="h5" gutterBottom>
          Account Pending Validation
        </Typography>
        <Typography variant="body1" gutterBottom>
          Your account is currently under review by Human Resources. Thank you
          for registering. You will be notified once your account is validated.
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Paper>
    </Box>
  );
};

export default AwaitingValidation;
