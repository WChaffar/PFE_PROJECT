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
  ListItemIcon,
  ListItemText,
  Stack,
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
import { deleteAbsenceByID, getMyAbsences } from "../../actions/absenceAction";
import { format } from "date-fns";

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

const MyAbsences = () => {
  const [search, setSearch] = useState("");
  const theme = useTheme(); // Accéder au thème
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openSnackbar, setOpenSnackbar] = React.useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // Message for Snackbar
  const error = useSelector((state) => state.team.error);
  const [errorState, setErrorState] = useState(null);
  const [myAbsences, setMyAbsences] = useState([]);

  const selectedAbsences = useSelector((state) => state.absence.absences);

  useEffect(() => {
    if (selectedAbsences?.length !== 0) {
      const absences = selectedAbsences
        ?.map((a) => {
          return {
            id: a?._id,
            type: a?.type,
            startDate: format(a?.startDate, "yyyy-MM-dd"),
            endDate: format(a?.endDate, "yyyy-MM-dd"),
          };
        })
        ?.sort((a, b) => a.startDate.localeCompare(b.startDate));
      setMyAbsences(absences);
    }
  }, [selectedAbsences]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    dispatch(getMyAbsences());
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
      field: "type",
      headerName: "Type",
      flex: 1,
    },
    { field: "startDate", headerName: "Start date", flex: 1 },
    {
      field: "endDate",
      headerName: "End date",
      flex: 1,
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
    const [openModifyBUConfirm, setOpenModifyBUConfirm] = React.useState(false);
    const [openModifyManagerConfirm, setOpenModifyManagerConfirm] =
      React.useState(false);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const handleClose = async (action) => {
      if (action === "Edit") {
        // handle edit logic here
        navigate(`/edit-my-absence/${row.row.id}`)
      }
      if (action === "Delete") {
        // handle delete logic here
        setOpenConfirm(true);
      }
      setAnchorEl(null);
    };

    const handleConfirmDelete = async () => {
        const result = await dispatch(deleteAbsenceByID(row.id));
            if (result.success) {
              setSnackbarMessage("absence canceled successfully!"); // Set success message
              setOpenSnackbar(true); // Show Snackbar
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
          {" "}
          <MenuItem onClick={() => handleClose("Edit")}>✏️ Edit</MenuItem>
          <MenuItem onClick={() => handleClose("Delete")}>🗑️ Cancel absence</MenuItem>
        </Menu>
         <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                  <DialogTitle>Confirm Deletion</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to cancel the absence ?{" "}
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
                      Cancel
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
            My absences
          </Typography>
          <Typography color={theme.palette.text.secondary} mb={4}>
            Need to check when you were out ? Find all your absence records
            here.
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
              navigate("/add-absence");
            }}
          >
            + Add new absence
          </Button>
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
          rows={myAbsences}
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

export default MyAbsences;
