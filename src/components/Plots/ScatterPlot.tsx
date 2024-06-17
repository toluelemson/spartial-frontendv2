import React, { useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Container, Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import Chart from 'chart.js/auto';
import {BarElement, CategoryScale, LinearScale} from "chart.js";
import _default from "chart.js/dist/core/core.interaction";



// Assuming this is the structure of your data
const data = {
    datasets: [
        {
            label: 'Malware traffic',
            data: [{ x: 10, y: 20 }, { x: 15, y: 10 }], // Replace with your data
            backgroundColor: 'rgba(255, 99, 132, 1)',
        },
        {
            label: 'Normal traffic',
            data: [{ x: 5, y: 15 }, { x: 20, y: 5 }], // Replace with your data
            backgroundColor: 'rgba(53, 162, 235, 1)',
        }
    ],
};

const options = {
    scales: {
        x: {
            type: 'linear',
            position: 'bottom'
        }
    }
};

const ScatterPlotComponent: React.FC = () => {
    const [selectedX, setSelectedX] = useState('duration');
    const [selectedY, setSelectedY] = useState('time_between_pkts_sum');

    // You would have a function to update the chart data based on the selected variables
    // For example:
    const updateChartData = (newX: string, newY: string) => {
        // Logic to update the chart's data based on the selected newX and newY
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h2>Scatter Plot</h2>
                    <DropdownButton id="dropdown-x-axis" title={selectedX} onSelect={(eventKey) => {
                        const newSelectedX = eventKey ?? selectedX;
                        setSelectedX(newSelectedX);
                        updateChartData(newSelectedX, selectedY);
                    }}>
                        <Dropdown.Item eventKey="duration">Duration</Dropdown.Item>
                        {/* Other options... */}
                    </DropdownButton>
                    <DropdownButton id="dropdown-y-axis" title={selectedY} onSelect={(eventKey) => {
                        const newSelectedY = eventKey ?? selectedY;
                        setSelectedY(newSelectedY);
                        updateChartData(selectedX, newSelectedY);
                    }}>
                        <Dropdown.Item eventKey="time_between_pkts_sum">Time Between Packets Sum</Dropdown.Item>
                        {/* Other options... */}
                    </DropdownButton>
                    <Scatter data={data}  />
                </Col>
            </Row>
        </Container>
    );
};

export default ScatterPlotComponent;
