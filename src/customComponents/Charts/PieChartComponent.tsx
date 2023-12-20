import React from 'react';
import { Pie } from 'react-chartjs-2';
import {Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);


type PieDataItem = {
  type: string;
  value: number;
}

interface PieChartComponentProps {
  data: PieDataItem[];
}

const options = {
  maintainAspectRatio: false,
  responsive: true
};

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data }) => {
  const chartData: ChartData<'pie', number[], string> = {
    labels: data.map((item: { type: any; }) => item.type),
    datasets: [
      {
        data: data.map((item: { value: any; }) => item.value),
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
        hoverBackgroundColor: ['#ff6384', '#36a2eb', '#cc65fe']
      }
    ]
  };

  return (
       <div style={{ width: '400px', height: '400px' }}>
    <Pie data={chartData} options={options} />
  </div>
  )

};

export default PieChartComponent;
