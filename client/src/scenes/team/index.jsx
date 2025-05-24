import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { teamMembersData } from "../../data/TeamData"; // <- Créez ce fichier
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { tokens } from "../../theme";
import {
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { Menu, MenuItem, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { deleteTeamMember, getAllTeamMembers } from "../../actions/teamAction";
import { BACKEND_URL } from "../../config/ServerConfig";

const CustomToolbar = () => {
  return (
    <GridToolbarContainer>
      <Box display="flex" flexDirection="row" gap={2} alignItems="center">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport />
      </Box>
    </GridToolbarContainer>
  );
};

const TeamManagement = () => {
  const [search, setSearch] = useState("");
  const theme = useTheme(); // Accéder au thème
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedTeamMembers = useSelector((state) => state.team.team);
  const [teamMemebers, setTeamMembers] = useState([]);
  const [openSnackbar, setOpenSnackbar] = React.useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // Message for Snackbar
  const error = useSelector((state) => state.team.error);
  const [errorState, setErrorState] = useState(null);

  useEffect(() => {
    if (selectedTeamMembers.length !== 0) {
      const teamMembersMap = selectedTeamMembers.map((member) => ({
        id: member?._id,
        name: member?.fullName,
        avatar: BACKEND_URL + member?.profilePicture,
        role: member?.jobTitle,
        skills: member?.keySkills,
        experience:
          member.yearsOfExperience +
          (member.yearsOfExperience > 1 ? " years" : " year"),
        availability: "On Project",
      }));
      setTeamMembers(teamMembersMap);
    }
  }, [selectedTeamMembers]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getAllTeamMembers());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    if (openSnackbar) {
      const timer = setTimeout(() => {
        handleSnackbarClose();
        setErrorState(null)
      }, 6000); // 10 secondes
      return () => clearTimeout(timer);
    }
  }, [openSnackbar]);

  useEffect(() => {
    if (error !== null) {
      console.log("hey")
      setErrorState(error);
      setSnackbarMessage(error); // Set success message
      setOpenSnackbar(true); // Show Snackbar
      console.log("delete failed");
    }
  }, [error]);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <img
            src={row.avatar}
            alt={row.name}
            style={{ width: 32, height: 32, borderRadius: "50%" }}
          />
          <Typography
            fontSize="0.9rem"
            color={theme.palette.mode === "dark" ? "white" : "black"} // Couleur dynamique en fonction du mode
          >
            {row.name}
          </Typography>
        </Box>
      ),
    },
    { field: "role", headerName: "Role", flex: 1 },
    {
      field: "skills",
      headerName: "Skills",
      flex: 2,
      renderCell: ({ row }) => (
        <Box display="flex" gap={0.5} flexWrap="wrap">
          {row.skills.map((skill, idx) => (
            <Box
              key={idx}
              bgcolor={theme.palette.mode === "dark" ? "#555" : "#eee"}
              px={1}
              py={0.5}
              borderRadius="12px"
              fontSize="0.7rem"
            >
              {skill}
            </Box>
          ))}
        </Box>
      ),
    },
    {
      field: "experience",
      headerName: "Experience",
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          ⏱ {row.experience}
        </Box>
      ),
    },
    {
      field: "availability",
      headerName: "Availability",
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          px={1.5}
          py={0.5}
          borderRadius="8px"
          bgcolor={row.availability === "Available" ? "limegreen" : "orange"}
          color="white"
          fontWeight="bold"
          fontSize="0.8rem"
          width="fit-content"
        >
          {row.availability}
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      flex: 0.5,
      renderCell: (row) => <ActionsMenu row={row} />,
    },
  ];

  const filteredData = teamMembersData.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  const ActionsMenu = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [openConfirm, setOpenConfirm] = React.useState(false);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const handleClose = (action) => {
      if (action === "Edit") {
        // handle edit logic here
        navigate(`/team/${row.id}/edit`);
      }
      if (action === "Delete") {
        // handle delete logic here
        setOpenConfirm(true); // Show confirmation dialog
      }
      if (action === "Details") {
        // handle details logic here
        navigate(`/team/${row.id}/profile`);
      }
      setAnchorEl(null);
    };

    const handleConfirmDelete = async () => {
      const result = await dispatch(deleteTeamMember(row.id));
      if (result.success) {
        setSnackbarMessage("Task deleted successfully!"); // Set success message
        setOpenSnackbar(true); // Show Snackbar
        console.log("delete with success");
      }
      setOpenConfirm(false);
      handleCloseMenu();
    };
    return (
      <>
        <IconButton onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => handleClose()}
          slotProps={{
            paper: {
              sx: {
                minWidth: 150, // Ensure menu is wide enough
                py: 1, // Padding on Y-axis (top & bottom)
                boxShadow: 3, // Add some shadow for depth
                zIndex: 1301, // Ensure the menu pops above other elements
              },
            },
          }}
        >
          <MenuItem onClick={() => handleClose("Edit")}>✏️ Edit</MenuItem>
          <MenuItem onClick={() => handleClose("Delete")}>🗑️ Delete</MenuItem>
          <MenuItem onClick={() => handleClose("Details")}>🔍 Details</MenuItem>
        </Menu>
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the team member{" "}
              <strong>{row.name}</strong>?<br />
              This action can have significant consequences, including affecting
              team assignments, projects, and linked data. Proceed with caution.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false); // Close the Snackbar
  };

  return (
    <Box p={3} bgcolor={theme.palette.background.default}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          {/* Header */}
          <Typography
            variant="h4"
            fontWeight="bold"
            mb={1}
            color={theme.palette.text.primary}
          >
            Team Management
          </Typography>
          <Typography color={theme.palette.text.secondary} mb={4}>
            Manage Team for better Collaboration.
          </Typography>
        </Box>
        <Box>
          <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
            onClick={() => {
              navigate("/team/create");
            }}
          >
            Add Team Member
          </Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Box display="flex" gap={2} mb={4}>
        {/* Card 1 */}
        <Box
          flex={1}
          bgcolor={theme.palette.background.paper}
          p={3}
          borderRadius="12px"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold">
            45
          </Typography>
          <Typography>Team Members</Typography>
          <Box mt={2} display="flex">
            <img
              src="https://i.pravatar.cc/40?img=1"
              style={{ borderRadius: "50%" }}
            />
            <img
              src="https://i.pravatar.cc/40?img=2"
              style={{ borderRadius: "50%", marginLeft: -10 }}
            />
            <img
              src="https://i.pravatar.cc/40?img=3"
              style={{ borderRadius: "50%", marginLeft: -10 }}
            />
          </Box>
        </Box>

        {/* Card 2 */}
        <Box
          flex={1}
          bgcolor={theme.palette.background.paper}
          p={3}
          borderRadius="12px"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold">
            3
          </Typography>
          <Typography>Available Now</Typography>
          <Box mt={2} display="flex">
            <img
              src="https://i.pravatar.cc/40?img=4"
              style={{ borderRadius: "50%" }}
            />
            <img
              src="https://i.pravatar.cc/40?img=5"
              style={{ borderRadius: "50%", marginLeft: -10 }}
            />
          </Box>
        </Box>

        {/* Card 3 */}
        <Box
          flex={1}
          bgcolor={theme.palette.background.paper}
          p={3}
          borderRadius="12px"
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Typography variant="h5" fontWeight="bold">
            20
          </Typography>
          <Typography>On Project</Typography>
          <Box mt={2} display="flex">
            <img
              src="https://i.pravatar.cc/40?img=6"
              style={{ borderRadius: "50%" }}
            />
            <img
              src="https://i.pravatar.cc/40?img=7"
              style={{ borderRadius: "50%", marginLeft: -10 }}
            />
          </Box>
        </Box>
      </Box>

      {/* Team Members Table */}
      <Box height="60vh">
        {openSnackbar && errorState == null && (
          <Alert
            onClose={handleSnackbarClose}
            severity="success"
            sx={{ width: "auto" }}
          >
            {snackbarMessage}
          </Alert>
        )}
        {openSnackbar && errorState !== null && (
          <Alert
            onClose={handleSnackbarClose}
            severity="error"
            sx={{ width: "auto" }}
          >
            {snackbarMessage}
          </Alert>
        )}
        <DataGrid
          rows={teamMemebers}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          components={{ Toolbar: CustomToolbar }}
          sx={{
            borderRadius: "12px",
            bgcolor: theme.palette.background.paper,
            border: "none",
            boxShadow: 1,
            "& .MuiTablePagination-actions": {
              display: "flex",
              flexDirection: "row",
              marginRight: "100px",
              marginTop: "-10px",
            },
            "& .css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input.css-194a1fa-MuiSelect-select-MuiInputBase-input":
              {
                marginTop: "-15px",
              },
            "& .css-oatl8s-MuiSvgIcon-root-MuiSelect-icon": {
              marginTop: "-8px",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default TeamManagement;
