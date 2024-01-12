import React from "react";
import { Nav, Navbar as BootstrapNavbar, NavDropdown } from "react-bootstrap";
import { Link, To } from "react-router-dom";

const metricsHomepage = "/Metrics/metricsHomepage";

const MetricsNavbar: React.FC = () => {
  return (
    <>
      <Link to={metricsHomepage} className="nav-link text-lightblue fs-5">
        Metrics Service
      </Link>
      <BootstrapNavbar expand="lg" bg="dark" variant="dark">
        <br />
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/Metrics/metricsHomepage">CLF Accuracy</Nav.Link>
            <Nav.Link href="/Metrics/ConsistencyMetric">Consistency</Nav.Link>
            <Nav.Link href="#">Compacity</Nav.Link>
            <Nav.Link href="/Metrics/EvasionImpact">Evasion Impact</Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </BootstrapNavbar>{" "}
    </>
  );
};

export default MetricsNavbar;
