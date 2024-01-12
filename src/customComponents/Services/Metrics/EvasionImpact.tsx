import React, { useState } from "react";
import MetricsNavbar from "./MetricsNavbar";
import { Col, Table } from "react-bootstrap";
import { evasion_impact_metric } from "../../../api";

// interface Result {
//   accuracy: number | null;
// }

const MetricsHomepage: React.FC = () => {
  const [groundTruth, setGroundTruth] = useState<string>("");
  const [predictions, setPredictions] = useState<string>("");
  const [results, setResults] = useState<{ impact: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setterFunction: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setError(null); // Reset error on input change

    const inputValue = event.target.value;

    // Validate if the input contains only numbers and commas
    if (/^[0-9,]*$/.test(inputValue) || inputValue === "") {
      setterFunction(inputValue);
    } else {
      setError("Please enter valid numeric values separated by commas.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const groundTruthArray = groundTruth
        .split(",")
        .map((item) => Number(item.trim()));

      const predictionsArray = predictions
        .split(",")
        .map((item) => Number(item.trim()));

      if (groundTruthArray.length !== predictionsArray.length) {
        setError("Input arrays must have the same length.");
        // Abort the submission if the lengths are different
      }

      const response = await evasion_impact_metric(
        groundTruthArray,
        predictionsArray
      );

      setResults(response);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError("An error occurred during submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <MetricsNavbar /> <br />
        <h2 className="text-gray">Evasion Impact</h2>
        <div className="container mt-4">
          <div className="border p-3">
            <form onSubmit={handleSubmit}>
              {/* <h2 className="text-gray">To check the Accuracy</h2> */}
              <div className="mb-3">
                <label htmlFor="groundTruthInput" className="form-label">
                  <b> Enter Ground Truth values:</b> &nbsp;
                </label>
                <input
                  type="text"
                  id="groundTruthInput"
                  placeholder="e.g., 1, 2, 3, 4, 5"
                  value={groundTruth}
                  onChange={(event) => handleInputChange(event, setGroundTruth)}
                  required
                />
              </div>
              <br />
              <label htmlFor="predictionsInput" className="form-label">
                <b>Enter Predictions values: </b> &nbsp; &nbsp; &nbsp;
              </label>
              <input
                type="text"
                id="predictionsInput"
                placeholder="e.g., 1, 2, 3, 4, 5"
                value={predictions}
                onChange={(event) => handleInputChange(event, setPredictions)}
                required
              />{" "}
              <br /> <br />
              {error && <p style={{ color: "red" }}>{error}</p>}
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </form>
          </div>

          <br />
          {results !== null && (
            <div className="border p-3">
              <h2>Results:</h2>
              <p>Impact: {results.impact}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MetricsHomepage;
