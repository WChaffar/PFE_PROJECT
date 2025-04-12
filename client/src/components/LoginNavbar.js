import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import logo from '../img/SopraHR_Noir.png';
import "../css/Navbar.css";
import {useDispatch} from "react-redux"
import { resetState } from "../actions/authAction";

const NavbarComponent = ({ showModeratorBoard, showAdminBoard, currentUser, logOut }) => {
  const location = useLocation();
  const dispatch=useDispatch();

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar expand="lg" bg="light" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="Logo" height="50" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {showModeratorBoard && (
              <Nav.Link as={Link} to="/mod" active={isActive("/mod")}>
                Moderator Board
              </Nav.Link>
            )}
            {showAdminBoard && (
              <Nav.Link as={Link} to="/admin" active={isActive("/admin")}>
                Admin Board
              </Nav.Link>
            )}
            {currentUser && (
              <Nav.Link as={Link} to="/user" active={isActive("/user")}>
                User
              </Nav.Link>
            )}
          </Nav>
          <Nav className="ml-auto">
  <Nav.Item>
    <Button
      as={Link}
      to="/login"
      className={`btn-login ${isActive("/login") ? "active" : ""}`}
      onClick={() => {
        // renitialize the state
        dispatch(resetState());
      }}
    >
      Login
    </Button>
  </Nav.Item>

  <Nav.Item>
    <Button
      as={Link}
      to="/register"
      className={`btn-signup ${isActive("/register") ? "active" : ""}`}
      onClick={() => {
        // renitialize the state
        dispatch(resetState());
      }}
    >
      Sign Up
    </Button>
  </Nav.Item>
</Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;
