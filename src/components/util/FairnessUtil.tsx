import Papa from "papaparse";

export interface CSVData {
  Metric: string;
  Age: string | number;
  Gender: string | number;
}

export const exportToCSV = (data: CSVData[], filename: string) => {
  const csv = Papa.unparse(data);
  const csvData = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const csvURL = window.URL.createObjectURL(csvData);

  const tempLink = document.createElement("a");
  tempLink.href = csvURL;
  tempLink.setAttribute("download", filename);
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
};
