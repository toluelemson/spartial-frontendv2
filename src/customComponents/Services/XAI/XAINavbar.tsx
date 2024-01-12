import React from "react";
import { Nav, Navbar as BootstrapNavbar } from "react-bootstrap";
import { Link, To } from "react-router-dom";

const metricsHomepage = "/XAI/XAIHomepage";

const XAINavbar: React.FC = () => {
  return (
    <>
      <Link to={metricsHomepage} className="nav-link text-lightblue fs-5">
        XAI Service
      </Link>
      <BootstrapNavbar expand="lg" bg="dark" variant="dark">
        <br />
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/XAI/XAIHomepage">XAI</Nav.Link>
          </Nav>
        </BootstrapNavbar.Collapse>
      </BootstrapNavbar>{" "}
    </>
  );
};

export default XAINavbar;
