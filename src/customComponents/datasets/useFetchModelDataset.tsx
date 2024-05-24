import {useEffect, useState} from 'react';
import Papa from 'papaparse';
import {requestViewModelDatasets, requestViewPoisonedDatasets} from "../../api";

interface DataModel {
    resultData: string[];
}

const useFetchModelDataset = (isPoisoned: boolean, modelId: string, datasetType: string) => {
    const [originalDataset, setOriginalDataset] = useState<DataModel>({resultData: []});
    const [poisonedDataset, setPoisonedDataset] = useState<DataModel>({resultData: []});
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!modelId) return;

            setLoading(true);
            try {
                const [csvNormalDataString, csvPoisonedDataString] = await Promise.all([
                    requestViewModelDatasets(modelId, datasetType),
                    requestViewPoisonedDatasets(modelId, datasetType)
                ]);
                const parseCSV = (csvDataString: string, setDataset: React.Dispatch<React.SetStateAction<DataModel>>) => {
                    Papa.parse<string>(csvDataString, {
                        complete: (result) => {
                            if (result.data.length === 0) {
                                setDataset({resultData: []});
                            } else if (Array.isArray(result.data)) {
                                setDataset({resultData: result.data as string[]});
                            } else {
                                throw new Error('Error parsing data');
                            }
                        },
                        header: true,
                    });
                };

                if (csvNormalDataString) {
                    parseCSV(csvNormalDataString, setOriginalDataset);
                }

                if (csvPoisonedDataString) {
                    parseCSV(csvPoisonedDataString, setPoisonedDataset);
                }

            } catch (err) {
                setError(err instanceof Error ? err : new Error('An error occurred while fetching data'));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [modelId, datasetType]);

    // const dataset = isPoisoned ? poisonedDataset : originalDataset;
    
    return {poisonedDataset, originalDataset, error, loading};
};

export default useFetchModelDataset;
