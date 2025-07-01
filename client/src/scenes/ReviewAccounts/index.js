import React, { useEffect, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridCheckCircleIcon,
  renderActionsCell,
} from "@mui/x-data-grid";
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
  editTeamMemberBu,
  editTeamMemberManager,
  editTeamMemberValidation,
  getAllTeamMembers,
} from "../../actions/teamAction";
import { BACKEND_URL } from "../../config/ServerConfig";
import BlockIcon from "@mui/icons-material/Block";
import { getBU } from "../../actions/businessUnitAction";

const NameCell = ({ row, theme }) => {
  const [imgError, setImgError] = useState(false);
  const hasValidImage = row.avatar && !imgError;
  const dispatch = useDispatch();

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    const initials = parts
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    return initials.slice(0, 2);
  };

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {hasValidImage ? (
        <img
          src={row.avatar}
          alt={row.name}
          onError={() => setImgError(true)}
          style={{ width: 32, height: 32, borderRadius: "50%" }}
        />
      ) : (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "#ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            fontWeight: "bold",
            color: "#fff",
          }}
        >
          {getInitials(row.name)}
        </Box>
      )}
      <Typography
        fontSize="0.9rem"
        color={theme.palette.mode === "dark" ? "white" : "black"}
      >
        {row.name}
      </Typography>
    </Box>
  );
};

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

const ReviewAccounts = () => {
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
  const [totalPending, setTotalPending] = useState("...");
  const [totalConfirmed, setTotalConfirmed] = useState("...");
  const [businessUnits, setBusinessUnits] = useState([]);
  const [teamManagers, setTeamManagers] = useState([]);
  const selectedBusinessUnits = useSelector(
    (state) => state.businessUnit.businessUnit
  );

  useEffect(() => {
    if (selectedBusinessUnits.length !== 0) {
      setBusinessUnits(selectedBusinessUnits);
    }
  }, [selectedBusinessUnits]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    dispatch(getBU());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    if (selectedTeamMembers?.length !== 0) {
      const teamMembersMap = selectedTeamMembers?.map((member) => ({
        id: member?._id,
        name: member?.fullName,
        avatar: BACKEND_URL + member?.profilePicture,
        email: member?.email,
        role: member?.role,
        status:
          member?.Activated === true ? "Confirmed" : "Waiting for validation",
        businessUnit: member?.businessUnit,
        manager: member?.manager,
      }));
      setTeamMembers(teamMembersMap);
      // Count activated and deactivated members
      const confirmedCount = selectedTeamMembers?.filter(
        (member) => member?.Activated === true
      )?.length;
      const pendingCount = selectedTeamMembers?.filter(
        (member) => member?.Activated === false
      )?.length;
      setTotalPending(pendingCount);
      setTotalConfirmed(confirmedCount);
      const teamManagersMap = selectedTeamMembers?.filter(
        (member) => member.role === "Manager"
      );
      setTeamManagers(teamManagersMap);
    }
  }, [selectedTeamMembers]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getAllTeamMembers());
  }, [dispatch]); // <== Appelle une seule fois le fetch

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
      flex: 1,
      renderCell: (params) => <NameCell row={params.row} theme={theme} />,
    },
    { field: "email", headerName: "email", flex: 1 },
    {
      field: "role",
      headerName: "role",
      flex: 1,
    },
    {
      field: "status",
      headerName: "Account Status",
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <Box
            key={row.id}
            bgcolor={row.status === "Confirmed" ? "#9efd38" : "orange"}
            px={1}
            py={0.5}
            borderRadius="12px"
            fontSize="0.7rem"
          >
            {row.status}
          </Box>
        );
      },
    },
    {
      field: "businessUnit",
      headerName: "Business Unit",
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <Box key={row.id}>
            {row?.businessUnit === undefined ||
            row?.businessUnit === "" ||
            row?.businessUnit?.code === undefined ||
            row?.businessUnit?.code === "" ? (
              <Box
                bgcolor={"red"}
                px={1}
                py={0.5}
                borderRadius="12px"
                fontSize="0.8rem"
                color={"white"}
              >
                {" "}
                Not assigned to a business unit
              </Box>
            ) : (
              row?.businessUnit?.code + " : " + row?.businessUnit?.name
            )}
          </Box>
        );
      },
    },
    {
      field: "manager",
      headerName: "Manager",
      flex: 1,
      renderCell: ({ row }) => {
        return <Box key={row?.id}>{row?.manager?.fullName}</Box>;
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
    const [selectedBU, setselectedBU] = useState(null);
    const [selectedManager, setselectedManager] = useState(null);
    const [confirmError, setConfirmError] = useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const handleClose = async (action) => {
      if (action === "Validate") {
        // handle edit logic here
        setOpenConfirm(true);
      }
      if (action === "Suspend") {
        // handle delete logic here
        const result4 = await dispatch(
          editTeamMemberValidation(row.row.id, { Activated: false })
        );
        if (result4.success) {
          console.log("This account is active now");
        }
      }
      if (action === "Modify") {
        // handle details logic here
      }
      setAnchorEl(null);
    };

    const handleConfirmation = async () => {
      if (
        (row.row.businessUnit === undefined ||
          row.row.businessUnit === null ||
          row.row.businessUnit === "") &&
        (row.row.role === "Manager" || row.row.role === "BUDirector")
      ) {
        if (selectedBU === null) {
          setConfirmError("You should assign this user to a business unit !");
        } else {
          setConfirmError(null);
          const result = await dispatch(
            editTeamMemberBu(row.row.id, { businessUnit: selectedBU._id })
          );
          if (result.success) {
            setselectedBU(null);
            console.log("Business unit modified with success");
          }
          const result2 = await dispatch(
            editTeamMemberValidation(row.row.id, { Activated: true })
          );
          if (result2.success) {
            setselectedBU(null);
            console.log("This account is active now");
          }
        }
      } else if (
        (row.row.businessUnit === undefined ||
          row.row.businessUnit === null ||
          row.row.businessUnit === "") &&
        (row.row.manager === null ||
          row.row.manager === undefined ||
          row.row.manager === "") &&
        row.row.role === "Consultant"
      ) {
        if (selectedBU === null) {
          setConfirmError("You should assign this user to a business unit !");
        }else if (selectedManager === null) {
          setConfirmError("You should assign this user to a Manager !");
        } else {
          const result5 = await dispatch(
            editTeamMemberManager(row.row.id, { manager: selectedManager })
          );
          if (result5.success) {
            setselectedManager(null);
          }

          const result6 = await dispatch(
            editTeamMemberBu(row.row.id, { businessUnit: selectedBU })
          );
          if (result6.success) {
            setselectedBU(null);
          }

          const result7 = await dispatch(
            editTeamMemberValidation(row.row.id, { Activated: true })
          );
          if (result7.success) {
            setselectedBU(null);
          }
        }
      } else {
        const result3 = await dispatch(
          editTeamMemberValidation(row.row.id, { Activated: true })
        );
        if (result3.success) {
          setselectedBU(null);
          console.log("This account is active now");
        }
      }
      // const result = await dispatch(deleteTeamMember(row.id));
      // if (result.success) {
      //   setSnackbarMessage("Task deleted successfully!"); // Set success message
      //   setOpenSnackbar(true); // Show Snackbar
      //   console.log("delete with success");
      // }
      // setOpenConfirm(false);
      // handleCloseMenu();
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
          {" "}
          {row.row.status !== "Confirmed" && (
            <MenuItem onClick={() => handleClose("Validate")}>
              <ListItemIcon>
                <GridCheckCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Validate account" />
            </MenuItem>
          )}
          {row.row.status === "Confirmed" && (
            <MenuItem onClick={() => handleClose("Suspend")}>
              <ListItemIcon>
                <BlockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Suspend account" />
            </MenuItem>
          )}
          <MenuItem onClick={() => handleClose("Modify")}>
            {" "}
            <ListItemIcon>✏️</ListItemIcon>
            <ListItemText primary="Modify business unit" />
          </MenuItem>
        </Menu>
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm Account</DialogTitle>
          <DialogContent>
            <DialogContentText>
              The account will be activated and accessible to the user following
              your confirmation.{" "}
            </DialogContentText>
            {row.row.status === "Waiting for validation" &&
              (row.row.role === "Manager" || row.row.role === "BUDirector") &&
              (!row.row.businessUnit ||
                (typeof row.row.businessUnit === "object" &&
                  Object.keys(row.row.businessUnit).length < 1) ||
                row.row.businessUnit === "") && (
                <DialogContentText>
                  Before confirmation, ensure that manager is assigned to a
                  business unit :{/* Project */}
                  <Autocomplete
                    fullWidth
                    options={businessUnits}
                    getOptionLabel={(option) =>
                      typeof option === "string"
                        ? option
                        : option?.code + " : " + option?.name || ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      option?._id === value?._id
                    }
                    value={
                      businessUnits.find((p) => p._id === selectedBU?._id) ||
                      null
                    }
                    onChange={(event, newValue) => {
                      setselectedBU(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Business Unit"
                        name="BusinessUnit"
                        variant="filled"
                      />
                    )}
                    sx={{ gridColumn: "span 2" }}
                  />
                  {confirmError !== null && (
                    <Box color={"red"}> {confirmError} </Box>
                  )}
                </DialogContentText>
              )}
            {row.row.status === "Waiting for validation" &&
              row.row.role === "Consultant" &&
              (!row.row.businessUnit ||
                (typeof row.row.businessUnit === "object" &&
                  Object.keys(row.row.businessUnit).length < 1) ||
                row.row.businessUnit === "") && (
                <DialogContentText>
                  Before confirmation, ensure that the consultant is assigned to
                  a business unit and a manager :{/* Project */}
                  <Autocomplete
                    fullWidth
                    options={businessUnits}
                    getOptionLabel={(option) =>
                      typeof option === "string"
                        ? option
                        : option?.code + " : " + option?.name || ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      option?._id === value?._id
                    }
                    value={
                      businessUnits.find((p) => p._id === selectedBU?._id) ||
                      null
                    }
                    onChange={(event, newValue) => {
                      setselectedBU(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Business Unit"
                        name="BusinessUnit"
                        variant="filled"
                      />
                    )}
                    sx={{ gridColumn: "span 2" }}
                  />
                  <Autocomplete
                    fullWidth
                    options={teamManagers}
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
                      teamManagers.find(
                        (p) => p._id === selectedManager?._id
                      ) || null
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
              )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)} color="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmation}
              color="success"
              variant="contained"
            >
              Confirm account
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
            Review accounts
          </Typography>
          <Typography color={theme.palette.text.secondary} mb={4}>
            Review and validate user accounts to ensure accuracy, compliance,
            and up-to-date information.
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
            {totalConfirmed}
          </Typography>
          <Typography>Confirmed accounts</Typography>
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
            {totalPending}
          </Typography>
          <Typography>Waiting for validation</Typography>
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

export default ReviewAccounts;
