import React, { useState } from "react";
import MetricsNavbar from "./MetricsNavbar";
import { Col, Table } from "react-bootstrap";
import {
  consistencyMetricAPI as jsonAPI,
  consistencyMetricAPIPlot as imageAPI,
} from "../../../api";

interface ContributionDict {
  KernelSHAP: number[][];
  LIME: number[][];
  SamplingSHAP: number[][];
}

type AllowedMethods = "KernelSHAP" | "LIME" | "SamplingSHAP";

const ConsistencyMetric: React.FC = () => {
  const [contributionDict, setContributionDict] = useState<ContributionDict>({
    KernelSHAP: [
      [0.15, 0.2],
      [0.3, 0.42],
    ],
    LIME: [
      [0.14, 0.2],
      [0.34, 0.4],
    ],
    SamplingSHAP: [
      [0.12, 0.2],
      [0.32, 0.4],
    ],
  });

  const [jsonResults, setJsonResults] = useState<any | null>(null); // State for JSON results
  const [imageResult, setImageResult] = useState<string | null>(null); // State for image result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    method: AllowedMethods,
    row: number,
    col: number,
    value: number
  ) => {
    setContributionDict((prevContributionDict) => {
      const newContributionDict: ContributionDict = { ...prevContributionDict };
      newContributionDict[method][row][col] = value;
      return newContributionDict;
    });
  };

  const sendDataToBackend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = { contribution_dict: contributionDict };

      // Call the JSON API
      const jsonRes = await jsonAPI(data);
      console.log("JSON API Response:", jsonRes);
      setJsonResults(jsonRes);

      // Call the image API
      const imageRes = await imageAPI(data);
      console.log("Image API Response:", imageRes);

      if (imageRes instanceof Blob) {
        // Convert the Blob to a data URL
        const imageUrl = URL.createObjectURL(imageRes);
        console.log("Setting image result:", imageUrl);
        setImageResult(imageUrl);
      }
    } catch (error) {
      setError("An error occurred during submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <MetricsNavbar /> <br />
      <h2 className="text-gray">Consistency Metric</h2>
      <div className="container mt-4">
        <div className="border p-3">
          <form onSubmit={sendDataToBackend}>
            {/* Input fields side by side */}
            <div style={{ display: "flex" }}>
              <div style={{ marginRight: "10px" }}>
                {/* Input for KernelSHAP */}
                <b>KernelSHAP</b>

                {contributionDict.KernelSHAP.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    {row.map((value, colIndex) => (
                      <input
                        key={colIndex}
                        type="number"
                        value={value}
                        onChange={(e) =>
                          handleInputChange(
                            "KernelSHAP",
                            rowIndex,
                            colIndex,
                            +e.target.value
                          )
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div style={{ marginRight: "10px" }}>
                {/* Input for LIME */}

                <b> LIME</b>
                {contributionDict.LIME.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    {row.map((value, colIndex) => (
                      <input
                        key={colIndex}
                        type="number"
                        value={value}
                        onChange={(e) =>
                          handleInputChange(
                            "LIME",
                            rowIndex,
                            colIndex,
                            +e.target.value
                          )
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div>
                {/* Input for SamplingSHAP */}
                <b>SamplingSHAP</b>
                {contributionDict.SamplingSHAP.map((row, rowIndex) => (
                  <div key={rowIndex}>
                    {row.map((value, colIndex) => (
                      <input
                        key={colIndex}
                        type="number"
                        value={value}
                        onChange={(e) =>
                          handleInputChange(
                            "SamplingSHAP",
                            rowIndex,
                            colIndex,
                            +e.target.value
                          )
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>{" "}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <br />
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
        <div>
          <br />
          {/* Display JSON results and image if available */}
          {jsonResults && (
            <div>
              <div style={{ display: "flex" }}>
                {/* JSON results */}
                <div style={{ flex: 1 }}>
                  <p>
                    <h3>Results:</h3>
                  </p>
                  <p>Average Consistency: {jsonResults.average_consistency}</p>
                  <p>Pairwise Scores:</p>
                  <ul>
                    {Object.entries(jsonResults.pairwise_scores).map(
                      ([pair, score]) => (
                        <li key={pair}>
                          <>
                            <strong>{pair}:</strong> {score}
                          </>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Image */}
                {imageResult && (
                  <div style={{ flex: 1 }}>
                    <img src={imageResult} alt="Result" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsistencyMetric;
