import { useOktaAuth } from '@okta/okta-react';
import { Nav, Navbar, NavDropdown} from "react-bootstrap";

const NavBar: React.FC = () => {
    const { authState, oktaAuth } = useOktaAuth();

    const handleLogout = async () => {
        await oktaAuth.signOut();
    };

    if (!authState) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <Navbar expand="lg" className="bg-dark-custom text-white navbar-light">
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        {/* Separate Home link */}
                        <Nav className="me-auto">
                            <Nav.Link href="#home">Home</Nav.Link>
                        </Nav>
                        <Nav className="ms-auto">
                            {!authState.isAuthenticated ? (
                                <Nav.Link className="btn btn-outline-dark">Sign In</Nav.Link>) : (<>
                                <NavDropdown title="Network Traffic" id="anomaly-detection-dropdown">
                                    <NavDropdown.Item href="#action/3.1">Anomaly detection</NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.2">Predict</NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.3">Attack</NavDropdown.Item>
                                    <NavDropdown.Item href="#predict">Predict</NavDropdown.Item>
                                    <NavDropdown.Item href="#attacks">Attacks</NavDropdown.Item>
                                    <NavDropdown.Item href="#xai">XAI</NavDropdown.Item>
                                    <NavDropdown.Item href="#metrics">Metrics</NavDropdown.Item>
                                    <NavDropdown.Item href="#build">Build</NavDropdown.Item>
                                </NavDropdown>
                                <NavDropdown title="Models" id="models-dropdown">
                                    <NavDropdown.Item href="#models/all">All Models</NavDropdown.Item>
                                    <NavDropdown.Item href="#models/comparison">Models Comparison</NavDropdown.Item>
                                    <NavDropdown.Item href="#models/retraining">Models Retraining</NavDropdown.Item>
                                </NavDropdown>
                                <button onClick={handleLogout} className="btn btn-outline-light">Logout</button> </> )
                            }
                        </Nav>
                    </Navbar.Collapse>

            </Navbar>
        </>
    )
};

export default NavBar;