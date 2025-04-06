import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, Button } from "react-bootstrap";
import logo from '../img/SopraHR_Noir.png';
import "../css/Navbar.css";

const NavbarComponent = ({ showModeratorBoard, showAdminBoard, currentUser, logOut }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar bg="light" expand="lg" className="navbar-light" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)" }}>
      <Link to={"/"} className="navbar-brand">
        <img src={logo} alt="Logo" style={{ height: "50px" }} />
      </Link>

      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav">
        <Nav className="mr-auto">
          {showModeratorBoard && (
            <Nav.Item>
              <Link to={"/mod"} className={`nav-link ${isActive("/mod") ? "active-mobile" : ""}`}>
                Moderator Board
              </Link>
            </Nav.Item>
          )}

          {showAdminBoard && (
            <Nav.Item>
              <Link to={"/admin"} className={`nav-link ${isActive("/admin") ? "active-mobile" : ""}`}>
                Admin Board
              </Link>
            </Nav.Item>
          )}

          {currentUser && (
            <Nav.Item>
              <Link to={"/user"} className={`nav-link ${isActive("/user") ? "active-mobile" : ""}`}>
                User
              </Link>
            </Nav.Item>
          )}
        </Nav>

        {currentUser ? (
          <Nav className="ml-auto">
            <Nav.Item>
              <Link to={"/profile"} className={`nav-link ${isActive("/profile") ? "active-mobile" : ""}`}>
                {currentUser.username}
              </Link>
            </Nav.Item>
            <Nav.Item>
              <Button
                variant="link"
                className="nav-link logout-btn"
                onClick={logOut}
              >
                LogOut
              </Button>
            </Nav.Item>
          </Nav>
        ) : (
          <Nav className="ml-auto">
            <Nav.Item>
              <Link to={"/login"} className="nav-link">
                <Button
                  variant="dark"
                  className={`btn-login ${isActive("/login") ? "active-mobile" : ""}`}
                >
                  Login
                </Button>
              </Link>
            </Nav.Item>

            <Nav.Item>
              <Link to={"/register"} className="nav-link">
                <Button
                  variant="outline-dark"
                  className={`btn-signup ${isActive("/register") ? "active-mobile" : ""}`}
                >
                  Sign Up
                </Button>
              </Link>
            </Nav.Item>
          </Nav>
        )}
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavbarComponent;
