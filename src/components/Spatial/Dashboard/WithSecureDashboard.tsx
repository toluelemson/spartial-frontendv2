import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { getLabelsListAppXAI } from "../../util/utility";
import { requestWithSecureModels } from "../../../api";
import { ILIMEParametersState } from "../../../types/LimeTypes";
import { useRoleContext } from "../../RoleProvider/RoleContext";
import { Col, Container, Form, Row, Tab, Tabs } from "react-bootstrap";
import ModelSelection from "../../Models/Comparison/ModelSelection";
import { ModelListType } from "../../../types/types";
import WithSecureTab from "../Tab/withSecureAttack/WithSecureTab";

interface ComparisonState {
  models: ModelListType | null;
  dataStatsLeft: any[];
  dataStatsRight: any[];
  dataBuildConfigLeft: object;
  dataBuildConfigRight: object;
  selectedModelLeft: any;
  selectedModelRight: string | null;
  cmConfigLeft: object | null;
  cmConfigRight: object | null;
  selectedOption: any | null;
  selectedCriteria: any | null;
  predictions?: any[];
  stats: any[] | null;
  cutoffProb: number;
  confusionMatrix?: any;
  classificationData?: any;
}

const initialComparisonState: ComparisonState = {
  models: [],
  dataStatsLeft: [],
  dataStatsRight: [],
  dataBuildConfigLeft: {},
  dataBuildConfigRight: {},
  selectedModelLeft: null,
  selectedModelRight: null,
  confusionMatrix: null,
  cmConfigLeft: null,
  cmConfigRight: null,
  selectedOption: null,
  selectedCriteria: null,
  cutoffProb: 0.5,
  stats: null,
};

const WithSecureDashboard: React.FC = () => {
  const { setCurrentService } = useRoleContext();
  const { modelId: routeModelId } = useParams();
  
  const [comparisonState, setComparisonState] = useState<ComparisonState>(
    initialComparisonState
  );

  const [state, setState] = useState<ILIMEParametersState>({
    modelId: routeModelId || "",
    sampleId: 5,
    featuresToDisplay: 5,
    positiveChecked: true,
    negativeChecked: true,
    label: getLabelsListAppXAI("ws")[1],
    numberSamples: 10,
    maxDisplay: 15,
    maskedFeatures: [],
    pieData: [],
    dataTableProbs: [],
    isRunning: null,
    limeValues: [],
    isLabelEnabled: false,
    predictions: null,
  });
  useEffect(() => {
    setCurrentService("WithSecure");
  }, [setCurrentService]);

  const [analyzeData, setAnalyzeData] = useState<{
    result1: string | null;
    explanations: { [key: string]: string };
    allResponses: { [key: string]: string }[];
  }>({
    result1: null,
    explanations: {},
    allResponses: [],
  });

  useEffect(() => {
    const fetchMedicalModels = async () => {
      try {
        const res = await requestWithSecureModels();
      } catch (error) {
        console.error(error);
      }
    };
    fetchMedicalModels();
  }, [routeModelId]);

  const getFirstTwoCharsOfModelId = (params: string): string =>
    params.length >= 2 ? params.substring(0, 2) : "";

  const filterModelsByService = (
    models: ModelListType,
    servicePrefix: string
  ) => {
    return models.filter((model) =>
      model.modelId.toLowerCase().startsWith(servicePrefix)
    );
  };

  const handleModelSelection = (
    modelId: string | null,
    isLeft: boolean | null
  ) => {
    if (modelId) {
      const servicePrefix = getFirstTwoCharsOfModelId(modelId);
      const serviceModels = filterModelsByService(
        comparisonState.models || [],
        servicePrefix
      );
      setComparisonState((prevState) => ({
        ...prevState,
        models: serviceModels,
        ...(isLeft
          ? { selectedModelLeft: modelId }
          : { selectedModelRight: modelId }),
      }));
    }
  };

  return (
    <Container className="mt-5">
      <Form>
        <Row>
          <Col md={12}>
            <Form.Group controlId="modelSelect" className="mb-3">
              {/*<Form.Label>Model *</Form.Label>*/}
              <ModelSelection
                models={comparisonState.models}
                selectedModel={
                  routeModelId || comparisonState.selectedModelLeft
                }
                handleModelSelection={handleModelSelection}
                label=""
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <WithSecureTab state={state} setAnalyzeData={setAnalyzeData} />
    </Container>
  );
};

export default WithSecureDashboard;
