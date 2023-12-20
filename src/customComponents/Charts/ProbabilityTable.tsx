import React from 'react';

interface TableDataItem {
    key: string;
    value: number;
    label: string;
    probability: number
}

interface TableDataComponentProps {
    data: TableDataItem[];
}

const ProbabilityTable: React.FC<TableDataComponentProps>= ({data}) => {


  // Data provided
  // const data = [
  //   { key: 0, label: "Web", probability: "0.718533" },
  //   { key: 1, label: "Interactive", probability: "0.000109" },
  //   { key: 2, label: "Video", probability: "0.281357" }
  // ];

  return (
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Label</th>
          <th>Probability</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item: TableDataItem) => (
          <tr key={item.key}>
            <td>{item.key}</td>
            <td>{item.label}</td>
            <td>{item.probability}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ProbabilityTable;
