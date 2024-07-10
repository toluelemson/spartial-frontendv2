import React from "react";
import { Table, Button, Tooltip, OverlayTrigger } from "react-bootstrap";

interface BiasInPredictionTableProps {
  fairnessSummary: { [key: string]: string | string[] };
}

const BiasInPredictionTable: React.FC<BiasInPredictionTableProps> = ({
  fairnessSummary,
}) => {
  const predictionMetrics = [
    "disparate_impact_prediction",
    "equal_opportunity",
    "equalized_odds",
  ];

  const suffixes = ["Gender", "Age"];

  const descriptions: { [key: string]: string } = {
    disparate_impact_prediction: fairnessSummary[
      "disparate_impact_prediction_des"
    ] as string,
    equal_opportunity: fairnessSummary["equal_opportunity_des"] as string,
    equalized_odds: fairnessSummary["equalized_odds_des"] as string,
  };

  const renderTooltip = (description: string) => (
    <Tooltip id="tooltip-description">{description}</Tooltip>
  );

  return (
    <div className="container mb-4">
      <h3>BIAS in Prediction</h3>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Gender</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          {predictionMetrics.map((metric) => (
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

export default BiasInPredictionTable;
