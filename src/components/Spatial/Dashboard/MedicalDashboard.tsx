import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Container } from "react-bootstrap";
import { getLabelsListAppXAI } from "../../util/utility";
import { requestMedicalModels } from "../../../api";
import { ILIMEParametersState } from "../../../types/LimeTypes";
import MedicalTab from "../Tab/MedicalTab";


const MedicalDashboard: React.FC = () => {
    const { modelId: routeModelId } = useParams();
    const [state, setState] = useState<ILIMEParametersState>({
        modelId: routeModelId || "",
        sampleId: 5,
        featuresToDisplay: 5,
        positiveChecked: true,
        negativeChecked: true,
        label: getLabelsListAppXAI("ma")[1],
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
                const res = await requestMedicalModels();
            } catch (error) {
                console.error(error);
            }
        };
        fetchMedicalModels();
    }, [routeModelId]);

    return (
        <Container className="mt-5">
            <h2>Medical Dashboard</h2>
            <MedicalTab state={state} setAnalyzeData={setAnalyzeData} />
        </Container>
    );
};

export default MedicalDashboard;
