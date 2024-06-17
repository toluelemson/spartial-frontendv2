import React from 'react';
import {ModelListType} from "../../../types/types";

interface ModelSelectionProps {
    models: ModelListType | null;
    selectedModel: string | null;
    handleModelSelection: (modelId: string, isLeft: boolean) => void;
    isFieldDisabled?: boolean,
    label: string;
}

const ModelSelection: React.FC<ModelSelectionProps> = ({
                                                           models,
                                                           selectedModel,
                                                           handleModelSelection,
                                                           label,
                                                           isFieldDisabled
                                                       }) => {

    const isLeft = label === "Model 1"
    return (
        <><h4>{label}</h4>
            <select
                className="form-select"
                                  aria-label={`Select ${label}`}
                                  onChange={(e) => {
                                      console.log(e.target.value)
                                      handleModelSelection(e.target.value, isLeft)
                                  }}
                                  disabled={isFieldDisabled}
                                  value={selectedModel || ''}>
            <option value="">Select a Model</option>
            {models && models.map((model) => (
                <option key={model.modelId} value={model.modelId.toString()}>
                    {model.modelId}
                </option>
            ))}
        </select></>
    );
};

export default ModelSelection;
