import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
// import {TODO} from "../../types/types";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface OutputData {
    output: string; // Assuming 'output' is a string based on your dataset.
    // Define other properties as needed.
}

interface RslChartProps {
    dataSets: {
        resultData: OutputData[]; // Define the type of your dataset correctly.
    },
    attackStatus?: boolean;
}

// const RandomSampleChart: React.FC<RslChartProps> = ({ dataSets }) => {
//     const [chartData, setChartData] = useState({
//         labels: [],
//         datasets: [
//             {
//                 label: 'Target Labels',
//                 data: [],
//                 backgroundColor: 'rgba(54, 162, 235, 0.2)',
//                 borderColor: 'rgba(54, 162, 235, 1)',
//                 borderWidth: 1,
//             },
//         ],
//     });
//
//     // useEffect(() => {
//     //     const resultData = Array.isArray(dataSets.resultData) ? dataSets.resultData : [];
//     //     const labels = resultData.map((_, index) => `% Metric ${index + 1}`);
//     //     const datasetValues = resultData.map(data => parseFloat(data.output));
//     //
//     //     setChartData({
//     //         labels,
//     //         datasets: [
//     //             {
//     //                 label: 'Target Labels',
//     //                 data: datasetValues,
//     //                 backgroundColor: 'rgba(54, 162, 235, 0.2)',
//     //                 borderColor: 'rgba(54, 162, 235, 1)',
//     //                 borderWidth: 1,
//     //             },
//     //         ],
//     //     });
//     // }, [dataSets]);
//
//     const options = {
//         scales: {
//             y: {
//                 beginAtZero: true,
//             },
//         },
//         plugins: {
//             legend: {
//                 display: true,
//                 position: 'top',
//             },
//         },
//     };
//
//     // return <Bar data={chartData} options={options} />;
// };

// export default RandomSampleChart;