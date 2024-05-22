import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import ProbabilityTable from '../Charts/ProbabilityTable';

export const LimeChartsDisplay = ({ state, loading } : any) => {(

    <Card>
        <Card.Body>
            {loading ? (
                // <SpinnerComponent />
                "loading"
            ) : (
                <>
                    <Row>
                        <Col md={12}>
                            <ProbabilityTable data={state.dataTableProbs} />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            {/* <LollipopChart data={state.limeValues}/> */}
                        </Col>
                        <Col md={6}>
                            {/* <PieChartComponent data={state.pieData}/> */}
                        </Col>
                    </Row>
                </>
            )}
        </Card.Body>
    </Card>
)}