import React, { useEffect, useMemo, useState } from "react";
import { Col, Container, Form, Row, Tab, Tabs } from "react-bootstrap";
import { useSpatialContext } from "../../context/context";
import { useParams } from "react-router";
import { getLabelsListAppXAI } from "../util/utility";
import { requestAllModels, requestMedicalModels } from "../../api";
import { ModelListType, TODO } from "../../types/types";
import { ILIMEParametersState } from "../../types/LimeTypes";
import ModelSelection from "../Models/Comparison/ModelSelection";
import DatasetList from "../Datasets/DatasetList";
import MedicalTabs from "./MedicalTab";
import { loadPredictionsData } from "../util/PredictiionLoader/PredictionLoaderUtil";
import NetworkTrafficTab from "./NetworkTrafficTab";
import ComparisonTab from "./ComparisonTab";
import { useRoleContext, Role } from "../RoleProvider/RoleContext";

const SpatialDashboard: React.FC = () => {
  const { modelId: routeModelId }: string | any = useParams();
  const { XAIStatusState, allACModels } = useSpatialContext();
  const { roles, setCurrentService, userRole } = useRoleContext();
  const isDisabled = routeModelId !== undefined && routeModelId !== "";
  const allowedValues = [1, 5, 10, 15, 20, 25, 30];

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
    predictions: null,
  };

  interface ComparisonState {
    models: ModelListType | null;
    dataStatsLeft: any[];
    dataStatsRight: any[];
    dataBuildConfigLeft: object;
    dataBuildConfigRight: object;
    selectedModelLeft: string | null;
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

  const [comparisonState, setComparisonState] = useState<ComparisonState>(
    initialComparisonState
  );
  const [state, setState] = useState({
    ...initialState,
    modelId: routeModelId || comparisonState.selectedModelLeft,
  });

  const getFirstTwoCharsOfModelId = (params: string): string =>
    params.length >= 2 ? params.substring(0, 2) : "";

  const [analyzeData, setAnalyzeData] = useState<{
    result1: string | null;
    explanations: { [key: string]: string };
    allResponses: { [key: string]: string }[];
  }>({
    result1: null,
    explanations: {},
    allResponses: [],
  });

  const serviceMapping: { [key: string]: string } = {
    ac: "Network",
    ma: "Medical",
    // Add more mappings here
  };

  const updateServiceBasedOnModel = (modelId: string | null) => {
    if (modelId) {
      const servicePrefix = getFirstTwoCharsOfModelId(modelId);
      const service = serviceMapping[servicePrefix] || "Unknown";
      setCurrentService(service);
    }
  };

  const filterModelsByService = (
    models: ModelListType,
    servicePrefix: string
  ) => {
    return models.filter((model) =>
      model.modelId.toLowerCase().startsWith(servicePrefix)
    );
  };

  //   const filteredModels = useMemo(() => {
  //     if (routeModelId) {
  //       return comparisonState.models?.filter((model) =>
  //         model.modelId
  //           .toLowerCase()
  //           .startsWith(getFirstTwoCharsOfModelId(routeModelId))
  //       );
  //     } else {
  //       return comparisonState.models;
  //     }
  //   }, [comparisonState.models, routeModelId]);

  const filteredModels = useMemo(() => {
    if (routeModelId) {
      const servicePrefix = getFirstTwoCharsOfModelId(routeModelId);
      return filterModelsByService(comparisonState.models || [], servicePrefix);
    } else {
      return comparisonState.models;
    }
  }, [comparisonState.models, routeModelId]);

  useEffect(() => {
    combineLoad();
  }, [
    comparisonState.selectedModelLeft,
    comparisonState.selectedModelRight,
    comparisonState.selectedCriteria,
  ]);

  //   useEffect(() => {
  //     const fetchAllModels = async () => {
  //       try {
  //         const res = await requestAllModels();
  //         setComparisonState((prevState) => ({
  //           ...prevState,
  //           selectedModelLeft: comparisonState.selectedModelLeft || state.modelId,
  //           models: res,
  //         }));
  //       } catch (error) {
  //         console.error(error);
  //       }
  //     };
  //     fetchAllModels();
  //   }, [
  //     state.modelId,
  //     routeModelId,
  //     comparisonState.selectedCriteria,
  //     comparisonState.selectedModelLeft,
  //     comparisonState.selectedModelRight,
  //   ]);
  useEffect(() => {
    const fetchAllModels = async () => {
      try {
        const [networkModels, medicalModels] = await Promise.all([
          requestAllModels(),
          requestMedicalModels(),
          // Add more requests for other services here
        ]);

        setComparisonState((prevState) => ({
          ...prevState,
          selectedModelLeft: comparisonState.selectedModelLeft || state.modelId,
          models: [...networkModels, ...medicalModels], // Combine all models here
        }));
      } catch (error) {
        console.error(error);
      }
    };

    fetchAllModels();
  }, [
    state.modelId,
    routeModelId,
    comparisonState.selectedCriteria,
    comparisonState.selectedModelLeft,
    comparisonState.selectedModelRight,
    comparisonState.stats,
    comparisonState.dataStatsLeft,
    comparisonState.dataStatsRight,
  ]);

  const handleCriteriaSelection = (criteria: { target: { value: any } }) => {
    setComparisonState((prevState) => ({
      ...prevState,
      selectedCriteria: criteria.target.value,
    }));
  };

  const handleModelSelection = (
    modelId: string | null,
    isLeft: boolean | null
  ) => {
    setState((prevState) => ({ ...prevState, modelId }));
    updateServiceBasedOnModel(modelId);

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

  const loadPredictions = async (model: string | null, isLeft: boolean) => {
    if (!model) {
      console.error(
        `Error: ${isLeft ? "left" : "right"} model is null or undefined.`
      );
      return;
    }
    try {
      const result = await loadPredictionsData(model, isLeft, 0.5);
      console.log(isLeft ? "loadPredLeft" : "loadPredRight", result);
      if (result) {
        setComparisonState((prevState) => ({ ...prevState, ...result }));
      }
    } catch (error) {
      console.error(
        `Error loading ${isLeft ? "left" : "right"} predictions:`,
        error
      );
    }
  };

  const loadPredLeft = () =>
    loadPredictions(comparisonState.selectedModelLeft, true);
  const loadPredRight = () =>
    loadPredictions(comparisonState.selectedModelRight, false);

  const combineLoad = async () => {
    await Promise.all([loadPredLeft(), loadPredRight()]);
  };

  return (
    <Container className="mt-5">
      <h2>Spatial Dashboard</h2>
      <Form>
        <Row>
          <Col md={12}>
            <Form.Group controlId="modelSelect" className="mb-3">
              <Form.Label>Model *</Form.Label>
              <ModelSelection
                models={comparisonState.models}
                isFieldDisabled={isDisabled}
                selectedModel={
                  routeModelId || comparisonState.selectedModelLeft
                }
                handleModelSelection={handleModelSelection}
                label="Model 1"
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>

      {comparisonState.selectedModelLeft?.startsWith("ac-") && (
        <>
          <Tabs>
            <Tab eventKey="subtab6" title={"NetworkTrafficTab"}>
              <NetworkTrafficTab
                filtteredModels={filteredModels}
                comparisonState={comparisonState}
                handleModelSelection={handleModelSelection}
                handleCriteriaSelection={handleCriteriaSelection}
              />
            </Tab>

            <Tab eventKey="subtab8" title="Compare">
              <ComparisonTab
                filteredModels={filteredModels}
                comparisonState={comparisonState}
                handleModelSelection={handleModelSelection}
                handleCriteriaSelection={handleCriteriaSelection}
              />
            </Tab>
            <Tab eventKey="subtab4" title="Train Dataset">
              <DatasetList
                modelIdProp={state.modelId}
                datasetTypeProp="train"
              />
            </Tab>
            <Tab eventKey="subtab5" title="Test Dataset">
              <DatasetList modelIdProp={state.modelId} datasetTypeProp="test" />
            </Tab>
          </Tabs>
        </>
      )}
      {comparisonState.selectedModelLeft?.startsWith("ma") && (
        <MedicalTabs state={state} setAnalyzeData={setAnalyzeData} />
      )}
    </Container>
  );
};

export default SpatialDashboard;
