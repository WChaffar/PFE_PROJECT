import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BACKEND_URL } from "../../config/ServerConfig";
import { getAllTeamMembers } from "../../actions/teamAction";

dayjs.extend(isBetween);



const assignments = [
  { memberId: "6820d9789f2baaeeb93fad6f", date: "2025-06-22", task: "TMA" },
  { memberId: "6820d9789f2baaeeb93fad6f", date: "2025-06-23", task: "Projet Client 1" },
  { memberId: "6820d9789f2baaeeb93fad6f", date: "2025-06-24", task: "Client ee" },
  { memberId: "6820d9789f2baaeeb93fad6f", date: "2025-06-25", task: "TMA Client 1" },
  { memberId: "6820db3af922822b3a40dbb6", date: "2025-06-22", task: "TMA Client 2" },
  { memberId: "6820db3af922822b3a40dbb6", date: "2025-06-23", task: "TMA Client 2" },
  { memberId: "6820db3af922822b3a40dbb6", date: "2025-06-24", task: "Projet Client 2" },
  { memberId: "68324bd5b1925a8801633df6", date: "2025-06-22", task: "TMA Client 3" },
  { memberId: "68324bd5b1925a8801633df6", date: "2025-06-23", task: "TMA Client 2" },
  { memberId: "68324bd5b1925a8801633df6", date: "2025-06-24", task: "Projet Client 1" },
];

const getColor = (task: string) => {
  if (task.includes("TMA")) return "#FFA500"; // orange
  if (task.includes("Client ee")) return "#FFFF00"; // yellow
  if (task.includes("Projet Client 1")) return "#00FF00"; // green
  if (task.includes("Projet Client 2")) return "#00BFFF"; // light blue
  if (task.includes("Projet Client 3")) return "#7C4DFF"; // purple
  if (task.includes("TMA Client 1")) return "#FF9900"; // darker orange
  if (task.includes("TMA Client 2")) return "#FF6600"; // red orange
  if (task.includes("TMA Client 3")) return "#CCCCCC"; // gray
  return "#E0E0E0"; // default gray
};

const StaffingCalendar = () => {
  const [startDate, setStartDate] = useState(dayjs("2025-06-22"));
  const [searchName, setSearchName] = useState("");
  const [viewMode, setViewMode] = useState("perDay");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const selectedTeamMembers = useSelector((state) => state.team.team);
  const [teamMembers, setTeamMembers] = useState([]);
  const [openSnackbar, setOpenSnackbar] = React.useState(false); // Snackbar state
  const [snackbarMessage, setSnackbarMessage] = React.useState(""); // Message for Snackbar
  const error = useSelector((state) => state.team.error);
  const [errorState, setErrorState] = useState(null);

  useEffect(() => {
    if (selectedTeamMembers.length !== 0) {
      const teamMembersMap = selectedTeamMembers.map((member) => ({
        _id: member?._id,
        fullName: member?.fullName,
        avatar: BACKEND_URL + member?.profilePicture,
      }));
      setTeamMembers(teamMembersMap);
    }
  }, [selectedTeamMembers]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getAllTeamMembers());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  const daysToShow = 14; // 2 weeks
  const dates = Array.from({ length: daysToShow }).map((_, i) =>
    startDate.add(i, "day").format("YYYY-MM-DD")
  );

  const filteredMembers = teamMembers.filter((member) =>
    member.fullName.toLowerCase().includes(searchName.toLowerCase())
  );

  const handlePrev = () => {
    if (viewMode === "perMonth") {
      setStartDate(startDate.subtract(1, "month"));
    } else {
      setStartDate(startDate.subtract(daysToShow, "day"));
    }
  };

  const handleNext = () => {
    if (viewMode === "perMonth") {
      setStartDate(startDate.add(1, "month"));
    } else {
      setStartDate(startDate.add(daysToShow, "day"));
    }
  };

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: string
  ) => {
    if (newView) {
      setViewMode(newView);
    }
  };

  const calculateAssignedDaysPerWeek = (memberId: number) => {
    const memberAssignments = assignments.filter(
      (a) => a.memberId === memberId
    );
    const weeks = Array.from({ length: 2 }).map((_, i) =>
      memberAssignments.filter((a) =>
        dayjs(a.date).isBetween(
          startDate.add(i * 7, "days"),
          startDate.add((i + 1) * 7 - 1, "days"),
          null,
          "[]"
        )
      )
    );

    return weeks.map((week, index) => {
      const taskCount: Record<string, number> = {};

      // Count tasks per week
      week.forEach((assignment) => {
        const task = assignment.task;
        if (!taskCount[task]) {
          taskCount[task] = 1;
        } else {
          taskCount[task]++;
        }
      });

      return {
        week: `Week ${index + 1}`,
        totalAssignedDays: new Set(
          week.map((a) => dayjs(a.date).format("YYYY-MM-DD"))
        ).size,
        taskBreakdown: taskCount,
      };
    });
  };

  const calculateAssignedDaysPerMonth = (memberId: number) => {
    const memberAssignments = assignments.filter(
      (a) => a.memberId === memberId
    );
    const totalAssignedDays = new Set(
      memberAssignments.map((a) => dayjs(a.date).format("YYYY-MM-DD"))
    ).size;

    const taskBreakdown: Record<string, number> = {};
    memberAssignments.forEach((assignment) => {
      const task = assignment.task;
      if (!taskBreakdown[task]) {
        taskBreakdown[task] = 1;
      } else {
        taskBreakdown[task]++;
      }
    });

    return {
      totalAssignedDays,
      taskBreakdown,
    };
  };

  return (
    <Box m="20px">
      <Typography variant="h4" mb={2}>
        Staffing Calendar
      </Typography>

      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <input
          type="text"
          placeholder="Search by member name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{
            padding: "8px",
            fontSize: "14px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "250px",
          }}
        />
        <IconButton
          onClick={handlePrev}
          size="small"
          sx={{
            backgroundColor: "#f0f0f0",
            borderRadius: "50%",
            padding: "5px",
            fontSize: "18px",
            width: "35px",
          }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography>
          {viewMode === "perMonth"
            ? `${startDate.format("MMMM YYYY")}`
            : `${startDate.format("MMM D, YYYY")} - ${startDate
                .add(daysToShow - 1, "day")
                .format("MMM D, YYYY")}`}
        </Typography>
        <IconButton
          onClick={handleNext}
          size="small"
          sx={{
            backgroundColor: "#f0f0f0",
            borderRadius: "50%",
            padding: "5px",
            fontSize: "18px",
            width: "35px",
          }}
        >
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      <Box mb={2}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
        >
          <ToggleButton value="perDay">Per Day</ToggleButton>
          <ToggleButton value="perWeek">Per Week</ToggleButton>
          <ToggleButton value="perMonth">Per Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Team Member</TableCell>
              {viewMode === "perDay" &&
                dates.map((date) => (
                  <TableCell key={date} align="center">
                    {dayjs(date).format("DD/MM")}
                  </TableCell>
                ))}
              {viewMode === "perWeek" && <TableCell>Summary</TableCell>}
              {viewMode === "perMonth" && <TableCell>Summary</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member._id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <IconButton
                      onClick={() => navigate(`/assignements/${member._id}/edit`)} // Navigate to the edit assignments page
                      sx={{
                        mr: 1,
                        width: 25,
                        height: 25,
                        padding: 0,
                        minWidth: "auto",
                      }}
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Avatar src={member.avatar} sx={{ mr: 1 }} />
                    {member.fullName}
                  </Box>
                </TableCell>
                {viewMode === "perDay" &&
                  dates.map((date) => {
                    const assignment = assignments.find(
                      (a) => a.memberId === member._id && a.date === date
                    );
                    return (
                      <TableCell key={date} align="center">
                        {assignment && (
                          <Box
                            sx={{
                              backgroundColor: getColor(assignment.task),
                              borderRadius: "20px",
                              padding: "4px 8px",
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "black",
                            }}
                          >
                            {assignment.task}
                          </Box>
                        )}
                      </TableCell>
                    );
                  })}
                {viewMode === "perWeek" && (
                  <TableCell>
                    {calculateAssignedDaysPerWeek(member._id).map((week) => (
                      <Box key={week.week}>
                        <Typography variant="body2" fontWeight="bold">
                          {week.week}:
                        </Typography>
                        <Typography variant="body2">
                          Total Days Assigned: {week.totalAssignedDays}
                        </Typography>
                        {Object.entries(week.taskBreakdown).map(
                          ([task, count]) => (
                            <Typography
                              key={task}
                              variant="caption"
                              display="block"
                            >
                              {task}: {count} days
                            </Typography>
                          )
                        )}
                      </Box>
                    ))}
                  </TableCell>
                )}
                {viewMode === "perMonth" && (
                  <TableCell>
                    {calculateAssignedDaysPerMonth(member._id) && (
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          Total Assigned Days:{" "}
                          {
                            calculateAssignedDaysPerMonth(member._id)
                              .totalAssignedDays
                          }
                        </Typography>
                        {Object.entries(
                          calculateAssignedDaysPerMonth(member._id)
                            .taskBreakdown
                        ).map(([task, count]) => (
                          <Typography
                            key={task}
                            variant="caption"
                            display="block"
                          >
                            {task}: {count} days
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StaffingCalendar;
