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
    TooltipItem,
} from 'chart.js';
import { TODO } from '../../types/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
    }>;
}

interface RslChartProps {
    dataSets: TODO | null;
    label: string;
    attackStatus: { isLoading: boolean };
}

const RandomSampleChart: React.FC<RslChartProps> = ({ dataSets, label, attackStatus }) => {
    const [chartData, setChartData] = useState<ChartData>({
        labels: [],
        datasets: [
            {
                label: 'Target Labels',
                data: [],
                backgroundColor: 'rgba(255, 255, 132, 0.9)',
                borderColor: 'rgba(255, 255, 132, 1)',
                borderWidth: 1,
            },
        ],
    });

    useEffect(() => {
        if (!dataSets || !dataSets.resultData) {
            return;
        }

        const labels = dataSets.resultData.map((_: any, index: number) => `${index + 1}`);
        const datasetValues = dataSets.resultData.map((data: { output: string }) => parseFloat(data.output));

        setChartData({
            labels,
            datasets: [
                {
                    label: label,
                    data: datasetValues,
                    backgroundColor: label === 'Original Dataset' ? 'rgba(84, 162, 255, 0.9)' : 'rgba(255, 99, 132, 0.9)',
                    borderColor: label === 'Original Dataset' ? 'rgba(54, 162, 255, 1)' : 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                },
            ],
        });
    }, [dataSets, label]);

    const options = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Class Labels',
                },
                ticks: {
                    callback: function (value: unknown) {
                        if (typeof value === 'number' && Number.isInteger(value)) {
                            return value.toString();
                        }
                        return null;
                    }
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Feature instances',
                },
            },
        },
        plugins: {
            tooltip: {
                enabled: true,
                callbacks: {
                    title: function (tooltipItems: TooltipItem<'bar'>[]) {
                        return `Instance ${tooltipItems[0].label} belongs to ${tooltipItems[0].dataset.label} class label ${tooltipItems[0].formattedValue}`;
                    },
                    label: function (tooltipItem: TooltipItem<'bar'>) {
                        let label = tooltipItem.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (tooltipItem.formattedValue !== null) {
                            label += tooltipItem.formattedValue;
                        }
                        return label;
                    },
                },
            },
            legend: {
                display: true,
                position: 'top' as const,
            },
        },
    };

    return <Bar data={chartData} options={options} />;
};

export default RandomSampleChart;
