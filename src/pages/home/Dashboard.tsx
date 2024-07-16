import React from "react";
// import { Link, To } from "react-router-dom";
// import { Button } from "react-bootstrap";
import "./Dashboard.css"; // Importing the CSS file

// const allModelsPath = "/models/all";
// const medicalHomepage = "/medicalHomepage";

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="dashboard-container">
        <div className="background-wrapper">
          <img
            decoding="async"
            className="background-image"
            src="/Banner.jpg"
            alt="Background"
          />
          <div className="overlay d-flex align-items-center">
            <div className="text-container text-start text-white p-5">
              <div className="heading-wrapper mb-4">
                <img
                  decoding="async"
                  className="spatial-image"
                  src="/Spatial_Logo.png"
                  alt="spatial"
                  height={120}
                />
                <br />
                <br />
                <h1 className="h4" style={{ color: "#009999" }}>
                  <span>
                    Achieving trustworthy, transparent and explainable AI
                  </span>
                  <br />
                  <span>for cybersecurity solutions</span>
                </h1>
              </div>{" "}
              <br />
              <div className="card-container ">
                <p className="h2">
                  <span>
                    <b>PRIVACY.</b>
                  </span>
                  <br />
                  <span>
                    {" "}
                    <b>ACCOUNTABILITY.</b>
                  </span>
                  <br />
                  <span>
                    {" "}
                    <b>RESILIENCE.</b>
                  </span>
                </p>
              </div>
              <br />
              <br />
              <br />
              <br />
              <br />
              <div className="card-container">
                <img
                  decoding="async"
                  className="funded"
                  src="/Funded.png"
                  alt="funded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
