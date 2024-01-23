import React, {useState, DragEvent} from 'react';
import Papa from 'papaparse';
import PieChartComparison from "./pieChartComparison";
import LollipopChart from "./LollipopChartComparison";

const CSVComparator: React.FC = () => {
    const [filesData, setFilesData] = useState<any>([]);
    const [fileNames, setFileNames] = useState<string[]>([]);

    interface ModelDetail {
        "Model Details:": string | null;
        "__parsed_extra"?: (string | number | null)[];
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
            skipEmptyLines: true
        });
    };

    const separateObjects = (data: ModelDetail[]): ModelDetail[][] => {
        const separatedData: ModelDetail[][] = [];
        let tempGroup: ModelDetail[] = [];
        if (!Array.isArray(data)) {
            console.error('Data is undefined or not an array');
            return [];
        }


        data.forEach(obj => {

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

    const renderTable = (tableData: any[], index: React.Key | null | undefined) => {

        return (
            <table key={index} className="table table-bordered table-striped table-hover">
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
        );
    };

    return (
        <div className="container mt-4">
            <div className="row mb-3">
                <div className="col">
                    <div onDrop={handleDrop}
                         onDragOver={(e) => e.preventDefault()} className="drop-zone">
                        Drag and drop CSV files here or click to select
                    </div>
                    <input type="file" multiple className="form-control" id="fileInput" accept=".csv"
                           style={{display: 'none'}}
                           onChange={handleFileChange}/>
                    <label htmlFor="fileInput" className="btn btn-primary mt-2">Select Files</label>
                </div>
            </div>
            <div className="row">
                {filesData.map((data: any, index: any) => (
                    <div key={fileNames[index]} className="col-md-6">
                        <h5>{fileNames[index]}</h5>
                        <div>
                            {separateObjects(data).map((tableData, innerIndex) => {

                                console.log(tableData)

                                if (tableData[0]["Model Details:"] === "Pie Chart Data:") {
                                    return (
                                        <React.Fragment key={innerIndex}>

                                            <div className={"row"}>
                                                {/*{renderTable(tableData, innerIndex)}*/}
                                                <PieChartComparison data={tableData}/>
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


                                if (tableData[0]["Model Details:"] === "Model ID") {
                                    return (
                                        <React.Fragment key={innerIndex}>
                                            {renderTable(tableData, innerIndex)}
                                        </React.Fragment>
                                    );
                                }


                                if (tableData[0]["Model Details:"] === "LIME Values:") {
                                    return (
                                        <React.Fragment key={innerIndex}>
                                            <LollipopChart data={tableData}/>
                                            {renderTable(tableData, innerIndex)}
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