// import React from "react";
// import FairnessBarchart from "./FairnessBarchart";

// interface ModelDetail {
//   Metric: string | null;
//   Age: number | null;
//   Gender: number | null;
// }

// const renderBarcharts = (tableData: any[], index: number) => {
//   console.log("tableData", tableData);

//   const separateObjects = (data: ModelDetail[]): ModelDetail[][] => {
//     const separatedData: ModelDetail[][] = [];
//     let tempGroup: ModelDetail[] = [];
//     if (!Array.isArray(data)) {
//       console.error("Data is undefined or not an array");
//       return [];
//     }

//     data.forEach((obj) => {
//       if (obj["Metric"] === null) {
//         if (tempGroup.length) {
//           separatedData.push(tempGroup);
//           tempGroup = [];
//         }
//       } else {
//         tempGroup.push(obj);
//       }
//     });

//     if (tempGroup.length) {
//       separatedData.push(tempGroup);
//     }

//     return separatedData;
//   };

//   return separateObjects(tableData).map((metricsSet, innerIndex) => {
//     // Extracting Metric values from each object
//     const labels = metricsSet
//       .map((row) => row.Metric)
//       .filter((label) => label !== null) as string[];

//     return (
//       <React.Fragment key={innerIndex}>
//         <h6>Bar Plot: </h6>
//         <FairnessBarchart
//           labels={labels}
//           dataAge={metricsSet.map((row) => row.Age ?? 0)}
//           dataGender={metricsSet.map((row) => row.Gender ?? "")}
//         />
//       </React.Fragment>
//     );
//   });
// };
import React from "react";
import FairnessBarchart from "./FairnessBarchart";

interface ModelDetail {
  Metric: string | null;
  Age: number | string | null;
  Gender: number | string | null;
}

const renderBarcharts = (tableData: ModelDetail[], index: number) => {
  console.log("tableData", tableData);

  const separateObjects = (data: ModelDetail[]): ModelDetail[][] => {
    const separatedData: ModelDetail[][] = [];
    let tempGroup: ModelDetail[] = [];

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

  return separateObjects(tableData).map((metricsSet, innerIndex) => {
    // Extracting Metric values from each object
    const labels = metricsSet
      .filter((row) => row.Metric !== null)
      .map((row) => row.Metric as string);

    return (
      <React.Fragment key={innerIndex}>
        <h6>Bar Plot {innerIndex + 1}: </h6>
        <FairnessBarchart
          labels={labels}
          dataAge={metricsSet.map((row) =>
            typeof row["Age"] === "number" ? row["Age"] : 0
          )}
          dataGender={metricsSet.map((row) =>
            typeof row["Gender"] === "number" ? row["Gender"] : 0
          )}
        />
      </React.Fragment>
    );
  });
};

export default renderBarcharts;
