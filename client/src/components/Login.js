import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import '../css/Login.css'; // Import the Login CSS file
import LogoImg from "../img/app_logo.png"
import { useDispatch, useSelector } from 'react-redux';
import { login } from "../actions/authAction";
// ... imports remain unchanged
import { useEffect } from 'react';

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const error = useSelector((state) => state.auth.error); // from authReducer
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // optional for redirect

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      setMessage("Login successful!");
      navigate("/Dashboard");
    }
  }, [isAuthenticated, navigate]);

  const initialValues = {
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email address.")
      .required("This field is required!"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters.")
      .max(40, "Password must be at most 40 characters.")
      .required("This field is required!"),
  });

  const handleLogin = (values, { setSubmitting }) => {
    dispatch(login(values));
    setSubmitting(false); // stop spinner even if login fails
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
                <img src={LogoImg} alt="Logo" className="logo" />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <Field type="email" id="email" name="email" className="form-control" />
                <ErrorMessage name="email" component="div" className="invalid-feedback d-block" />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <Field type="password" id="password" name="password" className="form-control" />
                <ErrorMessage name="password" component="div" className="invalid-feedback d-block" />
              </div>
              <br/>

              {/* Success message (after login) */}
              {message && (
                <div className="form-group">
                  <div className="alert alert-success" role="alert">
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

              <br />
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

