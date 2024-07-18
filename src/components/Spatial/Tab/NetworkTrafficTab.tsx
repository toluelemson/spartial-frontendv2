import React, { useState} from 'react';
import {Tab, Tabs} from 'react-bootstrap';
import SHAPTab from '../../XAI/SHAPTab';
import {useParams} from "react-router";
import AdversarialTab from '../../AdversarialML/AdversarialML';
import {ILIMEParametersState} from '../../../types/LimeTypes';
import {LIMETab} from '../../XAI/LimeTab';
import {ModelListType, TODO} from '../../../types/types';
import {getLabelsListAppXAI} from '../../util/utility';
import {useSpatialContext} from '../../../context/context';


// interface NetworkTrafficTabsProps {
//     state: ILIMEParametersState;
//     setState: React.Dispatch<React.SetStateAction<ILIMEParametersState>>;
//     comparisonState: ComparisonState;
// }
//
//
// interface ComparisonState {
//     models: ModelListType | null;
//     dataStatsLeft: any[];
//     dataStatsRight: any[];
//     dataBuildConfigLeft: object;
//     dataBuildConfigRight: object;
//     selectedModelLeft: string | null;
//     selectedModelRight: string | null;
//     cmConfigLeft: object | null;
//     cmConfigRight: object | null;
//     selectedOption: any | null;
//     selectedCriteria: any | null;
//     predictions?: any[];
//     stats: any[] | null;
//     cutoffProb: number;
//     confusionMatrix?: any;
//     classificationData?: any;
// }

const NetworkTrafficTab: React.FC<TODO> = ({comparisonState}) => {


    const {XAIStatusState, allACModels} = useSpatialContext();

    const initialState: ILIMEParametersState = {
        modelId: "",
        sampleId: 5,
        featuresToDisplay: 5,
        positiveChecked: true,
        negativeChecked: true,
        label: getLabelsListAppXAI("ac")[1],
        numberSamples: 10,
        maxDisplay: 15,
        maskedFeatures: [],
        pieData: [],
        dataTableProbs: [],
        isRunning: XAIStatusState ? XAIStatusState.isRunning : null,
        limeValues: [],
        isLabelEnabled: false,
        predictions: null
    };

    const {modelId: routeModelId}: string | any = useParams();
    const [state, setState] = useState({...initialState, modelId: routeModelId || comparisonState.selectedModelLeft});

    return (
        <>
            <Tabs defaultActiveKey="subtab1" className="flex-column">
                <Tab eventKey="tab1" title="Configure Network Traffic">
                    <div className="d-flex">
                        <Tabs defaultActiveKey="subtab1" className="flex-column">
                            <Tab eventKey="subtab1" title="LIME">
                                <div className="side-content px-3">
                                    <LIMETab state={state} updateState={setState}/>
                                </div>
                            </Tab>
                            <Tab eventKey="subtab2" title="SHAP">
                                <div className="px-3">

                                    <SHAPTab state={state} updateState={setState}/>
                                </div>
                            </Tab>
                            {!comparisonState.selectedModelLeft?.includes('at') && (
                                <Tab eventKey="subtab3" title="ATTACKS">
                                    <AdversarialTab state={state}/>
                                </Tab>
                            )}
                        </Tabs>
                    </div>
                </Tab>
            </Tabs>
        </>
    )
};

export default NetworkTrafficTab;


