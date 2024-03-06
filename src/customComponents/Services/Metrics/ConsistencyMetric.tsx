import React, { useState } from "react";
import MetricsNavbar from "./MetricsNavbar";
import { Col, Table, Button } from "react-bootstrap";
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
  const [imageRes, setImageRes] = useState<string | null>(null);
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
      const reader = new FileReader();
      reader.onload = function (event) {
        if (event.target) {
          const imageUrl = event.target.result as string;

          // Now, you can save the imageUrl to a CSV file or perform any other operation
          saveToCSV(imageUrl);
          console.log("imageUrl", imageUrl);
          // setImageRes(imageUrl);
        }
      };
      reader.readAsDataURL(imageRes);

      function saveToCSV(imageUrl: string | ArrayBuffer | null) {
        // Assuming you have a CSV file handling mechanism in place
        // For example, using Blob and createObjectURL to create a download link
        const csvContent = `imageURL\n${imageUrl}`;
        // const csvContent = `imageURL\n${imageUrl}`;
        const blob = new Blob([csvContent], { type: "text/csv" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        console.log(csvContent);
        // link.download = "imageUrls.csv";
        // link.click();
        setImageRes(csvContent);
      }
    } catch (error) {
      setError("An error occurred during submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const arrayToCSV = (array: (string | string[][])[]): string =>
    array.join("\n");

  const downloadCSV = (csvContent: string, filename: string): void => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const createCSVContent = (
    title: string,
    headers: string[],
    data: Array<Array<string | number | undefined>>
  ): string => {
    const headerRow = headers.join(",");
    const dataRows = data.map((row) => row.join(","));
    return [title, headerRow, ...dataRows].join("\n");
  };

  const handleExportToCSV = (): void => {
    // Model Details
    const modelDetails: Array<Array<string | number>> = [
      [`Model ID`, 1],
      [`Sample ID`, 2],
      [`Number of Samples`, 3],
      [`Max Display`, 4],
    ];
    const modelDetailsCSV = createCSVContent(
      "Model Details:",
      [],
      modelDetails
    );

    interface ContributionValue {
      Feature: string;
      Values: number[];
    }

    const contributionDict_list: ContributionValue[] = Object.entries(
      contributionDict
    ).map(([method, values]) => ({
      Feature: method,
      Values: values.flat(), // Flatten the array of values
    }));

    const contribution_scoresCSV = createCSVContent(
      "Contribution Dict:",
      ["Feature", "Values"],
      contributionDict_list.map(({ Feature, Values }) => [
        Feature,
        Values.join(", "), // Join the values into a comma-separated string
      ])
    );

    // Separator
    const separator = [[""], ["---"], [""]];

    const averageConsistencyValue =
      jsonResults.average_consistency?.toString() || "";
    const average_consistencyCSV = createCSVContent(
      "Average Consistency:",
      [],
      [[averageConsistencyValue]]
    );

    const pairwiseScoresList = Object.entries(jsonResults.pairwise_scores).map(
      ([pair, score]) => [
        pair,
        String(score), // Ensure score is converted to string
      ]
    );

    const pairwise_scoresCSV = createCSVContent(
      "Pairwise Values:",
      ["Feature", "Value"],
      pairwiseScoresList
    );

    // Pie Chart Data
    // const pieDataCSV = createCSVContent(
    //   "Pie Chart Data:",
    //   ["Type", "Value"],
    //   state.pieData.map(
    //     (data: { type: any; value: { toString: () => any } }) => [
    //       data.type,
    //       data.value.toString(),
    //     ]
    //   )
    // );
    console.log("imageRes", imageRes);
    const ImageURLCSV = imageRes
      ? createCSVContent(
          "Image Values:",
          ["Feature", "Value"],
          [["Image Value", imageRes.toString()]] // Assuming imageRes is a string or has a meaningful toString method
        )
      : "";
    console.log("ImageURLCSV", ImageURLCSV);

    // Combining all sections with separators
    const combinedCSV = arrayToCSV([
      modelDetailsCSV,
      separator,
      separator,
      contribution_scoresCSV,
      separator,
      separator,
      average_consistencyCSV,
      separator,
      separator,
      pairwise_scoresCSV,
      separator,
      separator,
      ImageURLCSV,
    ]);

    // Download CSV
    downloadCSV(combinedCSV, `analysis2.csv`);
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
                  <Col md={3} className="d-flex align-items-center">
                    <Button
                      variant="primary"
                      onClick={handleExportToCSV}
                      className="w-100 mt-3"
                    >
                      Save Data to CSV
                    </Button>
                  </Col>
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
