import React, { useEffect, useState } from 'react';
import { Table, Container, Form, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';
import { requestWithSecureAttackStatus, requestWithSecureSingleAttackStatus } from '../../../../api';

interface AttackData {
    attack: { [key: string]: string };
    run_id: { [key: string]: number };
    step: { [key: string]: number };
    y_pred: { [key: string]: number };
    y_pred_proba: { [key: string]: number[] };
    y_target: { [key: string]: number | null };
    y_orig: { [key: string]: number };
    is_succ: { [key: string]: boolean };
    n_queries: { [key: string]: number };
    l0: { [key: string]: number };
    l1: { [key: string]: number };
    l2: { [key: string]: number };
    linf: { [key: string]: number };
}

interface AttackId {
    id: string;
    status: string;
}

interface APIResponse {
    result: AttackData[];
}

interface AttackDataTableProps {
    modelId: string;
}

const AttackDataTable: React.FC<AttackDataTableProps> = ({ modelId }) => {
    const [data, setData] = useState<AttackData | null>(null);
    const [attackIds, setAttackIds] = useState<AttackId[]>([]);
    const [selectedAttackId, setSelectedAttackId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAttackIds = async () => {
        setLoading(true);
        setError(null);
        try {
            const response: AttackId[] = await requestWithSecureAttackStatus() as any;
            if (response.length > 0) {
                const sortedAttackIds = response.sort((a, b) => {
                    if (a.status === b.status) return 0;
                    if (a.status === 'SUCCESS') return -1;
                    if (b.status === 'SUCCESS') return 1;
                    if (a.status === 'FAILURE') return -1;
                    return 1;
                });
                setAttackIds(sortedAttackIds);
                setSelectedAttackId(sortedAttackIds[0].id);
            } else {
                setAttackIds([]);
                setSelectedAttackId(null);
            }
        } catch (error) {
            setError('Error fetching attack IDs');
            setAttackIds([]);
            setSelectedAttackId(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttackData = async (attackId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response: APIResponse = await requestWithSecureSingleAttackStatus(attackId) as any;
            if (response && response.result && response.result.length > 0) {
                setData(response.result[0]);
            } else {
                setData(null);
            }
        } catch (error) {
            setError('Error fetching attack data');
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttackIds();
    }, []);

    useEffect(() => {
        if (selectedAttackId) {
            fetchAttackData(selectedAttackId);
        }
    }, [selectedAttackId]);

    return (
        <Container className="mt-5" fluid>
            <Card>
                <Card.Header as="h5">Attack Data Viewer</Card.Header>
                <Card.Body>
                    <Row className="mb-4">
                        <Col>
                            <Form.Group controlId="attackIdSelect">
                                <Form.Label>Select Attack ID</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={selectedAttackId || ''}
                                    onChange={(e) => setSelectedAttackId(e.target.value)}
                                    disabled={loading}
                                >
                                    {attackIds.map((attack) => (
                                        <option key={attack.id} value={attack.id}>
                                            {attack.id} - {attack.status}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    {loading && (
                        <div className="text-center">
                            <Spinner animation="border" />
                        </div>
                    )}
                    {error && <Alert variant="danger">{error}</Alert>}
                    {data && (
                        <div style={{ overflowX: 'auto' }}>
                            <Table striped bordered hover responsive className="mt-3">
                                <thead className="thead-dark">
                                <tr>
                                    <th>Attack</th>
                                    <th>Run ID</th>
                                    <th>Step</th>
                                    <th>Y Pred</th>
                                    <th>Y Pred Proba</th>
                                    <th>Y Target</th>
                                    <th>Y Orig</th>
                                    <th>Is Success</th>
                                    <th>N Queries</th>
                                    <th>L0</th>
                                    <th>L1</th>
                                    <th>L2</th>
                                    <th>Linf</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Object.keys(data.attack).map((key) => (
                                    <tr key={key}>
                                        <td>{data.attack[key]}</td>
                                        <td>{data.run_id[key]}</td>
                                        <td>{data.step[key]}</td>
                                        <td>{data.y_pred[key]}</td>
                                        <td>{data.y_pred_proba[key].join(', ')}</td>
                                        <td>{data.y_target[key] !== null ? data.y_target[key] : 'null'}</td>
                                        <td>{data.y_orig[key]}</td>
                                        <td>{data.is_succ[key] ? 'Yes' : 'No'}</td>
                                        <td>{data.n_queries[key]}</td>
                                        <td>{data.l0[key]}</td>
                                        <td>{data.l1[key]}</td>
                                        <td>{data.l2[key]}</td>
                                        <td>{data.linf[key]}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </Container>
    );
};

export default AttackDataTable;
