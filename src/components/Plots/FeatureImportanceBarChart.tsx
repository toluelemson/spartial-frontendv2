import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label,
} from 'recharts';

interface FeatureImportanceData {
    feature: string;
    importance_value: number;
}

// Define the type for the component props
interface FeatureImportanceBarChartProps {
    data: FeatureImportanceData[];
}

const FeatureImportanceBarChart: React.FC<FeatureImportanceBarChartProps> = ({ data }) => {
    return (
        <div style={{ textAlign: 'center' }}>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature">
                        <Label value="Features" offset={-5} position="insideBottom" />
                    </XAxis>
                    <YAxis>
                        <Label value="Importance Value" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
                    </YAxis>
                    <Tooltip />
                    <Bar dataKey="importance_value" fill="#8884d8">
                    </Bar>
                    <Legend />
                </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '10px', fontSize: '14px', color: '#555' }}>
                <strong>Explanation</strong>: This bar chart illustrates the importance values of various features in a machine learning model. The X-axis represents the different features, while the Y-axis shows their corresponding importance values. The height of each bar indicates the significance of the feature, with higher bars representing more influential features.
            </div>
        </div>
    );
};

export default FeatureImportanceBarChart;
