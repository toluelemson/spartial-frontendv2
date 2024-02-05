import React, { useState, FormEvent, ChangeEvent } from "react";
import MetricsNavbar from "./MetricsNavbar";
import { Col, Form, Button } from "react-bootstrap";
import {
  compacityMetricAPI as jsonAPI,
  compacityMetricAPIPlot as imageAPI,
} from "../../../api";

// interface CompacityDict {
//   contributions: number[][];
//   selection: number[];
//   distance: number;
//   nb_features: number;
// }

const CompacityMetric: React.FC = () => {
  const [jsonResults, setJsonResults] = useState<any | null>(null); // State for JSON results
  const [imageResult, setImageResult] = useState<string | null>(null); // State for image result
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [contributions, setContributions] = useState([
    [0.15, 0.2, 0.4, 0.01],
    [0.3, 0.42, 0.34, 0.012],
  ]);
  const [selection, setSelection] = useState([0, 1]);
  const [distance, setDistance] = useState(0.9);
  const [nb_features, setNb_features] = useState(4);
  const [apiResult, setApiResult] = useState<any>(null); // Update this type based on the actual API response structure

  const handleInputChange = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const newContributions = [...contributions];
    newContributions[rowIndex][colIndex] = parseFloat(value);
    setContributions(newContributions);
  };

  const handleSelectionChange = (index: number, value: string) => {
    const newSelection = [...selection];
    newSelection[index] = parseInt(value, 10);
    setSelection(newSelection);
  };

  // const handleDistanceChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const newValue = e.target.value;
  //   setDistance(parseFloat(newValue));
  // };

  const handleDistanceChange = (value: string) => {
    setDistance(parseFloat(value));
  };

  // const handleNbFeaturesChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   const newValue = e.target.value;
  //   setNbFeatures(parseInt(newValue, 10));
  // };

  const handleNbFeaturesChange = (value: string) => {
    const parsedValue = parseInt(value, 10);

    if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue < 5) {
      setNb_features(parsedValue);
    } else {
      // Display an error message or take appropriate action
      if (parsedValue < 0 || parsedValue === -0) {
        setError("Please input a non-negative value");
      } else {
        setError("Please input a value less than 5");
      }
      // Alternatively, you can set a default value or handle the error in another way
      // setNb_features(DEFAULT_VALUE);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      console.log("Submitting with data:", {
        contributions,
        selection,
        distance,
        nb_features,
      });

      const dataToSend = {
        contributions,
        selection,
        distance,
        nb_features,
      };

      const apiResponse = await jsonAPI(dataToSend);
      // console.log("apiResponse", apiResponse);
      setJsonResults(apiResponse);

      // Call the image API
      const imageRes = await imageAPI(dataToSend);
      // console.log("Image API Response:", imageRes);

      if (imageRes instanceof Blob) {
        // Convert the Blob to a data URL
        const imageUrl = URL.createObjectURL(imageRes);
        // console.log("Setting image result:", imageUrl);
        setImageResult(imageUrl);
      }
    } catch (error) {
      console.error("Error in CompacityMetricAPI:", error);
      setError("An error occurred during submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <MetricsNavbar /> <br />
      <h2 className="text-gray">Compacity Metric</h2>
      <div className="container mt-4">
        <div className="border p-3">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="ContributionsInput" className="form-label">
                <b> Contributions:</b> &nbsp;
              </label>
              {contributions.map((row, rowIndex) => (
                <div key={rowIndex}>
                  {row.map((col, colIndex) => (
                    <input
                      key={colIndex}
                      type="number"
                      step="0.01"
                      value={contributions[rowIndex][colIndex]}
                      onChange={(e) =>
                        handleInputChange(rowIndex, colIndex, e.target.value)
                      }
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="mb-3">
              <label htmlFor="SelectionInput" className="form-label">
                <b> Selection:</b> &nbsp;
              </label>
              {selection.map((value, index) => (
                <input
                  key={index}
                  type="number"
                  value={selection[index]}
                  onChange={(e) => handleSelectionChange(index, e.target.value)}
                />
              ))}
            </div>

            <div className="mb-3">
              <label htmlFor="DistanceInput" className="form-label">
                <b> Distance:</b> &nbsp;
              </label>
              <input
                type="number"
                step="0.9"
                value={distance}
                onChange={(e) => handleDistanceChange(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="nb_FeaturesInput" className="form-label">
                <b> Number of Features:</b> &nbsp;
              </label>
              <input
                type="number"
                step="4"
                value={nb_features}
                onChange={(e) => handleNbFeaturesChange(e.target.value)}
              />
            </div>
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
                  <p>
                    Features Needed: [{jsonResults.features_needed[0]},
                    {jsonResults.features_needed[1]}]
                  </p>
                  <p>Distance Reached:</p>[{jsonResults.distance_reached[0]},
                  &nbsp;
                  {jsonResults.distance_reached[1]}]
                  {/* <ul>
                    {Object.entries(jsonResults.distance_reached).map(
                      ([pair, score]) => (
                        <li key={pair}>
                          <>
                            <strong>{pair}:</strong> {score}
                          </>
                        </li>
                      )
                    )}
                  </ul> */}
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

export default CompacityMetric;
