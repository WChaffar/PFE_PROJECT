import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import '../css/Login.css'; // Import the Login CSS file
import LogoImg from "../img/app_logo.png"

const LoginForm = () => {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const initialValues = {
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, "Username must be between 3 and 20 characters.")
      .max(20, "Username must be between 3 and 20 characters.")
      .required("This field is required!"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters.")
      .max(40, "Password must be at most 40 characters.")
      .required("This field is required!"),
  });

  const handleLogin = (values, { setSubmitting }) => {
    setMessage("");
    // Here you can handle the login logic, e.g., call an API for authentication
    console.log("Login details", values);
    
    // Simulate a successful login (you can replace this with your real logic)
    setTimeout(() => {
      setMessage("Login successful!");
      setSubmitting(false);
      navigate("/home"); // Redirect to home page after successful login
    }, 1000); // Simulating a network request delay
  };

  return (
    <div className="login-form-page"> 
    <div className="login-form-container">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleLogin}
      >
        {({ isSubmitting }) => (
          <Form className="login-form">
            <div className="logo-container">
              <img src={LogoImg} alt="Logo" className="logo" /> {/* Replace with your logo path */}
            </div>

            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <Field
                type="text"
                id="username"
                name="username"
                className="form-control"
              />
              <ErrorMessage
                name="username"
                component="div"
                className="invalid-feedback d-block"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <Field
                type="password"
                id="password"
                name="password"
                className="form-control"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="invalid-feedback d-block"
              />
            </div>

            {message && (
              <div className="form-group">
                <div
                  className="alert alert-success"
                  role="alert"
                >
                  {message}
                </div>
              </div>
            )}

            <div className="form-group">
              <button type="submit" className="button" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
    </div>
  );
};

export default LoginForm;
