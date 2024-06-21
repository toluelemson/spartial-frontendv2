import React, {ChangeEvent, useEffect, useState} from 'react';
import {Button, Card, Col, Form, Row, Spinner} from "react-bootstrap";
import {
    requestAttacksDatasets,
    requestRetrainModelAC,
    requestRetrainStatusAC,
} from "../../api";
import {ATTACK_DATASETS_MAPPING} from "../../constants";
import {calculateImpactMetric, getConfigConfusionMatrix, updateConfusionMatrix} from "../util/utility";
import ModelRow from "../Models/Details/ModelRow";
import {loadPredictionsData} from '../util/PredictiionLoader/PredictionLoaderUtil';

interface ResilienceMetricsProps {
    modelId: string;
}

interface RetrainStatus {
    retrainStatus: {
        lastRetrainId: string;
        isRunning: boolean;
    };
}

interface AttackDataset {
    datasets: string[];
}

type AttackStateType = {
    isLoading: boolean;
    attackPredictions: any[];
    confusionMatrix?: any;
    attacksConfusionMatrix?: any;
    selectedAttack: string;
    dataBuildConfigLeft: object;
    dataBuildConfigRight: object;
    dataStatsLeft: any;
    dataStatsRight: any;
    selectedModelLeft: string;
    selectedModelRight: string | null;
    isModelRightLoaded: boolean;
    selectedCriteria: string;
    cmConfigLeft: any;
    cmConfigRight: any;
    predictions: any[];
    cutoffProb: number;
    stats: any;
    attackDatasets: AttackDataset;
    buildConfig: any;
    configCM: any;
    configAttacksCM: any;
};

const ResilienceMetrics: React.FC<ResilienceMetricsProps> = ({modelId}) => {
    const [attackState, setAttackState] = useState<AttackStateType>({
        isLoading: false,
        attackPredictions: [],
        confusionMatrix: null,
        attacksConfusionMatrix: null,
        selectedAttack: '',
        dataBuildConfigLeft: {},
        dataBuildConfigRight: {},
        dataStatsLeft: null,
        dataStatsRight: null,
        selectedModelLeft: modelId,
        selectedModelRight: null,
        isModelRightLoaded: false,
        selectedCriteria: 'Attack Performance',
        cmConfigLeft: null,
        cmConfigRight: null,
        predictions: [],
        cutoffProb: 0.5,
        stats: null,
        attackDatasets: {datasets: []},
        buildConfig: {},
        configCM: null,
        configAttacksCM: null
    });

    // useEffect(() => {
    //     pollRetrainStatus();
    //     return () => {
    //         // Clean-up if needed
    //     };
    // }, [attackState.selectedAttack, attackState.isLoading]);

    const loadPred = async () => {
        const result = await loadPredictionsData(modelId, true, 0.5);
        if (result) {
            setAttackState(prevState => ({...prevState, ...result}));
        }
    }


    useEffect(() => {
        loadPred()
    }, [modelId, attackState.isLoading, attackState.selectedModelRight]);


    useEffect(() => {
        const fetchRequestDatasets = async () => {
            try {
                const attackDatasets = await requestAttacksDatasets(modelId);
                setAttackState(prevState => ({...prevState, attackDatasets}));
            } catch (error) {
                console.error("Failed to fetch models:", error);
            }
        };
        fetchRequestDatasets();
    }, [attackState.selectedAttack, attackState.selectedModelRight, modelId, attackState.isLoading]);


    const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        await computeMetric().catch(console.error);
    };

    const computeMetric = async () => {
        try {
            setAttackState(prevState => ({...prevState, isLoading: true}));
            let newState: Partial<AttackStateType> = {};
            if (attackState.confusionMatrix) {
                const configCM = await getConfigConfusionMatrix(attackState.selectedModelLeft, attackState.confusionMatrix);
                newState.configCM = configCM;
            }
            if (attackState.attacksConfusionMatrix) {
                const [configAttacksCM, impact] = await Promise.all([
                    getConfigConfusionMatrix(attackState.selectedModelLeft, attackState.attacksConfusionMatrix),
                    calculateImpactMetric("ac", attackState.confusionMatrix, attackState.attacksConfusionMatrix)
                ]);
                newState.configAttacksCM = configAttacksCM;
                console.log(impact);
            }
            setAttackState(prevState => ({...prevState, ...newState}));
            const testingDataset = "Test_samples.csv";
            const trainingDataset = attackState.selectedAttack;
            await requestRetrainModelAC(attackState.selectedModelLeft, trainingDataset, testingDataset, "LightGBM");
            await pollRetrainStatus();
        } catch (error) {
            console.error("Failed to compute metrics or retrain model:", error);
            setAttackState(prevState => ({...prevState, isLoading: false, error}));
        }
    };


    const pollRetrainStatus = async () => {
        try {
            const statusRes = await requestRetrainStatusAC() as RetrainStatus;
            await handleRetrainStatus(statusRes);
        } catch (error) {
            console.error("Failed to fetch retrain status:", error);
        }
    };

    const handleRetrainStatus = async (statusRes: RetrainStatus) => {
        const retrainId = statusRes.retrainStatus.lastRetrainId;

        const result = await loadPredictionsData(retrainId, false, 0.5);
        console.log(result)
        if (result) {
            setAttackState(prevState => ({...prevState, ...result}));
        }
        updateRetrainStatus(retrainId, statusRes.retrainStatus.isRunning);
        if (statusRes.retrainStatus.isRunning) {
            setTimeout(pollRetrainStatus, 3000);
        }

    };

    const updateRetrainStatus = (retrainId: string, isRunning: boolean) => {
        setAttackState(prev => ({
            ...prev,
            selectedModelRight: retrainId,
            isModelRightLoaded: !isRunning,
            isLoading: isRunning ? prev.isLoading : false,
        }));
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

        const {value, name} = event.target;
        console.log(name, value);
        setAttackState(prevState => ({...prevState, [name]: value}));
    };


    const {attackDatasets} = attackState;

    const attacksDatasetsOptions = Array.isArray(attackDatasets)
        ? attackDatasets.map(dataset => ({
            value: dataset,
            label: ATTACK_DATASETS_MAPPING[dataset as keyof typeof ATTACK_DATASETS_MAPPING] || dataset
        }))
        : [];

    return (
        <>
            <Col lg={12}>
                <Card className="shadow-sm mb-4">
                    <Card.Header as="h5" className="text-primary">
                        Resilience Metrics
                    </Card.Header>
                    <Card.Body className="p-4">
                        <Card.Text>
                            Choose attack type to compute impact metrics.
                        </Card.Text>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group as={Row} className="mb-3" controlId="attackType">
                                <Form.Label className="text-secondary col-sm-2">
                                    Attack Type
                                </Form.Label>
                                <Col sm={10}>
                                    <Form.Select
                                        name="selectedAttack"
                                        value={attackState.selectedAttack}
                                        onChange={handleInputChange}
                                        required
                                        className="shadow-sm"
                                    >
                                        <option value="" disabled>Select an attack type</option>
                                        {attacksDatasetsOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Form.Group>

                            <div className="d-grid gap-2">
                                <Button variant="primary" type="submit" disabled={attackState.isLoading}
                                        className="mt-3">
                                    {attackState.isLoading ? (
                                        <>
                                            Computing Impact Metrics...
                                            <Spinner as="span" animation="border" size="sm" role="status"
                                                     aria-hidden="true" className="ms-2"/>
                                        </>
                                    ) : (
                                        'Compute Impact Metrics'
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>

            <Col>
                <ModelRow state={attackState}/>
            </Col>
        </>
    );
};

export default ResilienceMetrics;
