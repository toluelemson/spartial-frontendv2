import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface FairnessSummary {
  [key: string]: number | number[];
}

interface FairnessMetricsGraphProps {
  fairnessSummary: FairnessSummary;
  metrics: string[]; // Add this line
}


const FairnessMetricsGraph: React.FC<FairnessMetricsGraphProps> = ({ metrics, fairnessSummary }) => {
  const labels = metrics.map(metric => metric.replace(/_/g, ' '));
  const ageData = metrics.map(metric => {
    const key = `${metric}_Age`;
    return typeof fairnessSummary[key] === 'number' ? fairnessSummary[key] : 0;
  });
  const genderData = metrics.map(metric => {
    const key = `${metric}_Gender`;
    return typeof fairnessSummary[key] === 'number' ? fairnessSummary[key] : 0;
  });

  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Age',
        data: ageData,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Gender',
        data: genderData,
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
  };

  return (
    <div>
      <h3>Fairness Metrics Graph</h3>
      <Bar data={data} options={options} />
    </div>
  );
};

export default FairnessMetricsGraph;
