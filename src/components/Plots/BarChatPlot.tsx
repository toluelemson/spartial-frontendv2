import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import Chart, {registerables} from 'chart.js/auto';

Chart.register(...registerables);

// Sample data for the bar plot
const chartData = {
    labels: ['malware'],
    datasets: [
        {
            label: '0',
            data: [1419],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        },
        {
            label: '1',
            data: [1419],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
        },
    ],
};

const options = {
    indexAxis: 'y',
    elements: {
        bar: {
            borderWidth: 2,
        },
    },
    responsive: true,
    plugins: {
        legend: {
            position: 'right',
        },
        title: {
            display: true,
            text: 'Bar Plot',
        },
    },
};

const BarPlotComponent: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState('malware');

    // Function to update chart data (not fully implemented here)
    const updateChartData = (category: string) => {
        // Logic to update chart's data based on selected category
        setSelectedCategory(category);
    };

    return (
        <div>
            <h2>Bar Plot</h2>
            <DropdownButton
                id="dropdown-item-button"
                title={selectedCategory}
                onSelect={(eventKey) => {
                    const category = eventKey ?? selectedCategory;
                    updateChartData(category);
                }}
            >
                <Dropdown.Item eventKey="malware">Malware</Dropdown.Item>
                {/* Add other categories here */}
            </DropdownButton>
            <Bar data={chartData}  />
        </div>
    );
};

export default BarPlotComponent;
