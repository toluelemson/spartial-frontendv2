import React from 'react';
import { Form } from 'react-bootstrap';
import { TODO } from '../../types/types';

interface ModelSelectionProps {
    models: TODO;
    isFieldDisabled?: boolean;
    selectedModel: string | null;
    handleModelSelection: (modelId: string | null, isLeft: boolean | null) => void;
    label: string;
}

const ModelSelection: React.FC<ModelSelectionProps> = ({ models, isFieldDisabled, selectedModel, handleModelSelection, label }) => {
    return (
        <Form.Group controlId="modelSelect" className="mb-3">
            <Form.Label>{label}</Form.Label>
            <Form.Control as="select" value={selectedModel || ''} onChange={(e) => handleModelSelection(e.target.value, true)} disabled={isFieldDisabled}>
                <option value="">Select a model</option>
                {models && models.map((model: TODO) => (
                    <option key={model.modelId} value={model.modelId}>{model.modelId}</option>
                ))}
            </Form.Control>
        </Form.Group>
    );
};

export default ModelSelection;
