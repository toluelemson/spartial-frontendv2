import React from 'react';

interface CriteriaSelectionProps {
    selectedCriteria: string | null;
    handleCriteriaSelection: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    criteriaList: string[];
}

const CriteriaSelection: React.FC<CriteriaSelectionProps> = ({
                                                                 selectedCriteria,
                                                                 handleCriteriaSelection,
                                                                 criteriaList
                                                             }) => {
    return (
        <>
            <select className="form-select mt-3"
                    aria-label="Select Comparison Criteria"
                    onChange={handleCriteriaSelection}
                    value={selectedCriteria || ''}>
                <option value="">Choose comparison criteria</option>
                {criteriaList.map((criteria, index) => (
                    <option key={index} value={criteria}>
                        {criteria}
                    </option>
                ))}
            </select></>

    );
};

export default CriteriaSelection;
