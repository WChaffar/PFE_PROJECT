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

function PrivateRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AuthRedirect({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppContent() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* Show Navbar only when not authenticated */}
        {!isAuthenticated && <Navbar />}

        <div className={isAuthenticated ? "app" : ""}>
          {isAuthenticated && <Sidebar isSidebar={isSidebar} />}

          <main className={isAuthenticated ? "content" : ""}>
            {isAuthenticated && <Topbar setIsSidebar={setIsSidebar} />}

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Home />} />
              <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
              <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />

              {/* Private Routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
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
