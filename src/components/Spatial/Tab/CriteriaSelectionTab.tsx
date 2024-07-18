import React from 'react';
import { Form } from 'react-bootstrap';
import { TODO } from '../../../types/types';

interface CriteriaSelectionProps {
    selectedCriteria: string | null;
    handleCriteriaSelection: (criteria: { target: { value: any; }; }) => void;
    criteriaList: TODO;
}

const CriteriaSelection: React.FC<CriteriaSelectionProps> = ({ selectedCriteria, handleCriteriaSelection, criteriaList }) => {
    return (
        <Form.Group controlId="criteriaSelect" className="mb-3">
            <Form.Label>Criteria</Form.Label>
            <Form.Control as="select" value={selectedCriteria || ''} onChange={handleCriteriaSelection}>
                <option value="">Select a criteria</option>
                {criteriaList.map((criteria: TODO, index: number) => (
                    <option key={index} value={criteria}>{criteria}</option>
                ))}
            </Form.Control>
        </Form.Group>
    );
};

export default CriteriaSelection;
