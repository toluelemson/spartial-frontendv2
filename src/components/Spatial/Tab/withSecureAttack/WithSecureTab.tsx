import React from "react";
import { Tab, Tabs } from "react-bootstrap";
import { ILIMEParametersState } from "../../../../types/LimeTypes";
import AdversarialAttacksForm from "./AdversarialAttacksForm";
import WithSecureAttackDataTable from "./WithSecureAttackDataTable";
import AttackOverview from "./AttackOverview";

interface WithSecureTabsProps {
    state: ILIMEParametersState;
    setAnalyzeData: React.Dispatch<
        React.SetStateAction<{
            result1: string | null;
            explanations: { [key: string]: string };
            allResponses: { [key: string]: string }[];
        }>
    >;
}

const WithSecureTab: React.FC<WithSecureTabsProps> = ({ state }) => {
    const { modelId } = state;

    return (
        <Tabs>
            <Tab eventKey="tab2" title={"Configure WithSecure Service"}>
                <div className="d-flex">
                    <Tabs defaultActiveKey="subtab5" className="flex-column">
                        <Tab eventKey="subtab5" title="Attack">
                            <div className="side-content px-3">
                                <AdversarialAttacksForm modelId={modelId} />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </Tab>
            <Tab eventKey="tab3" title={"Attack Data Viewer"}>
                <div className="d-flex tab-content-wrapper">
                    <Tabs defaultActiveKey="subtab6" className="flex-column">
                        <Tab eventKey="subtab6" title="Attack Info">
                            <div className="side-content px-3">
                                <WithSecureAttackDataTable modelId={modelId} />
                            </div>
                        </Tab>
                        <Tab eventKey="subtab7" title="Attack Overview">
                            <div className="side-content px-3">
                                <AttackOverview />
                            </div>
                        </Tab>
                    </Tabs>
                </div>
            </Tab>
        </Tabs>
    );
};

export default WithSecureTab;
