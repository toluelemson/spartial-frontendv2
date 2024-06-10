import React from "react";
import { Bar } from "react-chartjs-2";

export interface BarChartProps {
  labels: string[];
  dataAge: (string | number | string[])[];
  dataGender: (string | number | string[])[];
}

const FairnessBarchart: React.FC<BarChartProps> = ({
  labels,
  dataAge,
  dataGender,
}) => {
  const parseData = (data: (string | number | string[])[]) =>
    data.map((value) =>
      typeof value === "string" ? parseFloat(value) : value
    );

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Age",
        data: parseData(dataAge),
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
      {
        label: "Gender",
        data: parseData(dataGender),
        backgroundColor: "rgba(255,99,132,0.2)",
        borderColor: "rgba(255,99,132,1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default FairnessBarchart;
