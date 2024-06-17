import React from 'react';

interface PerformanceMetrics {
    metric: string;
    class0: string;
    class1: string;
    class2: string;
}

interface PerformanceRowProps {
    data?: PerformanceMetrics;
}

const PerformanceRow: React.FC<PerformanceRowProps> = ({data}) => {

    const colSpan = Object.keys({metric: '', class0: '', class1: '', class2: ''}).length;
    console.log('data', data);
    if (!data) {
        // Calculate the colSpan dynamically based on PerformanceMetrics keys
        const colSpan = Object.keys({metric: '', class0: '', class1: '', class2: ''}).length;
        return (
            <tr>
                <td colSpan={colSpan}>Data not available</td>
            </tr>
        );
    }

    const excludedKeys = ["metric", "key"];
    
    return (
        <tr>
            <td>{data.metric}</td>
            {Object.keys(data)
                .filter(key => !excludedKeys.includes(key))
                .map((key, index) => (
                    <td key={index}>{data[key as keyof PerformanceMetrics]}</td>
                ))}
        </tr>
    );
};

export default PerformanceRow;
