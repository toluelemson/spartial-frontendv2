import React from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, ChartData, ChartOptions, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface ModelDetail {
    "Model Details:": string | null;
    "__parsed_extra"?: (string | number | null)[];
}

interface LollipopChartProps {
    data: ModelDetail[];
}

const LollipopChart: React.FC<LollipopChartProps> = ({ data }) => {
    const filteredData = data.filter(item => item["Model Details:"] != null && item.__parsed_extra != null);

    const chartData: ChartData<'scatter'> = {
        datasets: [
            {
                label: 'Lollipop Chart',
                data: filteredData.map((item, index) => {
                    // Check if __parsed_extra is not undefined and its first element is a number
                    const xValue = Array.isArray(item.__parsed_extra) && typeof item.__parsed_extra[0] === 'number' ? item.__parsed_extra[0] : 0;
                    return { x: xValue, y: index };
                }),
                backgroundColor: 'rgba(255, 99, 132, 1)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                pointRadius: 5,
                pointHoverRadius: 7,
                showLine: true,
                spanGaps: true
            }
        ]
    };

    const options: ChartOptions<'scatter'> = {
        scales: {
            y: {
                type: 'category',
                labels: filteredData.map(item => item["Model Details:"] as string),
            },
            x: {
                type: 'linear'
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };

    return <Scatter data={chartData} options={options} />;
};

export default LollipopChart;
