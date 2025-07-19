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
  Tooltip,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { BACKEND_URL } from "../../config/ServerConfig";
import {
  getAllTeamMembers,
  getAllTeamMembersForManager,
} from "../../actions/teamAction";
import { getAllEmployeeAssignements } from "../../actions/assignementsAction";
import { format } from "date-fns";

dayjs.extend(isBetween);

// const assignments = [
//   { memberId: "6863df8769346ca165b26978", date: "2025-06-22", task: "TMA" },
//   {
//     memberId: "6863df8769346ca165b26978",
//     date: "2025-06-23",
//     task: "Projet Client 1",
//   },
//   {
//     memberId: "6863df8769346ca165b26978",
//     date: "2025-06-24",
//     task: "Client ee",
//   },
//   {
//     memberId: "6863df8769346ca165b26978",
//     date: "2025-06-25",
//     task: "TMA Client 1",
//   },
//   {
//     memberId: "6863df8769346ca165b26978",
//     date: "2025-06-22",
//     task: "TMA Client 2",
//   },
//   {
//     memberId: "6863df8769346ca165b26978",
//     date: "2025-06-23",
//     task: "TMA Client 2",
//   },
//   {
//     memberId: "6863df8769346ca165b26978",
//     date: "2025-06-24",
//     task: "Projet Client 2",
//   },
//   {
//     memberId: "6863df8769346ca165b26978",
//     date: "2025-06-22",
//     task: "TMA Client 3",
//   },
//   {
//     memberId: "6863df8769346ca165b26978",
//     date: "2025-06-23",
//     task: "TMA Client 2",
//   },
//   {
//     memberId: "6863df8769346ca165b26978",
//     date: "2025-06-24",
//     task: "Projet Client 1",
//   },
// ];

function getColor(taskName) {
  if (!taskName) return "#ccc";

  // Convert to a number and spread hue over 360°
  const hash = [...taskName].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = (hash * 37) % 360;
  return `hsl(${hue}, 70%, 65%)`;
}

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
  const [assignments, setAssignements] = useState([]);
  const selectedAssignements = useSelector(
    (state) => state.assignements.assignements
  );

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
    if (selectedAssignements.length !== 0) {
      const assignementsMap = selectedAssignements?.flatMap((assignment) => {
        const memberId = assignment?.employee?._id;
        const task = assignment?.taskId?.taskName;
        const startDate = new Date(assignment?.startDate);
        const endDate = new Date(assignment?.endDate);
        const dayDetails = assignment?.dayDetails;
        const result = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
          result.push({
            memberId,
            date: currentDate.toISOString().split("T")[0], // YYYY-MM-DD format
            task,
            dayDetails,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        return result;
      });
      setAssignements(assignementsMap);
    }
  }, [selectedAssignements]); // <== Écoute les changements de selectedProjects

  useEffect(() => {
    dispatch(getAllTeamMembersForManager());
  }, [dispatch]); // <== Appelle une seule fois le fetch

  useEffect(() => {
    dispatch(getAllEmployeeAssignements());
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
      console.log(format(startDate, "yyyy-MM-dd"));
    } else {
      setStartDate(startDate.subtract(daysToShow, "day"));
    }
  };

  const handleNext = () => {
    if (viewMode === "perMonth") {
      setStartDate(startDate.add(1, "month"));
      console.log(format(startDate, "yyyy-MM-dd"));
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
      const taskCount = [];

      week.forEach((assignment) => {
        const date = dayjs(assignment.date);
        const day = date.day(); // 0 = dimanche, 6 = samedi

        if (day === 0 || day === 6) return; // ⛔ Ignore weekend

        const task = assignment.task;
        if (!taskCount[task]) {
          taskCount[task] = 1;
        } else {
          taskCount[task] += 1;
        }

        if (assignment?.dayDetails?.length > 0) {
          assignment?.dayDetails.forEach((dayDetail) => {
            const detailDay = dayjs(dayDetail.date?.$date || dayDetail.date);
            if (
              detailDay.isSame(date, "day") &&
              (dayDetail.period === "Morning" ||
                dayDetail.period === "Afternoon")
            ) {
              taskCount[task] -= 0.5;
            }
          });
        }
      });

      let totalAssignedDays = 0;
      for (let task in taskCount) {
        if (taskCount.hasOwnProperty(task)) {
          totalAssignedDays += taskCount[task];
        }
      }

      return {
        week: `Week ${index + 1}`,
        totalAssignedDays,
        taskBreakdown: taskCount,
      };
    });
  };

  const calculateAssignedDaysPerMonth = (memberId) => {
    // Get the start and end of the current month from startDate
    const monthStart = startDate.startOf("month");
    const monthEnd = startDate.endOf("month");

    // Filter assignments for this member AND inside current month
    const memberAssignments = assignments.filter((a) => {
      if (a.memberId !== memberId) return false;

      const date = dayjs(a.date);
      return date.isBetween(
        monthStart.subtract(1, "day"),
        monthEnd.add(1, "day"),
        null,
        "[]"
      );
    });

    const taskBreakdown = {};

    memberAssignments.forEach((assignment) => {
      const date = dayjs(assignment.date);
      const day = date.day(); // Sunday=0, Saturday=6
      if (day === 0 || day === 6) return; // skip weekends

      const task = assignment.task;
      if (!taskBreakdown[task]) {
        taskBreakdown[task] = 1;
      } else {
        taskBreakdown[task]++;
      }

      if (assignment?.dayDetails?.length > 0) {
        assignment.dayDetails.forEach((dayDetail) => {
          const detailDay = dayjs(dayDetail.date?.$date || dayDetail.date);
          if (
            detailDay.isSame(date, "day") &&
            (dayDetail.period === "Morning" || dayDetail.period === "Afternoon")
          ) {
            taskBreakdown[task] -= 0.5;
          }
        });
      }
    });

    let totalAssignedDaysMonth = 0;
    for (let task in taskBreakdown) {
      if (taskBreakdown.hasOwnProperty(task)) {
        totalAssignedDaysMonth += taskBreakdown[task];
      }
    }

    return {
      totalAssignedDays: totalAssignedDaysMonth,
      taskBreakdown,
    };
  };

  const isWeekend = (date) => {
    const day = dayjs(date).day(); // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
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
                  <TableCell
                    key={date}
                    align="center"
                    sx={{
                      backgroundColor: isWeekend(date) ? "#f5f5f5" : "inherit",
                      color: isWeekend(date) ? "#999" : "inherit",
                      fontWeight: isWeekend(date) ? "bold" : "normal",
                    }}
                  >
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
                      onClick={() =>
                        navigate(`/assignements/${member._id}/edit`)
                      } // Navigate to the edit assignments page
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
                    const isWeekend = (date) => {
                      const day = dayjs(date).day(); // 0 = Sunday, 6 = Saturday
                      return day === 0 || day === 6;
                    };

                    const dailyAssignments = isWeekend(date)
                      ? [] // ignore les assignments le week-end
                      : assignments.filter(
                          (a) => a.memberId === member._id && a.date === date
                        );

                    const morningAssignment = dailyAssignments.find((a) =>
                      a.dayDetails?.some(
                        (d) =>
                          d.period === "Morning" &&
                          format(
                            new Date(d.date.$date || d.date),
                            "yyyy-MM-dd"
                          ) === format(new Date(date), "yyyy-MM-dd")
                      )
                    );

                    const afternoonAssignment = dailyAssignments.find((a) =>
                      a.dayDetails?.some(
                        (d) =>
                          d.period === "Afternoon" &&
                          format(
                            new Date(d.date.$date || d.date),
                            "yyyy-MM-dd"
                          ) === format(new Date(date), "yyyy-MM-dd")
                      )
                    );

                    const fullDayAssignments =
                      !morningAssignment && !afternoonAssignment
                        ? dailyAssignments // fallback to first if full-day
                        : null;

                    return (
                      <TableCell
                        key={date}
                        align="center"
                        sx={{
                          backgroundColor: isWeekend(date)
                            ? "#fafafa"
                            : "inherit",
                          color: isWeekend(date) ? "#999" : "inherit",
                        }}
                      >
                        {morningAssignment || afternoonAssignment ? (
                          <Box display="flex" flexDirection="column" gap={0.5}>
                            {morningAssignment && (
                              <Tooltip title="Morning">
                                <Box
                                  sx={{
                                    backgroundColor: getColor(
                                      morningAssignment.task
                                    ),
                                    borderRadius: "20px",
                                    padding: "4px 6px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    color: "black",
                                    backgroundImage: `repeating-linear-gradient(45deg,${getColor(
                                      morningAssignment.task
                                    )} 0,${getColor(
                                      morningAssignment.task
                                    )} 4px,rgba(0,0,0,0.1) 4px,rgba(0,0,0,0.1) 8px)`,
                                  }}
                                >
                                  {morningAssignment.task}
                                </Box>
                              </Tooltip>
                            )}
                            {afternoonAssignment && (
                              <Tooltip title="Afternoon">
                                <Box
                                  sx={{
                                    backgroundColor: getColor(
                                      afternoonAssignment?.task
                                    ),
                                    borderRadius: "20px",
                                    padding: "4px 6px",
                                    fontSize: "12px",
                                    fontWeight: "bold",
                                    color: "black",
                                    backgroundImage: `repeating-linear-gradient(45deg,${getColor(
                                      morningAssignment?.task
                                    )} 0,${getColor(
                                      morningAssignment?.task
                                    )} 4px,rgba(0,0,0,0.1) 4px,rgba(0,0,0,0.1) 8px)`,
                                  }}
                                >
                                  {afternoonAssignment?.task}
                                </Box>
                              </Tooltip>
                            )}
                          </Box>
                        ) : (
                          fullDayAssignments.length > 0 &&
                          fullDayAssignments.map((fullDayAssignment) => (
                            <Tooltip
                              title="Full Day"
                              key={
                                fullDayAssignment.id || fullDayAssignment.task
                              }
                            >
                              <Box
                                sx={{
                                  backgroundColor: getColor(
                                    fullDayAssignment.task
                                  ),
                                  borderRadius: "20px",
                                  padding: "4px 8px",
                                  fontSize: "12px",
                                  fontWeight: "bold",
                                  color: "black",
                                  margin: "3px 0px",
                                }}
                              >
                                {fullDayAssignment.task}
                              </Box>
                            </Tooltip>
                          ))
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
                {viewMode === "perMonth" &&
                  (() => {
                    const monthSummary = calculateAssignedDaysPerMonth(
                      member._id
                    );

                    return (
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            Total Assigned Days:{" "}
                            {monthSummary.totalAssignedDays}
                          </Typography>
                          {Object.entries(monthSummary.taskBreakdown).map(
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
                      </TableCell>
                    );
                  })()}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StaffingCalendar;
