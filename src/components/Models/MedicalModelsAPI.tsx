import { useEffect, useState } from "react";
import { ModelListType } from "../../types/types";
import { requestMedicalModels } from "../../api";

const useMedicalModelAPI = () => {
  const [models, setModels] = useState<ModelListType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await requestMedicalModels();
        // setModels(updatedModels);
        const updatedModels: ModelListType = response.map((model: any) => ({
          ...model,
          lastBuildAt: model.lastBuildAt,
        }));
        console.log("Fetched models:", updatedModels);
        setModels(updatedModels);
      } catch (err) {
        setError("Failed to fetch models");
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [loading]);

  return { models, loading, error };
};

export default useMedicalModelAPI;
