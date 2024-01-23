import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartComponentProps {
    "data"?: any[]
   "Model Details:"?: string | null;
        "__parsed_extra"?: (string | number | null)[];

}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data }) => {
    // Extracting pie chart data
    const pieData = data && data.filter(item => item["Model Details:"] !== "Pie Chart Data:" && item["Model Details:"] !== "Type");
    const labels = pieData && pieData.map(item => item["Model Details:"]);
    const values = pieData && pieData.map(item => item.__parsed_extra ? item.__parsed_extra[0] : 0);

    // Chart data for react-chartjs-2
    const chartData = {
        labels: labels,
        datasets: [
            {
                data: values,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',  // red
                    'rgba(54, 162, 235, 0.2)',  // blue
                    'rgba(255, 206, 86, 0.2)'   // yellow
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

     const chartContainerStyle = {
        width: '400px',
        height: '400px',
        margin: 'auto'
    };

    return  <div style={chartContainerStyle}>
            <Pie data={chartData} />
        </div>
};

export default PieChartComponent;
