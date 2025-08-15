import React, { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
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
import {
  deleteTeamMember,
  getAllBuManagers,
  getAllTeamMembers,
  getAllTeamMembersForManager,
  getTeamForManagerInBu,
} from "../../actions/teamAction";
import { BACKEND_URL } from "../../config/ServerConfig";

import { getAllEmployeeAssignements } from "../../actions/assignementsAction";
import { format, getDate } from "date-fns";
import {
  changeProjectManager,
  getAllManagerProjects,
} from "../../actions/projectAction";

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

const DelegateAManager = () => {
  const [search, setSearch] = useState("");
  const theme = useTheme(); // Accéder au thème
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedTeamManagers = useSelector((state) => state.team.managers);
  const selectedTeam = useSelector((state) => state.team.team);
  const [managers, setManagers] = useState([]);
  const [openSnackbar, setOpenSnackbar] = React.useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // Message for Snackbar
  const [error, setError] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const selectedProjects = useSelector((state) => state.projects.projects);
  const selectedAssignements = useSelector(
    (state) => state.assignements.assignements
  );
  const [availableTeamMemebers, setAvailableTeamMembers] = useState([]);
  const [onProjectTeamMemebers, setOnProjectTeamMembers] = useState([]);

  useEffect(() => {
    if (selectedTeamManagers.length !== 0) {
      const managersMap = selectedTeamManagers.map((member) => ({
        id: member?._id,
        name: member?.fullName,
        avatar: BACKEND_URL + member?.profilePicture,
      }));
      setManagers(managersMap);
    }
  }, [selectedTeamManagers]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getAllBuManagers());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    dispatch(getAllEmployeeAssignements());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    if (managers?.length > 0 && selectedAssignements?.length > 0) {
      const onProject = [];
      const available = [];

      managers.forEach((member) => {
        const hasActiveAssignment = selectedAssignements.some((a) => {
          return (
            a.employee._id === member.id &&
            format(a?.endDate, "yyyy-MM-dd") >
              format(new Date(), "yyyy-MM-dd") &&
            format(a?.startDate, "yyyy-MM-dd") <=
              format(new Date(), "yyyy-MM-dd")
          );
        });
        if (hasActiveAssignment) {
          onProject.push(member);
        } else {
          available.push(member);
        }
      });

      setOnProjectTeamMembers(onProject);
      setAvailableTeamMembers(available);
      console.log("On Project:", onProject.length);
      console.log("Available:", available.length);
    }
  }, [managers, selectedAssignements]);

  useEffect(() => {
    if (openSnackbar) {
      const timer = setTimeout(() => {
        handleSnackbarClose();
        setErrorState(null);
      }, 6000); // 10 secondes
      return () => clearTimeout(timer);
    }
  }, [openSnackbar]);

  useEffect(() => {
    if (error !== null) {
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
      flex: 5,
      renderCell: ({ row }) => {
        const getInitials = (fullName) => {
          if (!fullName) return "";
          return fullName
            .split(" ")
            .map((word) => word[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
        };
        const initials = getInitials(row?.name);
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar
              key={row.id}
              src={row?.profilePicture || undefined}
              alt={row?.name}
              sx={{ width: 40, height: 40, fontWeight: 600 }}
            >
              {!row?.profilePicture && initials}
            </Avatar>
            <Typography
              fontSize="0.9rem"
              color={theme.palette.mode === "dark" ? "white" : "black"} // Couleur dynamique en fonction du mode
            >
              {row.name}
            </Typography>
          </Box>
        );
      },
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
    const [selectedManager, setselectedManager] = useState(null);
    const [confirmError, setConfirmError] = useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const handleAction = (action) => {
      if (action === "Edit") {
        setOpenConfirm(true); // Show confirmation dialog
        handleCloseMenu();
      }
    };

    const handleConfirmEdit = async () => {
      const result = await dispatch(
        changeProjectManager(row.id, selectedManager?._id)
      );
      if (result.success) {
        dispatch(getAllBuManagers());
        setSnackbarMessage("The manager of this project updated successfully!"); // Set success message
        setOpenSnackbar(true); // Show Snackbar
        // Using window.location.reload()
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
      setOpenConfirm(false);
      handleCloseMenu();
    };

    return (
      <>
        <IconButton
          onClick={(event) => {
            event.stopPropagation(); // Prevent click from bubbling
            handleClick(event);
          }}
        >
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
          <MenuItem onClick={() => handleAction("Edit")}>
            ✏️ Change Manager
          </MenuItem>
        </Menu>

        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Change Manager</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <br />
              This action can have significant consequences, including affecting
              team assignments, associated tasks, and linked data. Proceed with
              caution.
            </DialogContentText>
            <DialogContentText>
              {" "}
              You're about to update the manager :
              <Autocomplete
                fullWidth
                options={selectedTeamManagers}
                getOptionLabel={(option) =>
                  typeof option === "string"
                    ? option
                    : "Manager id : " +
                        option?._id +
                        ", nom : " +
                        option?.fullName || ""
                }
                isOptionEqualToValue={(option, value) =>
                  option?._id === value?._id
                }
                value={
                  selectedTeamManagers.find((p) => p._id === []?._id) || null
                }
                onChange={(event, newValue) => {
                  setselectedManager(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Manager"
                    name="Manager"
                    variant="filled"
                  />
                )}
                sx={{ gridColumn: "span 2" }}
              />
              {confirmError !== null && (
                <Box color={"red"}> {confirmError} </Box>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEdit}
              color="primary"
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false); // Close the Snackbar
  };

  const AccountsAvatars = ({ accounts }) => {
    const visibleAccounts = accounts?.slice(0, 3) || [];
    const getInitials = (fullName) => {
      if (!fullName) return "";
      return fullName
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    };
    return (
      <Stack direction="row" spacing={-1}>
        {visibleAccounts.map((member, index) => {
          const hasPicture = member?.avatar?.trim();
          const initials = getInitials(member?.name);

          return (
            <Avatar
              key={index}
              src={hasPicture || undefined}
              alt={member?.name}
              sx={{ width: 40, height: 40, fontWeight: 600 }}
            >
              {!hasPicture && initials}
            </Avatar>
          );
        })}
      </Stack>
    );
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
            Oversee managers
          </Typography>
          <Typography color={theme.palette.text.secondary} mb={4}>
            Delegate projects and the team to another manager.
          </Typography>
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
            {selectedTeam?.length}
          </Typography>
          <Typography>Team Members</Typography>
          <Box>
            <AccountsAvatars accounts={selectedTeam} />
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
            {selectedProjects?.length}
          </Typography>
          <Typography>Projects</Typography>
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
          rows={managers}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          onRowClick={({ row }) => {
            dispatch(getTeamForManagerInBu(row.id));
            dispatch(getAllManagerProjects(row.id));
          }}
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

export default DelegateAManager;
