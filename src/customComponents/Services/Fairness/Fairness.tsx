import React, { useState } from "react";
import FileUpload from "../Fairness/FileUploadForm";
import { Col, Table, Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { fairnessAPI } from "../../../api";

import FairnessBarchart from "./FairnessBarchart";
import { exportToCSV, CSVData } from "../../util/FairnessUtil";

interface FairnessSummary {
  [key: string]: string | string[];
}

const FairnessTable: React.FC<{ fairnessSummary: FairnessSummary }> = ({
  fairnessSummary,
}) => {
  const metrics = new Set<string>();
  const categories = new Set<string>();
  const [date, setDate] = useState(new Date());
  const [showHeaders, setShowHeaders] = useState(false);

  console.log(fairnessSummary);

  const descriptions: { [key: string]: string } = {};
  Object.keys(fairnessSummary).forEach((key) => {
    const metricName = key.replace(/_des$/, ""); // Remove "_des" suffix from the key
    if (key !== metricName) {
      descriptions[metricName] = fairnessSummary[key] as string;
    }
  });
  console.log(descriptions);

  // Check if fairnessSummary is available before rendering the chart
  const showChart = fairnessSummary && Object.keys(fairnessSummary).length > 0;
  const exclusions = [
    "overall_fairness_score",
    "consistency_des",
    "class_imbalance_des",
    "disparate_impact_input_des",
    "disparate_impact_prediction_des",
    "equal_opportunity_des",
    "equalized_odds_des",
    "overall_fairness_score_des",
  ];

  Object.keys(fairnessSummary).forEach((key) => {
    if (!exclusions.includes(key)) {
      const metricName = key.split("_").slice(0, -1).join("_");
      const categoryName = key.split("_").slice(-1)[0];
      categories.add("Metric");
      categories.add(categoryName);
      metrics.add(metricName);
    }
  });

  const labels = Array.from(metrics).filter(
    (metric) => !exclusions.includes(metric)
  );
  const dataAge = labels.map((metric) => fairnessSummary[`${metric}_Age`]);
  const dataGender = labels.map(
    (metric) => fairnessSummary[`${metric}_Gender`]
  );

  const labelss = Array.from(metrics);

  const csvData: CSVData[] = labelss.map((metric) => {
    const ageValue = fairnessSummary[`${metric}_Age`];
    const genderValue = fairnessSummary[`${metric}_Gender`];

    return {
      Metric: metric.replace(/_/g, " "),
      Age: Array.isArray(ageValue) ? ageValue.join(", ") : ageValue,
      Gender: Array.isArray(genderValue) ? genderValue.join(", ") : genderValue,
    };
  });

  const exportCSV = () => {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed, so we add 1
    const year = currentDate.getFullYear().toString();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const seconds = currentDate.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert 24-hour format to 12-hour format
    const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");

    const formattedDate = `${day}_${month}_${year}_${formattedHours}:${minutes}:${seconds}_${ampm}_fairness_results.csv`;

    exportToCSV(csvData, formattedDate);
  };

  const arrayToCSV = (array: (string | string[][])[]): string =>
    array.join("\n");

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
    // Separator
    const separator = [[""], ["---"], [""]];

    const metricList = csvData.map((data) => [
      data.Metric,
      data.Age,
      data.Gender,
    ]);

    const metric_scoresCSV = createCSVContent(
      "Fairness:",
      ["Metric", "Age", "Gender"],
      metricList
    );

    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed, so we add 1
    const year = currentDate.getFullYear().toString();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");
    const seconds = currentDate.getSeconds().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert 24-hour format to 12-hour format
    const formattedHours = (hours % 12 || 12).toString().padStart(2, "0");

    const formattedDate = `${day}_${month}_${year}_${formattedHours}:${minutes}:${seconds}_${ampm}_fairness_results.csv`;

    // Combining all sections with separators
    const combinedCSV = arrayToCSV([metric_scoresCSV]);

    // Download CSV
    downloadCSV(combinedCSV, formattedDate);
  };

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

  // Function to render tooltip with description
  const renderTooltip = (description: string) => (
    <Tooltip id="tooltip-description">{description}</Tooltip>
  );

  if (showChart && !showHeaders) {
    setShowHeaders(true);
  }

  return (
    <>
      <div className="container mb-4">
        <table className="table mt-5">
          <thead>
            {showHeaders && (
              <tr>
                <th>Metric</th>
                <th>Age</th>
                <th>Gender</th>
              </tr>
            )}
          </thead>
          <tbody>
            {Array.from(metrics).map((metric) => {
              const ageKey = `${metric}_Age`;
              const genderKey = `${metric}_Gender`;
              const ageValue = fairnessSummary[ageKey];
              const genderValue = fairnessSummary[genderKey];
              const description = descriptions[metric];

              return (
                <tr key={metric}>
                  <td>
                    {" "}
                    {description && (
                      <OverlayTrigger
                        placement="right"
                        overlay={renderTooltip(description)}
                      >
                        <Button variant="link" size="sm">
                          ℹ️
                        </Button>
                      </OverlayTrigger>
                    )}
                    {metric.replace(/_/g, " ")}
                  </td>
                  {/* <td>{description}</td> */}
                  <td>
                    {Array.isArray(ageValue) ? ageValue.join(", ") : ageValue}
                  </td>
                  <td>
                    {Array.isArray(genderValue)
                      ? genderValue.join(", ")
                      : genderValue}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="container ">
        {showChart && (
          <>
            <label onClick={exportCSV} className="btn btn-primary mt-2">
              Export to CSV
            </label>
            <br />
            <div className="col-6">
              <br />
              <b>Bar Plot:</b>
              <br />
              <FairnessBarchart
                labels={labels}
                dataAge={dataAge}
                dataGender={dataGender}
              />
            </div>
            <br />
            <br />
            <br />
          </>
        )}
      </div>
    </>
  );
};

const Fairness: React.FC = () => {
  const [csvData, setCSVData] = useState<FairnessSummary>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (files: File[] | File) => {
    setError(null);
    setIsLoading(true);
    const filesArray = Array.isArray(files) ? files : [files];

    for (const file of filesArray) {
      if (file.type !== "text/csv") {
        setError("Please select a CSV file.");
        setIsLoading(false);
        return;
      }
      // setSelectedFile(file);
      const formData = new FormData();
      formData.append("file", file);
      await handleFileSubmit(formData);
    }

    setIsLoading(false);
  };

  const handleFileSubmit = async (formData: FormData): Promise<void> => {
    try {
      const res = await fairnessAPI(formData);
      const json = await res.text();
      const data = JSON.parse(json);
      const entries = Object.entries(data.fairness_summary);
      const formattedData: FairnessSummary = entries.reduce<FairnessSummary>(
        (acc, [key, value]) => {
          if (typeof value === "string" || Array.isArray(value)) {
            acc[key] = value;
          } else {
            console.error(`Unexpected value type for key ${key}:`, value);
          }
          return acc;
        },
        {} as FairnessSummary
      );
      setCSVData(formattedData);
    } catch (error) {
      console.error(error);
      setError("Error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Fairness</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <FileUpload
        onFileUpload={handleFileUpload}
        onFileSubmit={handleFileSubmit}
      />
      {isLoading && <p>Loading...</p>}
      {csvData && <FairnessTable fairnessSummary={csvData} />}
    </div>
  );
};

export default Fairness;
