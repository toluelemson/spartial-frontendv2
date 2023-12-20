import React from 'react';
import {Col} from "react-bootstrap";

const ProtectedComponent: React.FC = () => {
    return (
        <>
        <Col className="contentContainer">
            <h1>Protected Page</h1>
            <p>Welcome to Spatial. This is a protected page. Only authenticated users can see this.</p>
        </Col>

        </>
    );
};

export default ProtectedComponent;
