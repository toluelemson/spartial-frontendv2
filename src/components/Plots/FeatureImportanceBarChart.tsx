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
                <XAxis dataKey="feature" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="importance_value" fill="#8884d8" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default FeatureImportanceBarChart;