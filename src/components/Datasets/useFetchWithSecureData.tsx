import { useEffect, useState } from "react";
import {DataItem, ModelListType } from "../../types/types";
import {requestWithSecureData, requestWithSecureModels } from "../../api";

const useWithSecureDatasetAPI = () => {
    const [dataList, setDataList] = useState<DataItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDataList = async () => {
            try {
                const data = await requestWithSecureData();
                setDataList(data);
            } catch (error) {
                console.error("Error fetching data list:", error);
                setError("Failed to fetch dataset");
            }
            finally {
                setLoading(false);
            }
        };
        fetchDataList();
    }, [loading]);

    return { dataList, loading, error };
};

export default useWithSecureDatasetAPI;
