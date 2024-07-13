import {useEffect, useState} from 'react';
import {ModelListType} from '../../types/types';
import {requestAllModels} from '../../api';

const useModelAPI = () => {
    const [models, setModels] = useState<ModelListType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const updatedModels = await requestAllModels();
                setModels(updatedModels);
            } catch (err) {
                setError('Failed to fetch models');
            } finally {
                setLoading(false);
            }
        };
        fetchModels();
    }, [loading]);

    return {models, loading, error};
};

export default useModelAPI;
