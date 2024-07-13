import React, {useState} from 'react';
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
import Gpt3Fetcher from '../util/Gpt3Fetcher';

interface FeatureImportanceData {
    feature: string;
    importance_value: number;
}

interface FeatureImportanceBarChartProps {
    data: FeatureImportanceData[];
}

const FeatureImportanceBarChart: React.FC<FeatureImportanceBarChartProps> = ({data}) => {
    const [explanation, setExplanation] = useState('');
    const [error, setError] = useState('');

    const handleFetchSuccess = (response: string) => {
        setExplanation(response);
        setError('');
    };

    const handleFetchError = (error: string) => {
        setError(error);
        setExplanation('');
    };

    const parsedData = JSON.stringify(data);
    const prompt = `Here is the data: ${parsedData}. Provide a simple explanation of the result of the parsed data in one sentence.`;

    return (
        <div style={{textAlign: 'center', fontFamily: 'Arial, sans-serif', backgroundColor: '#fff', padding: '20px'}}>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis dataKey="feature">
                        <Label value="Features" offset={-5} position="insideBottom"
                               style={{fill: '#333', fontSize: '14px'}}/>
                    </XAxis>
                    <YAxis>
                        <Label
                            value="Importance Value"
                            angle={-90}
                            position="insideLeft"
                            style={{textAnchor: 'middle', fill: '#333', fontSize: '14px'}}
                        />
                    </YAxis>
                    <Tooltip/>
                    <Bar dataKey="importance_value" fill="#8884d8"/>
                    <Legend/>
                </BarChart>
            </ResponsiveContainer>
            <Gpt3Fetcher prompt={prompt} onFetchSuccess={handleFetchSuccess} onFetchError={handleFetchError}/>
            <div style={{
                marginTop: '20px',
                padding: '15px',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                width: '60%',
                margin: 'auto'
            }}>
                {error ? error : explanation}
            </div>
        </div>
    );
};

export default FeatureImportanceBarChart;
