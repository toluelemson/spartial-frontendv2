import React, { useEffect, useState } from 'react';
import { Table, Container } from 'react-bootstrap';
import { requestWithSecureSingleAttackStatus } from '../../../../api';

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

interface APIResponse {
    result: AttackData[];
}

interface AttackDataTableProps {
    selectedAttackId: string | null;
}

const AttackDataTable: React.FC<AttackDataTableProps> = ({ selectedAttackId }) => {
    const [data, setData] = useState<AttackData | null>(null);

    const fetchAttackData = async (attackId: string) => {
        try {
            const response: APIResponse = await requestWithSecureSingleAttackStatus(attackId) as any;
            if (response && response.result && response.result.length > 0) {
                setData(response.result[0]);
            } else {
                setData(null);
            }
        } catch (error) {
            console.error('Error fetching attack data:', error);
            setData(null);
        }
    };

    useEffect(() => {
        if (selectedAttackId) {
            fetchAttackData(selectedAttackId);
        }
    }, [selectedAttackId]);

    return (
        <Container className="mt-5" fluid>
            <div style={{ overflowX: 'auto' }}>
                <Table striped bordered hover responsive="sm" className="table-sm">
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
                    {data && Object.keys(data.attack).map((key) => (
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
        </Container>
    );
};

export default AttackDataTable;
