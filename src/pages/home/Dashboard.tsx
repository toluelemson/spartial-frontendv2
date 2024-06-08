import React from "react";
import { Link, To } from "react-router-dom";
import { Button } from "react-bootstrap";

const allModelsPath = "/models/all";
const medicalHomepage = "/medicalHomepage";

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="container my-4">
        <h1>Spatial Services</h1>
        <br />
        <div className="row">
          {/* Card for XAI   */}
          <div className="col-md-6 col-lg-4 mb-4">
            <div className="card">
              <div className="card-body text-black">
                <h3>XAI</h3>
                <div className="card-text">
                  <p>
                    XAI is a field of artificial intelligence (AI) that focuses
                    on making AI systems more transparent and understandable to
                    humans. AI models, particularly deep learning models, can be
                    highly complex and difficult to interpret.
                  </p>
                  <Button variant="primary">
                    <Link
                      to={allModelsPath}
                      className="nav-link text-lightblue fs-5"
                    >
                      XAI
                    </Link>
                  </Button>
                </div>
                <br />
              </div>
            </div>
          </div>

          {/* Card for Fairness   */}
          <div className="col-md-6 col-lg-4 mb-4">
            <div className="card">
              <div className="card-body text-black">
                <h3>Fairness</h3>
                <div className="card-text">
                  <p>
                    Fairness in AI refers to the ethical principle that AI
                    systems should treat all individuals or groups fairly and
                    without bias. AI systems can inadvertently perpetuate or
                    even exacerbate existing biases and inequalities present in
                    society.
                  </p>
                  <Button variant="primary">
                    <Link
                      to={allModelsPath}
                      className="nav-link text-lightblue fs-5"
                    >
                      Fairness
                    </Link>
                  </Button>
                </div>
                <br />
              </div>
            </div>
          </div>

          {/* Card for Medical Analysis   */}
          <div className="col-md-6 col-lg-4 mb-4">
            <div className="card">
              <div className="card-body text-black">
                <h3>Medical Analysis</h3>
                <div className="card-text">
                  <p>Fokus</p>
                  <Button variant="primary">
                    <Link
                      to={medicalHomepage}
                      className="nav-link text-lightblue fs-5"
                    >
                      Medical Analysis
                    </Link>
                  </Button>
                </div>
                <br />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
