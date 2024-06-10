import React from 'react';
import { Container, Row, Col, Table, Dropdown, DropdownButton } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import {BarElement, CategoryScale, Chart, LinearScale} from "chart.js";


Chart.register(BarElement, CategoryScale, LinearScale);

const data = {
    labels: ['Your', 'Data', 'Labels'],
    datasets: [
        {
            label: 'Dataset Label',
            data: [12, 19, 3, 5, 2, 3], // Your data array here
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
        },
    ],
};

const options = {
    scales: {
        y: {  // 'y' for vertical scales
            type: 'linear', // Define the type of scale
            beginAtZero: true,
        },
        x: {  // 'x' for horizontal scales
            type: 'linear',
            // additional configuration for the x-axis
        }
    },
};

const HistogramPlot: React.FC = () => {
    // State for selected feature and transformation
    const [selectedFeature, setSelectedFeature] = React.useState('duration');
    const [transformation, setTransformation] = React.useState('square-root');

    return (
        <Container>
            <Row>
                <Col>
                    <h2>Histogram Plot</h2>
                    <DropdownButton id="dropdown-feature-selection" title={selectedFeature}>
                        {/* Populate with actual features */}
                        <Dropdown.Item onClick={() => setSelectedFeature('feature1')}>Feature 1</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSelectedFeature('feature2')}>Feature 2</Dropdown.Item>
                    </DropdownButton>
                    <DropdownButton id="dropdown-transformation-selection" title={transformation}>
                        {/* Populate with actual transformations */}
                        <Dropdown.Item onClick={() => setTransformation('transformation1')}>Transformation 1</Dropdown.Item>
                        <Dropdown.Item onClick={() => setTransformation('transformation2')}>Transformation 2</Dropdown.Item>
                    </DropdownButton>

                    {/* Statistical Information Table */}
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Unique Values</th>
                            <th>Missing Values</th>
                            <th>Mean</th>
                            <th>Standard Deviation</th>
                            <th>Median</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/* Populate with actual statistical data */}
                        <tr>
                            <td>{selectedFeature}</td>
                            <td>2838</td>
                            <td>0</td>
                            <td>4830.80</td>
                            <td>6092.62</td>
                            <td>1006.65</td>
                        </tr>
                        </tbody>
                    </Table>

                    {/* Histogram Chart */}
                    <Bar data={data}  />
                </Col>
            </Row>
        </Container>
    );
};

export default HistogramPlot;
