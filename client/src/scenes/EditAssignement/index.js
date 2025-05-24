// (tout en haut, inchangé)
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Paper,
  useTheme,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import dayjs from "dayjs";
import { tokens } from "../../theme";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getOneTeamMember } from "../../actions/teamAction";
import { BACKEND_URL } from "../../config/ServerConfig";

const mockCollaborator = {
  id: 1,
  name: "Jeff Bezos",
  avatar: "https://i.pravatar.cc/150?img=65",
};

const mockMissions = [
  {
    id: 1,
    title: "Projet Client 0 - Developpeur Java",
    dates: [
      { date: "2025-12-22", period: "AM" },
      { date: "2025-12-22", period: "PM" },
      { date: "2025-12-23", period: "AM" },
    ],
  },
  {
    id: 2,
    title: "Projet Client 1 - Developpeur Spring",
    dates: [
      { date: "2025-12-24", period: "FULL" },
      { date: "2025-12-25", period: "AM" },
      { date: "2025-12-26", period: "PM" },
      { date: "2025-12-29", period: "FULL" },
    ],
  },
];

const EditStaffing = () => {
  const [startDate, setStartDate] = useState(dayjs("2025-12-22"));
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const daysToShow = 14;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const dates = Array.from({ length: daysToShow }).map((_, i) =>
    startDate.add(i, "day")
  );
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

  const handlePrev = () =>
    setStartDate((prev) => prev.subtract(daysToShow, "day"));
  const handleNext = () => setStartDate((prev) => prev.add(daysToShow, "day"));

  const monthRow = dates.map((date, i) => {
    const showLabel =
      i === 0 || date.format("MM") !== dates[i - 1].format("MM");
    return (
      <Box key={i} width="60px" textAlign="center">
        {showLabel ? (
          <Typography fontWeight="bold" fontSize="12px" sx={{ color: "#000" }}>
            {date.format("MMMM")}
          </Typography>
        ) : null}
      </Box>
    );
  });

  return (
    <Box p={3}>
      <Typography variant="h5" mb={1}>
        Staffing Collaborateur
      </Typography>
      <Typography variant="subtitle2" color="gray" mb={3}>
        Optimize Your Workforce, Maximize Your Potential
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            src={BACKEND_URL+teamMember?.profilePicture}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Typography variant="h6">{teamMember?.fullName}</Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={1}
        >
          <IconButton onClick={handlePrev} sx={{ width: 30, height: 30 }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>

          <Box flex={1} overflow="hidden" sx={{ marginLeft: 22 }}>
            <Box display="flex" bgcolor="#fff9c4">
              {monthRow}
            </Box>
            <Box display="flex" bgcolor="#fff9c4" p={0.5}>
              {dates.map((date) => (
                <Box key={date.toString()} width="60px" textAlign="center">
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{ color: "#000" }}
                  >
                    {date.format("dd")}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#000" }}>
                    {date.format("DD")}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <IconButton onClick={handleNext} sx={{ width: 30, height: 30 }}>
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Box>

        {mockMissions.map((mission) => (
          <Box key={mission.id} display="flex" alignItems="center" mb={1}>
            <Typography width="200px" fontSize="14px">
              {mission.title}
            </Typography>
            {dates.map((date) => {
              const dateStr = date.format("YYYY-MM-DD");
              const slots = mission.dates.filter((d) => d.date === dateStr);

              if (slots.length === 0) {
                return (
                  <Box
                    key={dateStr}
                    width="60px"
                    height="20px"
                    m="1px"
                    border="1px solid #eee"
                  />
                );
              }

              const isFull = slots.some((s) => s.period === "FULL");

              if (isFull) {
                return (
                  <Box
                    key={dateStr}
                    width="60px"
                    height="20px"
                    m="1px"
                    bgcolor="#FFA500"
                  />
                );
              }

              return (
                <Box
                  key={dateStr}
                  width="60px"
                  height="20px"
                  m="1px"
                  display="flex"
                  flexDirection="column"
                  border="1px solid #eee"
                >
                  <Box
                    flex={1}
                    bgcolor={
                      slots.some((s) => s.period === "AM")
                        ? "#FFD580"
                        : "transparent"
                    }
                  />
                  <Box
                    flex={1}
                    bgcolor={
                      slots.some((s) => s.period === "PM")
                        ? "#FFD580"
                        : "transparent"
                    }
                  />
                </Box>
              );
            })}
          </Box>
        ))}

        <Box mt={2}>
          <Button
            variant="outlined"
            size="small"
            sx={{
              width: "130px",
              fontSize: "10px",
              px: 1,
              borderColor: colors.grey[100],
              backgroundColor: colors.primary,
              color: colors.grey[100],
            }}
            onClick={() => setShowAssignmentForm(true)}
          >
            + Add mission
          </Button>
        </Box>

        {showAssignmentForm && (
          <Box mt={4} p={3} border="2px solid #D3BDF0" borderRadius="10px">
            <Typography variant="h6" mb={2}>
              New assignment
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box flex="1" minWidth="200px">
                <Typography fontSize="14px" mb={0.5}>
                  Mission - Task Name *
                </Typography>
                <select style={{ width: "100%", padding: 6, borderRadius: 4 }}>
                  <option>Développeur Java sur le projet Client 3</option>
                </select>
              </Box>
              <Box flex="1" minWidth="200px">
                <Typography fontSize="14px" mb={0.5}>
                  Start Date *
                </Typography>
                <input
                  type="date"
                  style={{ width: "100%", padding: 6, borderRadius: 4 }}
                />
              </Box>
              <Box flex="1" minWidth="200px">
                <Typography fontSize="14px" mb={0.5}>
                  End Date *
                </Typography>
                <input
                  type="date"
                  style={{ width: "100%", padding: 6, borderRadius: 4 }}
                />
              </Box>
              <Box flex="1" minWidth="200px">
                <Typography fontSize="14px" mb={0.5}>
                  Assignment Type *
                </Typography>
                <select style={{ width: "100%", padding: 6, borderRadius: 4 }}>
                  <option>enduring - long period</option>
                </select>
              </Box>
              <Box flex="1" minWidth="200px">
                <Typography fontSize="14px" mb={0.5}>
                  Nombre exact des jours *
                </Typography>
                <input
                  type="number"
                  style={{ width: "100%", padding: 6, borderRadius: 4 }}
                  defaultValue="2"
                />
              </Box>
              <Box flex="1" minWidth="250px">
                <Typography fontSize="14px" mb={0.5}>
                  Specify half of the day's assignment
                </Typography>
                <textarea
                  rows="5"
                  style={{ width: "100%", padding: 6, borderRadius: 4 }}
                  defaultValue={`21/07/2025 - Morning\n10/10/2025 - Afternoon\n10/20/2025 - Afternoon`}
                />
              </Box>
            </Box>
            <Box mt={2} display="flex" flexDirection="column" gap={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CompareArrowsIcon />}
                sx={{
                  width: "400px",
                  fontSize: "10px",
                  borderColor: colors.grey[100],
                  backgroundColor: "#fff",
                  color: "#000",
                  alignSelf: "start",
                }}
              >
                Compare salary skills with assigned task skill requirements
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AutoAwesomeIcon />}
                sx={{
                  width: "250px",
                  fontSize: "10px",
                  px: 1,
                  borderRadius: "5px",
                  backgroundColor: colors.primary[100],
                  color: colors.grey[900],
                }}
              >
                Generate assignment recommendations
              </Button>
            </Box>

            <Box mt={2} display="flex" alignItems="center" gap={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowAssignmentForm(false)}
                sx={{
                  width: "130px",
                  fontSize: "10px",
                  px: 1,
                  borderColor: colors.redAccent[500],
                  backgroundColor: colors.primary,
                  color: colors.redAccent[500],
                }}
              >
                Annuler
              </Button>
              <Button
                variant="outlined"
                size="small"
                sx={{
                  width: "130px",
                  fontSize: "10px",
                  px: 1,
                  borderColor: colors.grey[100],
                  backgroundColor: colors.primary,
                  color: colors.grey[100],
                }}
              >
                SAVE
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default EditStaffing;
