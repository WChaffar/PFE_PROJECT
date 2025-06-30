import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "../css/Register.css"; // Import the Register CSS file
import LogoImg from "../img/app_logo.png";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../actions/authAction"; // Make sure you import the correct action
import { Box } from "@mui/material";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");

  // Get error from Redux store
  const error = useSelector((state) => state.auth.error); // Assuming error is in authReducer

  const initialValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "", // Add role here
  };

  const validationSchema = Yup.object({
    fullName: Yup.string()
      .min(3, "FullName must be between 3 and 45 characters.")
      .max(45, "FullName must be between 3 and 45 characters.")
      .required("This field is required!"),
    email: Yup.string()
      .email("Invalid email address.")
      .required("This field is required!"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters.")
      .max(40, "Password must be at most 40 characters.")
      .required("This field is required!"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match") // Passwords must match
      .required("This field is required!"),
    role: Yup.string().required("Please select a role."),
  });

  const handleRegister = (values, { setSubmitting }) => {
    setMessage("");

    // Dispatch register action
    dispatch(
      register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: values.role,
      })
    )
      .then((response) => {})
      .catch((error) => {
        // Handle error (e.g., email already taken)
        setMessage(error.message || "An error occurred during registration.");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <div className="register-form-page">
      <div className="register-form-container">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting }) => (
            <Form className="register-form">
              <div className="logo-container">
                <img src={LogoImg} alt="Logo" className="logo" />
              </div>
              {/* Full Name Field */}
              <div className="form-group">
                <label htmlFor="fullName">Full Name:</label>
                <Field
                  type="text"
                  id="fullName"
                  name="fullName"
                  className="form-control"
                />
                <ErrorMessage
                  name="fullName"
                  component="div"
                  className="invalid-feedback d-block"
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <Field
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="invalid-feedback d-block"
                />
              </div>

              {/* Password Field */}
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

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-control"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="invalid-feedback d-block"
                />
              </div>
              <br />
              {/* role  */}
              <label htmlFor="role">Rôle:</label>
              <br />
              <div role="group" className="form-group">
                <label>
                  <Field type="radio" name="role" value="Consultant" />
                  Consultant
                </label>
                <label>
                  <Field type="radio" name="role" value="Manager" />
                  Manager
                </label>
                <label>
                  <Field type="radio" name="role" value="BUDirector" />
                  BU director
                </label>
                <ErrorMessage
                  name="role"
                  component="div"
                  className="invalid-feedback d-block"
                />
              </div>

              <br />
              {/* Success or error messages */}
              {message && (
                <div className="form-group">
                  <div
                    className={
                      message.includes("successful")
                        ? "alert alert-success"
                        : "alert alert-danger"
                    }
                    role="alert"
                  >
                    {message}
                  </div>
                </div>
              )}

              {/* Redux error message */}
              {error && (
                <div className="form-group">
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                </div>
              )}

              <div className="form-group">
                <button
                  type="submit"
                  className="button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    "Register"
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

export default RegisterForm;
