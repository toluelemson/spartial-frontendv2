import React, { useState } from 'react';
import { Container, Row, Col, Table, Tabs, Tab } from 'react-bootstrap';


type DataRow = {
    sessionId: number;
    direction: number;
    packetsPerFlow: number;
    duration: number;
    headerLength: number;
    payloadLength: number;
    totalBytes: number;
    timeBetweenPackets: number;
};

const sampleData: DataRow[] = [
    // ... populate with actual data
];

const ModelDetail: React.FC = () => {
    // State for the active tab
    const [key, setKey] = useState('data');

return (
    <Container>
            <Row>
                <Col>
                    <h2>Dataset</h2>
                    <p>Training dataset of the model model_2</p>

                    <Tabs
                        id="controlled-tab-example"
                        activeKey={key}
                        onSelect={(k) => setKey(k ?? 'data')}
                        className="mb-3"
                    >
                        <Tab eventKey="data" title="Data">
                            <p>Total number of samples: 2838; Total number of features: 59</p>
                            <Table striped bordered hover size="sm">
                                <thead>
                                <tr>
                                    <th>ip.session_id</th>
                                    <th>meta.direction</th>
                                    <th>ip.pkts_per_flow</th>
                                    <th>duration</th>
                                    <th>ip.header_len</th>
                                    <th>ip.payload_len</th>
                                    <th>ip.avg_bytes_tot_len</th>
                                    <th>time_between_pkts_sum</th>
                                </tr>
                                </thead>
                                <tbody>
                                {sampleData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.sessionId}</td>
                                        <td>{row.direction}</td>
                                        <td>{row.packetsPerFlow}</td>
                                        <td>{row.duration}</td>
                                        <td>{row.headerLength}</td>
                                        <td>{row.payloadLength}</td>
                                        <td>{row.totalBytes}</td>
                                        <td>{row.timeBetweenPackets}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </Tab>
                        <Tab eventKey="feature-descriptions" title="Feature Descriptions">
                            {/* Content for feature descriptions */}
                        </Tab>
                        <Tab eventKey="histogram" title="Histogram Plot">
                            {/* Content for histogram plot */}
                        </Tab>
                        <Tab eventKey="scatter" title="Scatter Plot">
                            {/* Content for scatter plot */}
                        </Tab>
                        <Tab eventKey="bar" title="Bar Plot">
                            {/* Content for bar plot */}
                        </Tab>
                    </Tabs>
                </Col>
            </Row>
    </Container>

    );
};

export default ModelDetail;