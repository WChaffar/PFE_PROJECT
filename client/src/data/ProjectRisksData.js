// Sample data for Project Risks related to deadlines, team capacity, etc.
export const projectRisks = [
    {
      riskId: "1",
      title: "Project Deadline Overrun",
      description:
        "The project may exceed the planned deadlines due to unforeseen delays in deliverables.",
      impact: "High",
      status: "Open",
      dateIdentified: "2025-04-10",
      daysOverdue: 5,
    },
    {
      riskId: "2",
      title: "Team Capacity Shortage",
      description:
        "The current team capacity is insufficient to meet the project demands, resulting in delays.",
      impact: "High",
      status: "Open",
      dateIdentified: "2025-04-08",
    },
    {
      riskId: "3",
      title: "Unrealistic Deadlines Set by Stakeholders",
      description:
        "Stakeholders have imposed unrealistic deadlines, making it difficult for the team to deliver quality results on time.",
      impact: "High",
      status: "Mitigated",
      dateIdentified: "2025-04-05",
    },
    {
      riskId: "4",
      title: "Delayed Deliverables from Vendor",
      description:
        "Delays in the delivery of components from the vendor could affect the overall project timeline.",
      impact: "Medium",
      status: "Open",
      dateIdentified: "2025-04-03",
    },
    {
      riskId: "5",
      title: "Overworked Team Members",
      description:
        "Team members are being overworked due to tight deadlines, leading to burnout and reduced productivity.",
      impact: "Medium",
      status: "Mitigated",
      dateIdentified: "2025-03-25",
    },
  ];
  
  export const projectRiskcolors = {
    primary: ["#1976d2", "#1565c0", "#0d47a1"],
    grey: ["#e0e0e0", "#bdbdbd", "#9e9e9e", "#616161", "#212121"],
    redAccent: ["#f44336", "#e57373", "#d32f2f"],
    yellowAccent: ["#ffeb3b", "#fbc02d", "#f57f17"],
    greenAccent: ["#4caf50", "#388e3c", "#2c6f2f"],
  };