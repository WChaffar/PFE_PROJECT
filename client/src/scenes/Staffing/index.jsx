import { useState } from "react";
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
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { useNavigate } from "react-router-dom";

dayjs.extend(isBetween);

const teamMembers = [
  { id: 1, name: "Sarah Wilson", avatar: "https://i.pravatar.cc/300?img=1", grade: "Senior", team: "A" },
  { id: 2, name: "John Doe", avatar: "https://i.pravatar.cc/300?img=2", grade: "Junior", team: "B" },
  { id: 3, name: "Alex Arnold", avatar: "https://i.pravatar.cc/300?img=3", grade: "Mid", team: "A" },
  { id: 4, name: "Jad Piquer", avatar: "https://i.pravatar.cc/300?img=4", grade: "Junior", team: "B" },
  { id: 5, name: "Mark Musk", avatar: "https://i.pravatar.cc/300?img=5", grade: "Senior", team: "C" },
  { id: 6, name: "Emily Davis", avatar: "https://i.pravatar.cc/300?img=6", grade: "Mid", team: "A" },
  { id: 7, name: "Tommy Lee", avatar: "https://i.pravatar.cc/300?img=7", grade: "Junior", team: "C" },
  { id: 8, name: "Jessica Martinez", avatar: "https://i.pravatar.cc/300?img=8", grade: "Senior", team: "B" },
];

const assignments = [
  { memberId: 1, date: "2025-06-22", task: "TMA" },
  { memberId: 1, date: "2025-06-23", task: "Projet Client 1" },
  { memberId: 1, date: "2025-06-24", task: "Client ee" },
  { memberId: 1, date: "2025-06-25", task: "TMA Client 1" },
  { memberId: 2, date: "2025-06-22", task: "TMA Client 2" },
  { memberId: 2, date: "2025-06-23", task: "TMA Client 2" },
  { memberId: 2, date: "2025-06-24", task: "Projet Client 2" },
  { memberId: 3, date: "2025-06-22", task: "TMA Client 3" },
  { memberId: 3, date: "2025-06-23", task: "TMA Client 2" },
  { memberId: 3, date: "2025-06-24", task: "Projet Client 1" },
  { memberId: 4, date: "2025-06-22", task: "TMA Client 3" },
  { memberId: 4, date: "2025-06-23", task: "TMA Client 2" },
  { memberId: 4, date: "2025-06-24", task: "Client ee" },
  { memberId: 5, date: "2025-06-22", task: "Client ee" },
  { memberId: 5, date: "2025-06-23", task: "TMA Projet" },
  { memberId: 5, date: "2025-06-24", task: "Projet Client 3" },
  { memberId: 6, date: "2025-06-22", task: "Client ee" },
  { memberId: 6, date: "2025-06-23", task: "TMA Client 2" },
  { memberId: 6, date: "2025-06-24", task: "Projet Client 2" },
  { memberId: 7, date: "2025-06-22", task: "TMA Client 1" },
  { memberId: 7, date: "2025-06-23", task: "Client ee" },
  { memberId: 7, date: "2025-06-24", task: "TMA Client 2" },
  { memberId: 8, date: "2025-06-22", task: "TMA Client 3" },
  { memberId: 8, date: "2025-06-23", task: "TMA Client 3" },
  { memberId: 8, date: "2025-06-24", task: "Projet Client 1" },
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

  const daysToShow = 14; // 2 weeks
  const dates = Array.from({ length: daysToShow }).map((_, i) =>
    startDate.add(i, "day").format("YYYY-MM-DD")
  );

  const filteredMembers = teamMembers.filter((member) =>
    member.name.toLowerCase().includes(searchName.toLowerCase())
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

  const handleViewChange = (event: React.MouseEvent<HTMLElement>, newView: string) => {
    if (newView) {
      setViewMode(newView);
    }
  };

  const calculateAssignedDaysPerWeek = (memberId: number) => {
    const memberAssignments = assignments.filter((a) => a.memberId === memberId);
    const weeks = Array.from({ length: 2 }).map((_, i) =>
      memberAssignments.filter((a) =>
        dayjs(a.date).isBetween(startDate.add(i * 7, "days"), startDate.add((i + 1) * 7 - 1, "days"), null, "[]")
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
        totalAssignedDays: new Set(week.map(a => dayjs(a.date).format("YYYY-MM-DD"))).size,
        taskBreakdown: taskCount,
      };
    });
  };

  const calculateAssignedDaysPerMonth = (memberId: number) => {
    const memberAssignments = assignments.filter((a) => a.memberId === memberId);
    const totalAssignedDays = new Set(memberAssignments.map(a => dayjs(a.date).format("YYYY-MM-DD"))).size;
    
    const taskBreakdown: Record<string, number> = {};
    memberAssignments.forEach(assignment => {
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
      <Typography variant="h4" mb={2}>Staffing Calendar</Typography>

      <Box display="flex" alignItems="center" mb={2} gap={2}>
        <input
          type="text"
          placeholder="Search by member name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{
            padding: '8px',
            fontSize: '14px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            width: '250px',
          }}
        />
        <IconButton onClick={handlePrev} size="small" sx={{ backgroundColor: "#f0f0f0", borderRadius: "50%", padding: "5px", fontSize: "18px", width:"35px" }}>
          <ArrowBackIosNewIcon />
        </IconButton>
        <Typography>
          {viewMode === "perMonth"
            ? `${startDate.format("MMMM YYYY")}`
            : `${startDate.format("MMM D, YYYY")} - ${startDate.add(daysToShow - 1, "day").format("MMM D, YYYY")}`}
        </Typography>
        <IconButton onClick={handleNext} size="small" sx={{ backgroundColor: "#f0f0f0", borderRadius: "50%", padding: "5px", fontSize: "18px", width:"35px" }}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      <Box mb={2}>
        <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} aria-label="view mode">
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
              {viewMode === "perDay" && dates.map((date) => (
                <TableCell key={date} align="center">{dayjs(date).format("DD/MM")}</TableCell>
              ))}
              {viewMode === "perWeek" && <TableCell>Summary</TableCell>}
              {viewMode === "perMonth" && <TableCell>Summary</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <IconButton
                      onClick={() => navigate("/assignements/12345/edit")} // Navigate to the edit assignments page
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
                    {member.name}
                  </Box>
                </TableCell>
                {viewMode === "perDay" && dates.map((date) => {
                  const assignment = assignments.find(
                    (a) => a.memberId === member.id && a.date === date
                  );
                  return (
                    <TableCell key={date} align="center">
                      {assignment && (
                        <Box sx={{
                          backgroundColor: getColor(assignment.task),
                          borderRadius: "20px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          color: "black",
                        }}>
                          {assignment.task}
                        </Box>
                      )}
                    </TableCell>
                  );
                })}
                {viewMode === "perWeek" && (
                  <TableCell>
                    {calculateAssignedDaysPerWeek(member.id).map((week) => (
                      <Box key={week.week}>
                        <Typography variant="body2" fontWeight="bold">{week.week}:</Typography>
                        <Typography variant="body2">Total Days Assigned: {week.totalAssignedDays}</Typography>
                        {Object.entries(week.taskBreakdown).map(([task, count]) => (
                          <Typography key={task} variant="caption" display="block">
                            {task}: {count} days
                          </Typography>
                        ))}
                      </Box>
                    ))}
                  </TableCell>
                )}
                {viewMode === "perMonth" && (
                  <TableCell>
                    {calculateAssignedDaysPerMonth(member.id) && (
                      <Box>
                        <Typography variant="body2" fontWeight="bold">Total Assigned Days: {calculateAssignedDaysPerMonth(member.id).totalAssignedDays}</Typography>
                        {Object.entries(calculateAssignedDaysPerMonth(member.id).taskBreakdown).map(([task, count]) => (
                          <Typography key={task} variant="caption" display="block">
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
