import React, { useState, DragEvent } from "react";
import Papa from "papaparse";
import FairnessBarchart from "./FairnessBarchart";

const FairnessComparer: React.FC = () => {
  const [filesData, setFilesData] = useState<any[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<any[]>([]);

  interface ModelDetail {
    Metric: string | null;
    Age: number | null;
    Gender: number | null;
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length >= 2) {
      setFilesData([]);
      setFileNames([]);
      handleFiles(files, 0);
    } else {
      alert("Please drop at least two CSV files!");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length >= 2) {
      setFilesData([]);
      setFileNames([]);
      handleFiles(files, 0);
    } else {
      alert("Please select at least two CSV files!");
    }
  };

  const parseCSV = (file: File, setData: (data: any[]) => void): void => {
    Papa.parse(file, {
      complete: (results) => {
        setData(results.data as any[]);
      },
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
    });
  };

  const separateObjects = (data: ModelDetail[]): ModelDetail[][] => {
    const separatedData: ModelDetail[][] = [];
    let tempGroup: ModelDetail[] = [];
    if (!Array.isArray(data)) {
      console.error("Data is undefined or not an array");
      return [];
    }

    data.forEach((obj) => {
      if (obj["Metric"] === null) {
        if (tempGroup.length) {
          separatedData.push(tempGroup);
          tempGroup = [];
        }
      } else {
        tempGroup.push(obj);
      }
    });

    if (tempGroup.length) {
      separatedData.push(tempGroup);
    }

    return separatedData;
  };

  const handleFiles = (files: FileList, index: number) => {
    const file = files[index];
    if (file) {
      setFileNames((prev) => [...prev, file.name]);
      parseCSV(file, (data) => {
        setFilesData((prev: any) => [...prev, data]);
        if (index + 1 < files.length) {
          handleFiles(files, index + 1);
        }
      });
    }
  };

  const renderBarcharts = (tableData: any[], index: number) => {
    console.log("tableData", tableData);

    return separateObjects(tableData).map((metricsSet, innerIndex) => {
      // Extracting Metric values from each object
      const labels = metricsSet
        .map((row) => row.Metric)
        .filter((label) => label !== null) as string[];

      return (
        <React.Fragment key={innerIndex}>
          <h6>Bar Plot: </h6>
          <FairnessBarchart
            labels={labels}
            dataAge={metricsSet.map((row) => row.Age ?? 0)}
            dataGender={metricsSet.map((row) => row.Gender ?? "")}
          />
        </React.Fragment>
      );
    });
  };

  const renderTable = (
    tableData: any[],
    index: React.Key | null | undefined
  ) => {
    return (
      <div key={index}>
        <table className="table table-bordered table-striped table-hover">
          <thead>
            <tr>
              {Object.keys(tableData[0]).map((header, idx) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.values(row).map((cell, cellIndex) => (
                  <td key={cellIndex}>{JSON.stringify(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {renderBarcharts(tableData, index as number)}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="drop-zone"
          >
            Drag and drop at least two CSV files here or click to select
          </div>
          <input
            type="file"
            multiple
            className="form-control"
            id="fileInput"
            accept=".csv"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label htmlFor="fileInput" className="btn btn-primary mt-2">
            Select Files
          </label>
        </div>
      </div>
      <div className="row">
        {filesData.map((data: any, index: any) => (
          <div key={fileNames[index]} className="col-md-6">
            <h5>{fileNames[index]}</h5>
            <div>
              {separateObjects(data).map((tableData, innerIndex) => (
                <React.Fragment key={innerIndex}>
                  {renderTable(tableData, innerIndex as number)}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FairnessComparer;
