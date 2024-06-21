import {
    requestAllModels,
    requestAllReports,
    requestBuildStatusAC,
    requestDatasetAC,
    requestMMTStatus,
} from "../api";
import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import {
    AcDataSetInterface,
    BuildStatusType,
    MMTStatusInterface,
    ModelListType,
    OptionInterface,
    XAIStatusType
} from "../types/types";
import {useOktaAuth} from "@okta/okta-react";

interface SpatialContextType {
    reportState: OptionInterface[] | null;
    setReportState: React.Dispatch<React.SetStateAction<OptionInterface[] | null>>;
    XAIStatusState: XAIStatusType | null;
    MMTStatusState: MMTStatusInterface | null;
    setMMTStatusState: React.Dispatch<React.SetStateAction<MMTStatusInterface | null>>;
    buildStatusState: BuildStatusType | null;
    acDataset: AcDataSetInterface | null;
    setAcDataset: React.Dispatch<React.SetStateAction<AcDataSetInterface | null>>;
    setBuildStatusState: React.Dispatch<React.SetStateAction<BuildStatusType | null>>;
    setAllModel: React.Dispatch<React.SetStateAction<ModelListType | null>>
    allModel: ModelListType | null
}
const SpatialContext = createContext<SpatialContextType | undefined>(undefined);

interface ProviderProps {
    children: ReactNode;
}

const initialBuildStatus: BuildStatusType | null = null;
const initialXAIStatus: XAIStatusType | null = null
const initialAcDataset: AcDataSetInterface | null = null

const initialModelList: ModelListType | null = null

export const Provider: React.FC<ProviderProps> = ({children}) => {
    const [reportState, setReportState] = useState<OptionInterface[] | null>([] || null);
    const [MMTStatusState, setMMTStatusState] = useState<MMTStatusInterface | null>(null);
    const [buildStatusState, setBuildStatusState] = useState<BuildStatusType | null>(initialBuildStatus);
    const [XAIStatusState, setXAIStatusState] = useState<XAIStatusType | null>(initialXAIStatus)
    const [acDataset, setAcDataset] = useState<AcDataSetInterface | null>(initialAcDataset);
    const [allModel, setAllModel] = useState<ModelListType | null>(initialModelList);
    const [viewDatasets, setViewDatasets] = useState()

    const {authState} = useOktaAuth();

    useEffect(() => {
        const loadData = async () => {
            if (!authState?.isAuthenticated) return;

            try {
                const [
                    dataSetOptionsResponse,
                    AcdataSetOptionsResponse,
                    MMTStatusResponse,
                    // XAIStatusState,
                    buildStatusResponse,
                    allModelResponse
                ] = await Promise.all([
                    requestAllReports(),
                    requestDatasetAC(),
                    requestMMTStatus(),
                    requestBuildStatusAC(),
                    requestAllModels()
                    // requestXAIStatus(),
                ]);

                setReportState(dataSetOptionsResponse);
                setAcDataset(AcdataSetOptionsResponse);
                setBuildStatusState(buildStatusResponse);
                setAllModel(allModelResponse)
                setMMTStatusState(MMTStatusResponse as MMTStatusInterface);
                setXAIStatusState(XAIStatusState)

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        loadData().catch(error => {
            console.error('Error in loadData:', error);
        })
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
        allModel,
        setAllModel,
        viewDatasets,
        setViewDatasets
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
        throw new Error('useSpatialContext must be used within a Provider');
    }
    return context;
};
