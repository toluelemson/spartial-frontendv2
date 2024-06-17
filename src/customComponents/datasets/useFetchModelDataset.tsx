import {useState, useEffect, useCallback} from 'react';
import Papa from 'papaparse';
import {requestViewModelDatasets, requestViewPoisonedDatasets} from '../../api';

interface DataModel {
    resultData: string[];
}

const useFdetchModelDataset = (isPoisoned: boolean, modelId: string, attackType: string) => {
    const [originalDataset, setOriginalDataset] = useState<DataModel>({resultData: []});
    const [poisonedDataset, setPoisonedDataset] = useState<DataModel>({resultData: []});
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);


    useEffect(() => {
        fetchNormalData()
            // fetchPoisonedData()
    }, [loading, modelId, attackType, isPoisoned]);
    
    const fetchNormalData = useCallback(async () => {
        if (!modelId) return;

        setLoading(true);
        try {
            const csvNormalDataString = await requestViewModelDatasets(modelId, "train");

            Papa.parse<string>(csvNormalDataString, {
                complete: (result) => {
                    if (result.data.length === 0) {
                        setOriginalDataset({resultData: []});
                    } else if (Array.isArray(result.data)) {
                        setOriginalDataset({resultData: result.data as string[]});
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
    }, [modelId]);
    

    useEffect(() => {
        if (isPoisoned) {
            // fetchPoisonedData();
        } else {
            fetchNormalData();
        }
    }, [fetchNormalData,  isPoisoned]);

    return {
        poisonedDataset,
        originalDataset,
        error,
        loading,
    };
};
export default useFdetchModelDataset;
