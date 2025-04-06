import React, { useState, useEffect } from "react";
import UserService from "../services/user.service";
import '../css/Home.css';  // Import your CSS file

const Home = () => {
  const [content, setContent] = useState("Optimize your project management and team staffing with our intuitive and powerful application.");


  return (
    <div className="home-container">
      <div className="content">
        <h1>Project Management & Staffing Optimization</h1>
        <p>{content}</p>
      </div>
    </div>
  );
};

export default Home;
