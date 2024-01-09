import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Make sure to import Bootstrap CSS

interface TableDataItem {
    key: string;
    value: number;
    label: string;
    probability: number;
}

interface TableDataComponentProps {
    data: TableDataItem[];
}

const ProbabilityTable: React.FC<TableDataComponentProps> = ({data}) => {
    const formatProbability = (probability: number) => `${(probability * 100).toFixed(2)}%`;

    return (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead className="table-light">
                <tr>
                    <th>Key</th>
                    <th>Label</th>
                    <th>Probability</th>
                </tr>
                </thead>
                <tbody>
                {data.map((item) => (
                    <tr key={item.key} className={item.probability > 0.5 ? 'table-success' : ''}>
                        <td>{item.key}</td>
                        <td>{item.label}</td>
                        <td>{formatProbability(item.probability)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default ProbabilityTable;
