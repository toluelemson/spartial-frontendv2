import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { requestViewModelDatasets } from "../../api";

interface DataModel {
    resultData: string[];
}

const useFetchModelDataset = (modelId: string, datasetType: string) => {
    const [originalDataset, setOriginalDataset] = useState<DataModel>({ resultData: [] });
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!modelId) return;

            setLoading(true);
            try {
                const csvDataString = await requestViewModelDatasets(modelId, datasetType);
                if (!csvDataString) return;

                Papa.parse(csvDataString, {
                    complete: (result) => {
                        if (result.data.length === 0) {
                            setOriginalDataset({ resultData: [] });
                            return;
                        }

                        if (Array.isArray(result.data)) {
                            setOriginalDataset({ resultData: result.data as string[] });
                        } else {
                            throw new Error('Error parsing data');
                        }
                    },
                    header: true,
                });
            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [modelId, datasetType]);

    return { originalDataset, error, loading }; 
};

export default useFetchModelDataset;
