import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AttackList from './AttackList'; // Adjust the import path as necessary
import AttackDataTable from './AttackDataTable'; // Adjust the import path as necessary

const AttackOverview: React.FC = () => {
    const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null);

    return (
        <Container className="mt-5">
            <Row>
                <Col md={4}>
                    <AttackList onSelect={(id) => setSelectedAttackId(id)} />
                </Col>
                <Col md={8}>
                    <div className="table-wrapper">
                        <AttackDataTable selectedAttackId={selectedAttackId} />
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default AttackOverview;
