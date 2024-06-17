import React from 'react';
import Menu from "././Sidebar/Sidebar";
import AppRoutes from "../routes/AppRoutes";
import {Footer} from "./Footer";
import {Col, Container, Row } from 'react-bootstrap';

const Layout = () => {
    return (
        <Container fluid>
            <Row>
                <Col lg={2} className="bg-dark p-0">
                    <Menu />
                </Col>
                <Col lg={10} className="p-0">
                    <AppRoutes />
                    <Footer />
                </Col>
            </Row>
        </Container>
    );
};

export default Layout