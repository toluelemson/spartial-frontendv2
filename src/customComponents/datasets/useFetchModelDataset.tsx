import { useEffect, useState } from 'react';
import Papa from 'papaparse';

interface DataModel {
    resultData: string[];
}

interface Api {
    requestViewModelDatasets: (modelId: string, dataType: string) => Promise<string>;
}

const useFetchModelData = (modelId: string, api: Api) => {
    const [data, setData] = useState<DataModel | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const csvDataString = await api.requestViewModelDatasets(modelId, "train");
                Papa.parse(csvDataString, {
                    complete: (result) => {
                        if (Array.isArray(result.data)) {
                            setData({ resultData: result.data as string[] });
                        }
                    },
                    header: true,
                });
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Error fetching data'));
            } finally {
                setLoading(false);
            }
        };

        if (modelId) {
            fetchData();
        }
    }, [api, modelId]); // Ensured that useEffect is dependent on api and modelId

    return { data, error, loading };
};

export default useFetchModelData;
