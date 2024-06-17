import React, { useState, DragEvent } from "react";
import Papa from "papaparse";
import PieChartComparison from "./pieChartComparison";
import LollipopChart from "./LollipopChartComparison";
import ImageDisplay from "./ImageDisplay";
import FairnessBarchart from "../../Services/Fairness/FairnessBarchart";

const CSVComparator: React.FC = () => {
  const [filesData, setFilesData] = useState<any>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);

  interface ModelDetail {
    Metric: any;
    Age: number | null;
    Gender: number | null;
    "Model Details:": string | null;
    Value?: string[];
    __parsed_extra?: (string | number | null)[];
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length) {
      setFilesData([]);
      setFileNames([]);
      handleFiles(files, 0);
    } else {
      alert("Please drop CSV files!");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFilesData([]);
      setFileNames([]);
      handleFiles(files, 0);
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
      if (obj["Model Details:"] === null) {
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
      // setFileNames(prev => [...prev, file.name]);
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
    const fairnessTableData = tableData.slice(2);
    console.log("fairnessTableData", fairnessTableData);

    return separateObjects(tableData).map((metricsSet, innerIndex) => {
      // Extracting Metric values from each object
      const labels = metricsSet
        .map((row) => row.Metric)
        .filter((label) => label !== null) as string[];

      return (
        <React.Fragment key={innerIndex}>
          <h6>Bar Plot {innerIndex + 1}: </h6>
          <FairnessBarchart
            labels={labels}
            dataAge={metricsSet.map((row) => row.Age ?? 0)}
            dataGender={metricsSet.map((row) => row.Gender ?? "")}
          />
        </React.Fragment>
      );
    });
  };

  // const renderTable = (data: any[]) => {
  //     if (data.length === 0) {
  //         return <p>No data to display.</p>;
  //     }
  //
  //     const headers = Object.keys(data[0]);
  //
  //     return (
  //         <table className="table table-bordered table-striped table-hover">
  //             <thead className="table-light">
  //             <tr>
  //                 {headers.map(header => <th key={header}>{header}</th>)}
  //             </tr>
  //             </thead>
  //             <tbody>
  //             {data.map((row, index) => (
  //                 <tr key={index}>
  //                     {headers.map(header => <td key={header}>{row[header]}</td>)}
  //                 </tr>
  //             ))}
  //             </tbody>
  //         </table>
  //     );
  // };

  const renderTable = (
    tableData: any[],
    index: React.Key | null | undefined
  ) => {
    return (
      <div>
        <table
          key={index}
          className="table table-bordered table-striped table-hover"
        >
          <thead>
            <tr>
              {Object.keys(tableData[0]).map((header, idx) => (
                <th key={header}>
                  <b>{header}</b>
                </th>
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
        {/* {renderBarcharts(tableData, index as number)} */}
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
            Drag and drop CSV files here or click to select
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
              {renderTable(data, index)}
              {separateObjects(data).map((tableData, innerIndex) => {
                console.log("tableData", tableData);

                if (tableData[0]["Model Details:"] === "Pie Chart Data:") {
                  return (
                    <React.Fragment key={innerIndex}>
                      <div className={"row"}>
                        {/*{renderTable(tableData, innerIndex)}*/}
                        <PieChartComparison data={tableData} />
                      </div>
                    </React.Fragment>
                  );
                }

                if (tableData[0]["Model Details:"] === "Model ID") {
                  return (
                    <React.Fragment key={innerIndex}>
                      <div className={"row"}>
                        {renderTable(tableData, innerIndex)}
                      </div>
                    </React.Fragment>
                  );
                }

                if (tableData[0]["Model Details:"] === "Contribution Dict:") {
                  return (
                    <React.Fragment key={innerIndex}>
                      <div>
                        <h5>Consistency Metric Analysis</h5>
                      </div>
                      <div className={"row"}>
                        {renderTable(tableData, innerIndex)}
                      </div>
                    </React.Fragment>
                  );
                }

                if (tableData[0]["Model Details:"] === "Contribution:") {
                  return (
                    <React.Fragment key={innerIndex}>
                      <div>
                        <h5>Compacity Metric Analysis</h5>
                      </div>
                      <div className={"row"}>
                        {renderTable(tableData, innerIndex)}
                      </div>
                    </React.Fragment>
                  );
                }

                if (tableData[0]["Model Details:"] === "LIME Values:") {
                  return (
                    <React.Fragment key={innerIndex}>
                      <LollipopChart data={tableData} />
                      {renderTable(tableData, innerIndex)}
                    </React.Fragment>
                  );
                }

                if (tableData[0]["Model Details:"] === "Pairwise Values:") {
                  return (
                    <React.Fragment key={innerIndex}>
                      <div className={"row"}>
                        {renderTable(tableData, innerIndex)}
                      </div>
                    </React.Fragment>
                  );
                }

                if (tableData[0]["Model Details:"] === "Average Consistency:") {
                  return (
                    <React.Fragment key={innerIndex}>
                      <div className={"row"}>
                        {renderTable(tableData, innerIndex)}
                      </div>
                    </React.Fragment>
                  );
                }

                if (tableData[0]["Model Details:"] === "Features Needed:") {
                  return (
                    <React.Fragment key={innerIndex}>
                      <div className={"row"}>
                        {renderTable(tableData, innerIndex)}
                      </div>
                    </React.Fragment>
                  );
                }

                if (tableData[0]["Model Details:"] === "Distance Reached:") {
                  return (
                    <React.Fragment key={innerIndex}>
                      <div className={"row"}>
                        {renderTable(tableData, innerIndex)}
                      </div>
                    </React.Fragment>
                  );
                }

                // if (tableData[0]["Model Details:"] === "Image Values:") {
                //   console.log("tableData", tableData);
                //   const imageUrls = tableData
                //     .filter((row) => row["Model Details:"] === "Image Values:")
                //     .map((row) => String(row.__parsed_extra?.[0]) || "");

                //   return (
                //     <React.Fragment key={innerIndex}>
                //       <div className={"row"}>
                //         {renderTable(tableData, innerIndex)}
                //         {imageUrls.map((imageUrl, idx) => (
                //           <ImageDisplay key={idx} imageUrl={imageUrl} />
                //         ))}
                //       </div>
                //     </React.Fragment>
                //   );
                // }
                if (tableData[0]["Model Details:"] === "Fairness:") {
                  const fairnessTableData = tableData.slice(1); // Exclude the header row
                  console.log("fairnessTableData", fairnessTableData);

                  return (
                    <React.Fragment key={innerIndex}>
                      <div className={"row"}>
                        {/* {renderTable(tableData, innerIndex)} */}
                        {renderBarcharts(tableData, index as number)}
                      </div>
                    </React.Fragment>
                  );
                }

                if (tableData[0]["Model Details:"] === "Image Values:") {
                  console.log("tableData", tableData);
                  // const imageUrls = tableData
                  //   .filter((row) => row["Model Details:"] === "Image Values:")
                  //   .map((row) => String(row.Value?.[0]) || "");
                  // console.log("imageUrls", imageUrls);

                  const imageUrls = tableData
                    .filter(
                      (row) => row["Model Details:"] === "data:image/png;base64"
                    )
                    .map((row, index) => {
                      const imageUrl =
                        Array.isArray(row.Value) && row.Value.length > 0
                          ? String(row.Value[0])
                          : "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NdXqOECV5HQ69O2331kdA0A5UG4BH1BYWKjeve/V4cMuvffe26pWrZrVkYAqyel0suYW8HOUW8AHTJo0WStXfqjly5eqYcOGVscBqiyHw8mtwAA/x63AAIu99977mjBhkkaPHqX27dtZHQeo0pxOh1wulwoKCqyOAuAsUW4BC/3888/q0+dedex4g0aMGG51HKDKczqdkrhVI+DPKLeARbKyshQf311Op1Pz589TYCB/HAGrORwOSWJpAuDHWHMLWMDtdmvIkKH6/vvvtWbNquLZIgDWcjqLyi0XlQH+inILWGDhwkVKS1uiefPm6KKLLrQ6DoD/KfpFkzsmAP6L90GBSrZ161YNGzZCffv2UUJCvNVxAJyAZQmA/6PcApXo4MFDio/vrosvvkiTJk20Og6Avyja7YmZW8B/UW6BSlJQUKCePe9Rdna2lixJZbc6wAcFBwcrMjKSNbeAH2PNLVBJkpPHa926dXrrrTdVv359q+MAOIlju5SlWx0DwFmi3AKV4O2339HUqU/q8ceTdN1111odB8ApOBwO1twCfoxlCUAF++mnn9SnT1/dcsvNGjp0iNVxAJyG0+lgWQLgxyi3QAU6evSo4uO7KyamtubMeVYBAQFWRwJwGseWJVBuAX/FsgSggrjdbg0ePEQ7d+7UunVrim8xBMC3ORwObd++3eoYAM4S5RaoIPPmPa+XX35FCxcuULNmcVbHAXCGHA4HM7eAH2NZAlABNm3arIceekQDBvTXXXfdaXUcAGUQHe1kzS3gxyi3gJft339A3bol6oorWmjChCesjgOgjLhbAuDfKLeAF+Xn56tnz14qKChQaupihYSEWB0JwBlwu916880VyszMlMPhUFZWlnJycrR06TJNnDjJ6ngAyoByC3jR2LFJ2rjxY6Wmpqhu3TpWxwFwhtxut+699z4lJSUrOjpakvTHH39q1KjR+vnnXRanA1AWlFvAS5Yvf1MzZjyt8eOTdfXVrayOA6AMAgMDNWLEMM2ZM7f4YrIVK97S7t271a9fX4vTASgLyi3gBd9//4P69Rug22/vrIED77c6DoCzMGjQQMXGNtCCBS9IkpYsWaIrr7xCl156qcXJAJQF5RYopyNHjig+PkH169fT7NnPsFED4KeqVaumSZMmatOmzZKkrVs/1333MWsL+BvKLVAObrdbAwYM1J49v+rFF5co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q6++0s6dO/Xaa69pypQpuvXWW3XeeecpLy9PzzzzjHbs2KHU1FTNmXNm93A8E5s2bda0aTP0448/au7ceVq2bLkGDOjvtdfv1+8+paSkKi1tiX766SdNnjxFX3/9jUeZ7NjxX1qw4AVt27ZNu3bt0nvvva9x45LUpk2bMu368/vvB/XOO+8qISFef/97M4+P+Pi79dZbb+uPP/7w2thgptzcXG3b9oXatGlTfCwwMFBt2lynLVu2lPqczZu3qE2b6zyOtW/fTps3e56/fv0GNWp0ri655DI98MCDPne7v6oqJqa2UlIW6vffD+rmm2/VP/95jV5++RXl5eWd1esVFLo14f2fVFpFLjo28f3tLFEAfBzLEs5SRESErrrqKk2fPl3bt29XXl6eYmNjde+99+rRRx+V3W7XtGnTNHnyZI0cOVKtW7fWxIkTlZh4+t12zsTgwQO1bds2TZw4SZGRkZo0aYI6dGjvldeWjq13/fnnnzVq1GPKzs5R586dlJAQr61btxaf065dOy1Z8qLGjUtSZmaW6tato44dOyo5+Ykyfa0XX3xJ4eHhJUqGJLVpc53sdrtefvkVr5Z3mOfgwYMqKCgosfygdu3a+uGH0tej79+/X7Vr1y5x/v79x7dp7dChvW699RY1atRIO3fu1LhxSerU6XatWbNKQUFB3h8IJElut1t5eXnKyspSVla2srIylZWVrezsosdZys7OVkFBge67r6/++9//atWq1erd+14NGTJU/fv309ixo8v0NbfuzigxY+uRSdJvrhxt3Z2hK89xlm+AACpMgNsb7+PgrLhcLjkcDu3bt6dMM51xcc11//39NXDg/RWYrqSbbrpVMTG1tWDB86c8z8QNDxiT70tPP6z69etr9eqVuuqq4xt6jBo1Whs2bNC6dWtKPMfprKF58+borrvuLD42b97zmjBhkn7+eXupX2fnzp1q3vxi/ec/K0r9hcybfO17lJeXp8xMz5JZ9M/MzExlZ2cXl9HjJTTTo4zm5eXryJHDJ32dE88vyzUAoaGhCgkJKS68LVpcXur3/FTe/vqARiz97rTnTe3cVP9ufvyXIl/7PpWXaeORzBuTy+VS3boNlJGRUab+UFUwc4tSZWZmav78F9S+fTsFBQXptdde05o1a/TWW29aHQ0oVc2aNRUUFKQDBzzvLHLgwAHFxJS+Q19MTIwO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"; // Use null to indicate no image URL

                      console.log(
                        `Row ${index + 1} - Image URL: ${
                          imageUrl || "No image URL"
                        }`
                      );

                      return imageUrl;
                    });

                  return (
                    <React.Fragment key={innerIndex}>
                      <div className={"row"}>
                        {imageUrls.map((imageUrl, idx) => (
                          <ImageDisplay key={idx} imageUrl={imageUrl} />
                        ))}
                        {renderTable(tableData, innerIndex)}
                      </div>
                    </React.Fragment>
                  );
                }

                // if (tableData[0]["Model Details:"] === "Data Table Probabilities:") {
                //     return (
                //         <React.Fragment key={innerIndex}>
                //             {renderTable(tableData, innerIndex)}
                //
                //         </React.Fragment>
                //     );
                // }
                return null;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CSVComparator;
