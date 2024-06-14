import React from "react";
import { Table, Button, Tooltip, OverlayTrigger } from "react-bootstrap";

interface BiasInInputTableProps {
  fairnessSummary: { [key: string]: string | string[] };
}

const BiasInInputTable: React.FC<BiasInInputTableProps> = ({
  fairnessSummary,
}) => {
  const inputMetrics = [
    "consistency",
    "class_imbalance",
    "disparate_impact_input",
  ];

  const suffixes = ["Gender", "Age"];

  const descriptions: { [key: string]: string } = {
    consistency: fairnessSummary["consistency_des"] as string,
    class_imbalance: fairnessSummary["class_imbalance_des"] as string,
    disparate_impact_input: fairnessSummary[
      "disparate_impact_input_des"
    ] as string,
  };

  const renderTooltip = (description: string) => (
    <Tooltip id="tooltip-description">{description}</Tooltip>
  );

  return (
    <div className="container mb-4">
      <h3>BIAS in Input Data</h3>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Gender</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {inputMetrics.map((metric) => (
            <tr key={metric}>
              <td>
                {descriptions[metric] && (
                  <OverlayTrigger
                    placement="right"
                    overlay={renderTooltip(descriptions[metric])}
                  >
                    <Button variant="link" size="sm">
                      ℹ️
                    </Button>
                  </OverlayTrigger>
                )}
                {metric.replace(/_/g, " ")}
              </td>
              {suffixes.map((suffix) => {
                const value = fairnessSummary[`${metric}_${suffix}`];
                return (
                  <td key={suffix}>
                    {Array.isArray(value) ? value.join(", ") : value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default BiasInInputTable;
