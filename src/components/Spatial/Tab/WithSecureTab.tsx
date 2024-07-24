import React from "react";
import { Tab, TabPane, Tabs } from "react-bootstrap";
import ECGAnalysis from "../../Services/medical/MedDashboard/ECGAnalysis";
import ModelExplanation from "../../Services/medical/MedDashboard/ModelExplanation";
import { ILIMEParametersState } from "../../../types/LimeTypes";

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

const WithSecureTab: React.FC<WithSecureTabsProps> = ({
  state,
  setAnalyzeData,
}) => {
  return (
    <Tabs>
      <Tab eventKey="tab2" title={"Configure WithSecure Service"}>
        <div className="d-flex">
          <Tabs defaultActiveKey="subtab5" className="flex-column">
            <Tab eventKey="subtab5" title="MalDoc Attacks">
              <div className="side-content px-3">TO DO</div>
            </Tab>
            <Tab eventKey="subtab6" title="DI-APK Attacks">
              <div className="side-content px-3">TO DO</div>
            </Tab>
          </Tabs>
        </div>
      </Tab>
    </Tabs>
  );
};

export default WithSecureTab;
