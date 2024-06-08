import { useEffect, useState, useCallback } from 'react';
import Papa from 'papaparse';
import { requestViewModelDatasets, requestViewPoisonedDatasets } from "../../api";

interface DataModel {
    resultData: string[];
}

const useFetchModelDataset = (isPoisoned: boolean, modelId: string, datasetType: string) => {
    const [originalDataset, setOriginalDataset] = useState<DataModel>({ resultData: [] });
    const [poisonedDataset, setPoisonedDataset] = useState<DataModel>({ resultData: [] });
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchData = useCallback(async () => {
        if (!modelId) return;

        setLoading(true);
        try {
            const [csvNormalDataString, csvPoisonedDataString] = await Promise.all([
                requestViewModelDatasets(modelId, "train"),
                requestViewPoisonedDatasets(modelId, "rsl")
            ]);

            const parseCSV = (csvDataString: string, setDataset: React.Dispatch<React.SetStateAction<DataModel>>) => {
                Papa.parse<string>(csvDataString, {
                    complete: (result) => {
                        if (result.data.length === 0) {
                            setDataset({ resultData: [] });
                        } else if (Array.isArray(result.data)) {
                            setDataset({ resultData: result.data as string[] });
                        } else {
                            throw new Error('Error parsing data');
                        }
                    },
                    header: true,
                });
            };

            if (isPoisoned) {
                parseCSV(csvPoisonedDataString, setPoisonedDataset);
            } else {
                parseCSV(csvNormalDataString, setOriginalDataset);
            }

        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
        } finally {
            setLoading(false);
        }
    }, [modelId, isPoisoned]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { poisonedDataset, originalDataset, error, loading, refetch: fetchData };
};

export default useFetchModelDataset;
