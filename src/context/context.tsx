import {
  requestAllModels as requestAllNetworkTrafficModels,
  requestAllReports as requestNetworkTrafficReports,
  requestBuildStatusAC,
  requestDatasetAC,
  requestMMTStatus,
  requestMedicalModels,
  //   requestWithSecureModels,
} from "../api";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import {
  AcDataSetInterface,
  BuildStatusType,
  MMTStatusInterface,
  OptionInterface,
  TODO,
  XAIStatusType,
} from "../types/types";
import { useOktaAuth } from "@okta/okta-react";

interface ModelData {
  id: string;
  name: string;
  lastBuildAt: Date;
  modelId?: string;
  buildConfig?: string;
}

interface MedicalModel {
  id: string;
  name: string;
  lastBuildAt: string;
  modelId?: string;
  buildConfig?: string;
}
interface WithSecureModel {
  id: string;
  name: string;
  lastBuildAt: string;
  modelId?: string;
  buildConfig?: string;
}
type ModelListType = ModelData[] | TODO;

interface SpatialContextType {
  reportState: OptionInterface[] | null;
  setReportState: React.Dispatch<
    React.SetStateAction<OptionInterface[] | null>
  >;
  XAIStatusState: XAIStatusType | null;
  MMTStatusState: MMTStatusInterface | null;
  setMMTStatusState: React.Dispatch<
    React.SetStateAction<MMTStatusInterface | null>
  >;
  buildStatusState: BuildStatusType | null;
  acDataset: AcDataSetInterface | null;
  setAcDataset: React.Dispatch<React.SetStateAction<AcDataSetInterface | null>>;
  setBuildStatusState: React.Dispatch<
    React.SetStateAction<BuildStatusType | null>
  >;
  setAllACModels: React.Dispatch<React.SetStateAction<ModelListType | null>>;
  allACModels: ModelListType | null;
  setAllMedicalModels: React.Dispatch<
    React.SetStateAction<ModelListType | null>
  >;
  //   setAllWithSecureModels: React.Dispatch<
  //     React.SetStateAction<ModelListType | null>
  //   >;
  allMedicalModels: ModelListType | null;
  //   allWithSecuerModels: ModelListType | null;
}

const SpatialContext = createContext<SpatialContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

const initialBuildStatus: BuildStatusType | null = null;
const initialXAIStatus: XAIStatusType | null = null;
const initialAcDataset: AcDataSetInterface | null = null;
const initialModelList: ModelListType | null = null;

const mapMedicalModelToModelData = (medicalModel: MedicalModel): ModelData => {
  return {
    id: medicalModel.id,
    name: medicalModel.name,
    lastBuildAt: new Date(medicalModel.lastBuildAt),
    modelId: medicalModel.modelId,
    buildConfig: medicalModel.buildConfig,
  };
};

const mapWithSecureModelToModelData = (
  withSecureModel: WithSecureModel
): ModelData => {
  return {
    id: withSecureModel.id,
    name: withSecureModel.name,
    lastBuildAt: new Date(withSecureModel.lastBuildAt),
    modelId: withSecureModel.modelId,
    buildConfig: withSecureModel.buildConfig,
  };
};

export const Provider: React.FC<ProviderProps> = ({ children }) => {
  const [reportState, setReportState] = useState<OptionInterface[] | null>(
    [] || null
  );
  const [MMTStatusState, setMMTStatusState] =
    useState<MMTStatusInterface | null>(null);
  const [buildStatusState, setBuildStatusState] =
    useState<BuildStatusType | null>(initialBuildStatus);
  const [XAIStatusState, setXAIStatusState] = useState<XAIStatusType | null>(
    initialXAIStatus
  );
  const [acDataset, setAcDataset] = useState<AcDataSetInterface | null>(
    initialAcDataset
  );
  const [allACModels, setAllACModels] = useState<ModelListType | null>(
    initialModelList
  );
  const [allMedicalModels, setAllMedicalModels] =
    useState<ModelListType | null>(initialModelList);
  const [allWithSecureModels, setAllWithSecureModels] =
    useState<ModelListType | null>(initialModelList);
  const [viewDatasets, setViewDatasets] = useState();

  const { authState } = useOktaAuth();

  useEffect(() => {
    const loadData = async () => {
      if (!authState?.isAuthenticated) return;

      try {
        const [
          dataSetOptionsResponse,
          AcdataSetOptionsResponse,
          MMTStatusResponse,
          buildStatusResponse,
          allACModelsResponse,
          allMedicalModelsResponse,
          //   allWithSecureModelsResponse,
        ] = await Promise.all([
          requestNetworkTrafficReports(),
          requestDatasetAC(),
          requestMMTStatus(),
          requestBuildStatusAC(),
          requestAllNetworkTrafficModels(),
          requestMedicalModels(),
          //   requestWithSecureModels(),
        ]);

        setReportState(dataSetOptionsResponse);
        setAcDataset(AcdataSetOptionsResponse);
        setBuildStatusState(buildStatusResponse);
        setAllACModels(allACModelsResponse);

        const medicalModels =
          allMedicalModelsResponse as unknown as MedicalModel[];
        const mappedMedicalModels = medicalModels.map(
          mapMedicalModelToModelData
        );

        setAllMedicalModels(mappedMedicalModels);

        // const withSecureModels =
        //   allWithSecureModelsResponse as unknown as WithSecureModel[];
        // const mappedWithSecureModels = withSecureModels.map(
        //   mapWithSecureModelToModelData
        // );
        // setAllWithSecureModels(mappedWithSecureModels);

        setMMTStatusState(MMTStatusResponse as MMTStatusInterface);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    loadData().catch((error) => {
      console.error("Error in loadData:", error);
    });
  }, [authState?.isAuthenticated]);

  const contextValue = {
    reportState,
    setReportState,
    MMTStatusState,
    setMMTStatusState,
    buildStatusState,
    setBuildStatusState,
    XAIStatusState,
    setXAIStatusState,
    acDataset,
    setAcDataset,
    allACModels,
    setAllACModels,
    allMedicalModels,
    setAllMedicalModels,
    allWithSecureModels,
    setAllWithSecureModels,
    viewDatasets,
    setViewDatasets,
  };

  return (
    <SpatialContext.Provider value={contextValue}>
      {children}
    </SpatialContext.Provider>
  );
};

export const useSpatialContext = (): SpatialContextType => {
  const context = useContext(SpatialContext);
  if (!context) {
    throw new Error("useSpatialContext must be used within a Provider");
  }
  return context;
};
