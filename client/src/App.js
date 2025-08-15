import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { Provider, useSelector } from "react-redux";
import store from "./store";

import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";

import Dashboard from "./scenes/dashboard";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import NotFound from "./components/NotFound";
import Navbar from "./components/LoginNavbar";

import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Projects from "./scenes/Projects";
import CreateProjectForm from "./scenes/CreateProjectForm";
import ProjectDetails from "./scenes/ProjectDetails";
import EditProjectForm from "./scenes/EditProjectForm";
import Team from "./scenes/team";
import CreateTeamMemberForm from "./scenes/CreateTeamMemberForm";
import EditTeamMemberForm from "./scenes/EditTeamMember";
import TeamMemberProfile from "./scenes/TeamMemberProfile/index";
import StaffingBoard from "./scenes/Staffing";
import EditStaffing from "./scenes/EditAssignement";
import TaskManagement from "./scenes/tasks";
import CreateTaskForm from "./scenes/AddTasksForm";
import TaskDetails from "./scenes/TaskDétails";
import EditTaskForm from "./scenes/EditTaskForm";
import TimeTracking from "./scenes/TimeTracking";
import Reports from "./scenes/Reports";
import AwaitingValidation from "./components/AwaitingValidation";
import ReviewAccounts from "./scenes/ReviewAccounts";
import ReviewBU from "./scenes/ReviewBU";
import CreateBUForm from "./scenes/AddBuForm";
import ModifyBUForm from "./scenes/ModifyBuForm";
import MyAbsences from "./scenes/MyAbsences";
import AddAbsence from "./scenes/AddAbsence";
import EditAbsence from "./scenes/EditAbsence";
import AssignementsViewEmployee from "./scenes/AssignementsViewEmployee";
import CompleteEmployeeProfile from "./scenes/CompleteEmployeeProfile";
import ProjectsBU from "./scenes/ProjectsBu";
import DelegateAManager from "./scenes/DelegateAManager";

function PrivateRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AuthRedirect({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isActivated = useSelector((state) => state.auth.user?.Activated);
  const role = useSelector((state) => state.auth.user?.role);
  const profileCompleted = useSelector(
    (state) => state.auth.user?.profileCompleted
  );
  return isAuthenticated ? (
    isActivated === true ? (
      role === "RH" ? (
        <Navigate to="/review-accounts" replace />
      ) : role === "Employee" ? (
        profileCompleted === true ? (
          <Navigate to="/my-absences" replace />
        ) : (
          <Navigate to="/complete-my-profile" replace />
        )
      ) : (
        <Navigate to="/dashboard" replace />
      )
    ) : (
      <Navigate to="/AwaitingValidation" replace />
    )
  ) : (
    children
  );
}

function AppContent() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isActivated = useSelector((state) => state.auth.user?.Activated);
  const user = useSelector((state) => state.auth.user);
  const profileCompleted = useSelector(
    (state) => state.auth.user?.profileCompleted
  );
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* Show Navbar only when not authenticated */}
        {!isAuthenticated && <Navbar />}

        <div className={isAuthenticated ? "app" : ""}>
          {isAuthenticated && isActivated && <Sidebar isSidebar={isSidebar} />}

          <main className={isAuthenticated ? "content" : ""}>
            {isAuthenticated && isActivated && (
              <Topbar setIsSidebar={setIsSidebar} />
            )}

            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    isActivated ? (
                      <Navigate to="/dashboard" replace />
                    ) : (
                      <Navigate to="/AwaitingValidation" replace />
                    )
                  ) : (
                    <Home />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  <AuthRedirect>
                    <Login />
                  </AuthRedirect>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthRedirect>
                    <Register />
                  </AuthRedirect>
                }
              />

              {/* Private Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <PrivateRoute>
                    <Projects />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/create"
                element={
                  <PrivateRoute>
                    <CreateProjectForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/project/:id/details"
                element={
                  <PrivateRoute>
                    <ProjectDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/projects/project/:id/edit"
                element={
                  <PrivateRoute>
                    <EditProjectForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/team"
                element={
                  <PrivateRoute>
                    <Team />
                  </PrivateRoute>
                }
              />
              <Route
                path="/team/create"
                element={
                  <PrivateRoute>
                    <CreateTeamMemberForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/team/:id/edit"
                element={
                  <PrivateRoute>
                    <EditTeamMemberForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/team/:id/profile"
                element={
                  <PrivateRoute>
                    <TeamMemberProfile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assignements"
                element={
                  <PrivateRoute>
                    <StaffingBoard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/assignements/:id/edit"
                element={
                  <PrivateRoute>
                    <EditStaffing />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <TaskManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks/:id/create"
                element={
                  <PrivateRoute>
                    <CreateTaskForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks/:id/détails"
                element={
                  <PrivateRoute>
                    <TaskDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/tasks/:id/edit"
                element={
                  <PrivateRoute>
                    <EditTaskForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/timeTraking"
                element={
                  <PrivateRoute>
                    <TimeTracking />
                  </PrivateRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <PrivateRoute>
                    <Reports />
                  </PrivateRoute>
                }
              />
              <Route
                path="/AwaitingValidation"
                element={
                  <PrivateRoute>
                    <AwaitingValidation />
                  </PrivateRoute>
                }
              />
              {user?.role === "RH" && (
                <Route
                  path="/review-accounts"
                  element={
                    <PrivateRoute>
                      <ReviewAccounts />
                    </PrivateRoute>
                  }
                />
              )}
              {user?.role === "RH" && (
                <Route
                  path="/add-review-bu"
                  element={
                    <PrivateRoute>
                      <ReviewBU />
                    </PrivateRoute>
                  }
                />
              )}
              {user?.role === "RH" && (
                <Route
                  path="/add-bu"
                  element={
                    <PrivateRoute>
                      <CreateBUForm />
                    </PrivateRoute>
                  }
                />
              )}
              {user?.role === "RH" && (
                <Route
                  path="/modify-bu/:id"
                  element={
                    <PrivateRoute>
                      <ModifyBUForm />
                    </PrivateRoute>
                  }
                />
              )}
              {user?.role === "Employee" && profileCompleted && (
                <Route
                  path="/my-absences"
                  element={
                    <PrivateRoute>
                      <MyAbsences />
                    </PrivateRoute>
                  }
                />
              )}
              {user?.role === "Employee" && profileCompleted && (
                <Route
                  path="/add-absence"
                  element={
                    <PrivateRoute>
                      <AddAbsence />
                    </PrivateRoute>
                  }
                />
              )}
              {user?.role === "Employee" && profileCompleted && (
                <Route
                  path="/edit-my-absence/:id"
                  element={
                    <PrivateRoute>
                      <EditAbsence />
                    </PrivateRoute>
                  }
                />
              )}
              {user?.role === "Employee" && profileCompleted && (
                <Route
                  path="/my-assignments"
                  element={
                    <PrivateRoute>
                      <AssignementsViewEmployee />
                    </PrivateRoute>
                  }
                />
              )}

              {user?.role === "Employee" && !profileCompleted && (
                <Route
                  path="/complete-my-profile"
                  element={
                    <PrivateRoute>
                      <CompleteEmployeeProfile />
                    </PrivateRoute>
                  }
                />
              )}
              {user?.role === "BUDirector" && (
                <Route
                  path="/projects-bu"
                  element={
                    <PrivateRoute>
                      <ProjectsBU />
                    </PrivateRoute>
                  }
                />
              )}
              {user?.role === "BUDirector" && (
                <Route
                  path="/oversee-managers"
                  element={
                    <PrivateRoute>
                      <DelegateAManager />
                    </PrivateRoute>
                  }
                />
              )}
              {/* Catch-All Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
