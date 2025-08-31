const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();
const dotenv = require("dotenv").config();
const PORT = 5000;
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const authRouter = require("./routes/authRoute");
const projectRouter = require("./routes/projectRoute");
const teamRouter = require("./routes/teamRoute");
const taskRouter = require("./routes/taskRoute");
const assignementRouter = require("./routes/assignementRoute");
const BusinessUnitRouter = require("./routes/BusinessUnitRoute");
const AbsenceRouter = require("./routes/absenceRoute");
const notificationsRouter = require("./routes/notificationsRoute");

const path = require("path");

dbConnect();
app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/user", authRouter);
app.use("/api/project", projectRouter);
app.use("/api/team", teamRouter);
app.use("/api/task", taskRouter);
app.use("/api/assignement", assignementRouter);
app.use("/api/BusinessUnit", BusinessUnitRouter);
app.use("/api/Absence", AbsenceRouter);
app.use("/api/Notifications", notificationsRouter);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running  at PORT ${PORT}`);
});
