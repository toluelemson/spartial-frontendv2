import React, { useState } from "react";
import FileUpload from "../Fairness/FileUploadForm";
import { fairnessAPI } from "../../../api";

interface FairnessSummary {
    [key: string]: string | string[];
}

const FairnessTable: React.FC<{ fairnessSummary: FairnessSummary }> = ({ fairnessSummary }) => {
  const metrics = new Set<string>();
  const categories = new Set<string>();

  console.log(fairnessSummary)

  Object.keys(fairnessSummary).forEach(key => {
    const metricName = key.split('_').slice(0, -1).join('_');
    const categoryName: string = key.split('_').slice(-1)[0];
    categories.add("Metric");
    categories.add(categoryName);
    metrics.add(metricName);
  });

  return (
    <table className="table mt-5">
      <thead>
        <tr>
          {Array.from(categories).map(category => (
            <th key={category}>{category}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from(metrics).map(metric => {
          const ageKey = `${metric}_Age`;
          const genderKey = `${metric}_Gender`;
          const ageValue = fairnessSummary[ageKey];
          const genderValue = fairnessSummary[genderKey];

          return (
            <tr key={metric}>
              <td>{metric.replace(/_/g, ' ')}</td>
              <td>{Array.isArray(ageValue) ? ageValue.join(', ') : ageValue}</td>
              <td>{Array.isArray(genderValue) ? genderValue.join(', ') : genderValue}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};


const Fairness: React.FC = () => {
    const [csvData, setCSVData] = useState<FairnessSummary>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (files: File[] | File) => {
        setError(null);
        setIsLoading(true);
        const filesArray =  Array.isArray(files) ? files : [files];

        for (const file of filesArray) {
            if (file.type !== "text/csv") {
                setError("Please select a CSV file.");
                setIsLoading(false);
                return;
            }
            // setSelectedFile(file);
            const formData = new FormData();
            formData.append('file', file);
            await handleFileSubmit(formData);
        }

        setIsLoading(false);
    };

    const handleFileSubmit = async (formData: FormData): Promise<void> => {
        try {
            const res = await fairnessAPI(formData);
            const json = await res.text();
            const data = JSON.parse(json);
            const entries = Object.entries(data.fairness_summary);
            const formattedData: FairnessSummary = entries.reduce<FairnessSummary>((acc, [key, value]) => {
                if (typeof value === 'string' || Array.isArray(value)) {
                    acc[key] = value;
                } else {
                    console.error(`Unexpected value type for key ${key}:`, value);
                }
                return acc;
            }, {} as FairnessSummary);
            setCSVData(formattedData);
        } catch (error) {
            console.error(error);
            setError('Error processing your request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Fairness</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <FileUpload onFileUpload={handleFileUpload} onFileSubmit={handleFileSubmit} />
            {isLoading && <p>Loading...</p>}
            <FairnessTable fairnessSummary={csvData} />
        </div>
    );
};

export default Fairness;
