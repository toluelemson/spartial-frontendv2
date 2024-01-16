import React from 'react';
import {Pie} from 'react-chartjs-2';
import {Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);


type PieDataItem = {
    type: string;
    value: number;
}

interface PieChartComponentProps {
    data: PieDataItem[];
}


const PieChartComponent: React.FC<PieChartComponentProps> = ({data}) => {

    const chartData: ChartData<'pie', number[], string> = {
        labels: data.map(item => item.type),
        datasets: [
            {
                data: data.map(item => item.value),
                backgroundColor:  ['#ff6384', '#36a2eb', '#cc65fe'],
                hoverBackgroundColor: ['#ff6384', '#36a2eb', '#cc65fe']
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    boxWidth: 20,
                },
            },
            title: {
                display: true,
                text: 'Custom Pie Chart Title',
            },
            tooltip: {

            },
        },
        animation: {
            animateScale: true,
        },
    };


    return (
        <div style={{width: '100%', height: 'auto', maxWidth: '400px'}}>
            <Pie data={chartData} options={options}/>
        </div>
    );
};

export default PieChartComponent;
