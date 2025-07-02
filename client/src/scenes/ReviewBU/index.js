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
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import {
  DataGrid,
  GridCheckCircleIcon,
  renderActionsCell,
} from "@mui/x-data-grid";
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
import { BACKEND_URL } from "../../config/ServerConfig";
import BlockIcon from "@mui/icons-material/Block";
import {
  deleteBuById,
  getBU,
  updateBu,
} from "../../actions/businessUnitAction";
import { format } from "date-fns";

const NameCell = ({ row, theme }) => {
  const [imgError, setImgError] = useState(false);
  const hasValidImage = row.avatar && !imgError;

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

const ReviewBU = () => {
  const [search, setSearch] = useState("");
  const theme = useTheme(); // Accéder au thème
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedBUs = useSelector((state) => state.businessUnit.businessUnit);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [openSnackbar, setOpenSnackbar] = React.useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // Message for Snackbar
  const error = useSelector((state) => state.businessUnit.error);
  const [errorState, setErrorState] = useState(null);
  const [totalPending, setTotalPending] = useState("...");
  const [totalConfirmed, setTotalConfirmed] = useState("...");

  useEffect(() => {
    if (selectedBUs.length !== 0) {
      const businessUnitsMap = selectedBUs.map((bu) => ({
        id: bu?._id,
        name: bu?.name,
        code: bu?.code,
        description: bu?.description,
        isActive: bu?.isActive,
        createdAt: format(bu?.createdAt, "yyyy-MM-dd HH:mm:ss"),
      }));
      setBusinessUnits(businessUnitsMap);
    }
  }, [selectedBUs]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getBU());
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
    { field: "code", headerName: "code", flex: 1 },
    {
      field: "description",
      headerName: "description",
      flex: 1,
    },
    {
      field: "createdAt",
      headerName: "createdAt",
      flex: 1,
    },
    {
      field: "isActive",
      headerName: "isActive",
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

  const ActionsMenu = ({ row }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const [activateOpenConfirm, setActivateOpenConfirm] = React.useState(false);
    const [disableOpenConfirm, setDisableOpenConfirm] = React.useState(false);
    const [deleteOpenConfirm, setDeleteOpenConfirm] = React.useState(false);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const handleClose = (action) => {
      if (action === "Modify") {
        // handle edit logic here
        navigate(`/modify-bu/${row.row.id}`);
      }
      if (action === "Activate") {
        // handle delete logic here
        setActivateOpenConfirm(true); // Show confirmation dialog
      }
      if (action === "Disable") {
        // handle details logic here
        setDisableOpenConfirm(true); // Show confirmation dialog
      }
      if (action === "Delete") {
        // handle details logic here
        setDeleteOpenConfirm(true); // Show confirmation dialog
      }
      setAnchorEl(null);
    };

    const handleActivateConfirm = async () => {
      const result = await dispatch(updateBu(row.row.id, { isActive: true }));
      if (result.success) {
        setSnackbarMessage("Business unit successfully activated !"); // Set success message
        setOpenSnackbar(true); // Show Snackbars
      }
      setActivateOpenConfirm(false);
      handleCloseMenu();
    };

    const handleDisableConfirm = async () => {
      const result = await dispatch(updateBu(row.row.id, { isActive: false }));
      if (result.success) {
        setSnackbarMessage("Business unit successfully disabled !"); // Set success message
        setOpenSnackbar(true); // Show Snackbars
      }
      setActivateOpenConfirm(false);
      handleCloseMenu();
    };

    const handleConfirmDelete = async () => {
      const result = await dispatch(deleteBuById(row.id));
      if (result.success) {
        setSnackbarMessage("Business Unit deleted successfully!"); // Set success message
        setOpenSnackbar(true); // Show Snackbar
      }
      setDeleteOpenConfirm(false);
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
          <MenuItem onClick={() => handleClose("Modify")}>
            <ListItemIcon>✏️</ListItemIcon>
            <ListItemText primary="Modify business unit" />
          </MenuItem>
          {!row.row.isActive && (
            <MenuItem onClick={() => handleClose("Activate")}>
              <ListItemIcon>
                <GridCheckCircleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Activate Business Unit" />
            </MenuItem>
          )}
          {row.row.isActive && (
            <MenuItem onClick={() => handleClose("Disable")}>
              <ListItemIcon>
                <BlockIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Disable the Business Unit" />
            </MenuItem>
          )}
          <MenuItem onClick={() => handleClose("Delete")}>🗑️ Delete</MenuItem>
        </Menu>
        <Dialog
          open={activateOpenConfirm}
          onClose={() => setActivateOpenConfirm(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to activate the business unit ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setActivateOpenConfirm(false)}
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleActivateConfirm}
              color="primary"
              variant="contained"
            >
              Activate
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={disableOpenConfirm}
          onClose={() => setDisableOpenConfirm(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to disbale the business unit ?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDisableOpenConfirm(false)}
              color="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisableConfirm}
              color="primary"
              variant="contained"
            >
              Disbale
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={deleteOpenConfirm}
          onClose={() => setDeleteOpenConfirm(false)}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the business unit{" "}
              <strong>{row.name}</strong>?<br />
              This action can have significant consequences. All accounts
              assigned to this business unit will be inaccessible until they are
              assigned to a new business unit.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteOpenConfirm(false)}
              color="secondary"
            >
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
            Add a review business unit.
          </Typography>
          <Typography color={theme.palette.text.secondary} mb={4}>
            Add a dedicated business unit to manage and monitor reviews within
            the organization.
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
              navigate("/add-bu");
            }}
          >
            + Add new business unit
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
          rows={businessUnits}
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

export default ReviewBU;
