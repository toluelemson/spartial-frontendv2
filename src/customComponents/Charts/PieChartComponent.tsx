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

const options = {
    maintainAspectRatio: false,
    responsive: true
};

const PieChartComponent: React.FC<PieChartComponentProps> = ({data}) => {
    // Function to generate random colors
    // const getRandomColor = () => {
    //     const letters = '0123456789ABCDEF';
    //     let color = '#';
    //     for (let i = 0; i < 6; i++) {
    //         color += letters[Math.floor(Math.random() * 16)];
    //     }
    //     return color;
    // };

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
                position: 'top' as const, // 'top', 'left', 'bottom', 'right', or 'chartArea'
                labels: {
                    boxWidth: 20,
                },
            },
            title: {
                display: true,
                text: 'Custom Pie Chart Title',
            },
            tooltip: {
                // Custom tooltip styling can be done here
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
