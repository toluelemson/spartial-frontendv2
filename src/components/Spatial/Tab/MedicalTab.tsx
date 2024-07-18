import React from 'react';
import {Tab, TabPane, Tabs} from 'react-bootstrap';
import ECGAnalysis from '../../Services/medical/MedDashboard/ECGAnalysis';
import ModelExplanation from '../../Services/medical/MedDashboard/ModelExplanation';
import {ILIMEParametersState} from '../../../types/LimeTypes';

interface MedicalTabsProps {
    state: ILIMEParametersState;
    setAnalyzeData: React.Dispatch<React.SetStateAction<{
        result1: string | null;
        explanations: { [key: string]: string };
        allResponses: { [key: string]: string }[];
    }>>;
}

const MedicalTab: React.FC<MedicalTabsProps> = ({state, setAnalyzeData}) => {
    return (
        <Tabs>
            <Tab eventKey="tab2" title={"Configure Medical Service"}>
                <div className="d-flex">
                    <Tabs defaultActiveKey="subtab5" className="flex-column">
                        <Tab eventKey="subtab5" title="Insert ECG">
                            <div className="side-content px-3">
                                <ECGAnalysis
                                    modelId={state.modelId || ""}
                                    setAnalyzeData={setAnalyzeData}
                                />
                            </div>
                        </Tab>
                        <Tab eventKey="subtab6" title="Model Explanation">
                            <ModelExplanation
                                modelId={state.modelId || ""}
                                setAnalyzeData={setAnalyzeData}
                            />
                        </Tab>
                    </Tabs>
                </div>
            </Tab>
        </Tabs>
    );
};

export default MedicalTab;
