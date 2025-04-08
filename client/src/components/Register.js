import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import '../css/Register.css';  // Import the Register CSS file
import LogoImg from "../img/app_logo.png";

const RegisterForm = () => {
  const [message, setMessage] = useState("");

  const initialValues = {
    username: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    username: Yup.string()
      .min(3, "Username must be between 3 and 20 characters.")
      .max(20, "Username must be between 3 and 20 characters.")
      .required("This field is required!"),
    email: Yup.string()
      .email("Invalid email address.")
      .required("This field is required!"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters.")
      .max(40, "Password must be at most 40 characters.")
      .required("This field is required!"),
  });

  const handleRegister = (values, { setSubmitting }) => {
    setMessage("");
    console.log("Register details", values);

    setTimeout(() => {
      setMessage("Registration successful!");
      setSubmitting(false);
    }, 1000); // Simulating a network request delay
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
                  <div className="alert alert-success" role="alert">
                    {message}
                  </div>
                </div>
              )}
               <br/>
              <div className="form-group">
                <button type="submit" className="button" disabled={isSubmitting}>
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
