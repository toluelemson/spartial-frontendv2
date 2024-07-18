import React from 'react';
import ModelSelection from "../../Models/Comparison/ModelSelection";
import CriteriaSelection from "../../Models/Comparison/SelectionCriteria";
import ModelRow from "../../Models/Details/ModelRow";
import {CRITERIA_LIST} from '../../../constants';
import {ComparisonState, TODO} from '../../../types/types';

interface ComparisonTabsProps {
    filteredModels: TODO;
    comparisonState: ComparisonState;
    handleModelSelection: (modelId: string | null, isLeft: boolean | null) => void;
    handleCriteriaSelection: (criteria: { target: { value: any; }; }) => void;
}


const ComparisonTab: React.FC<ComparisonTabsProps> = ({
                                                          filteredModels,
                                                          comparisonState,
                                                          handleModelSelection,
                                                          handleCriteriaSelection
                                                      }) => {
    return (
        <><ModelSelection models={filteredModels}
                          selectedModel={comparisonState.selectedModelRight || ''}
                          handleModelSelection={handleModelSelection} label=" "/><CriteriaSelection
            selectedCriteria={comparisonState.selectedCriteria}
            handleCriteriaSelection={handleCriteriaSelection} criteriaList={CRITERIA_LIST}/>
            <div className="model-list">
                <ModelRow state={comparisonState}/>
            </div>

        </>

    );
};

export default ComparisonTab;
