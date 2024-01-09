import React, {useState, FormEvent, useEffect} from 'react';
import { Container, Form, Row, Col, Button, InputGroup, FormControl } from 'react-bootstrap';
import { getLabelsListAppXAI } from '../util/utility'
import PieChartComponent from '../Charts/PieChartComponent';

import {useSpatialContext} from "../../context/context";
import * as api from '../../api';
import Papa from "papaparse";
import {AC_OUTPUT_LABELS, AD_OUTPUT_LABELS} from "../../constants";
import ProbabilityTable from "../Charts/ProbabilityTable";
import {useParams} from "react-router";


type ProbabilityData = { key: number; label: string; probability: string };
type PieChartData = { type: string; value: number };
interface ILIMEParametersState {
  sampleId: number;
  featuresToDisplay: number;
  positiveChecked: boolean;
  negativeChecked: boolean;
  modelId: string,
  label: string,
  numberSamples: number,
  maxDisplay: number,
  maskedFeatures: string[]
  pieData: PieChartData[],
  dataTableProbs: ProbabilityData[],
  isRunning: any,
  limeValues: string[],
  isLabelEnabled: boolean,
  predictions: null | string
}

const LIMEParameters: React.FC = () => {
    const { modelId } = useParams();

    console.log(modelId)
    const allowedValues = [1, 5, 10, 15, 20, 25, 30];
    const { XAIStatusState, allModel } = useSpatialContext();  //TODO DETERMINE IF ALL MODEL SHOULD BE CALLED GLOBALLY
     const initialState: ILIMEParametersState = {
        sampleId: 5,
        featuresToDisplay: 10,
        positiveChecked: true,
        negativeChecked: true,
        modelId: modelId || "",
        label: getLabelsListAppXAI("ac")[1],
        numberSamples: 10,
        maxDisplay: 15,
        maskedFeatures: [],
        pieData: [],
        dataTableProbs: [],
        isRunning:  XAIStatusState ? XAIStatusState.isRunning : null,
        limeValues: [],
        isLabelEnabled: false,
        predictions: null,
    }

    const [state, setState] = useState<ILIMEParametersState>(initialState);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const csvDataString = await api.requestViewModelDatasets("ac-xgboost", "train");
                Papa.parse(csvDataString, {
                    complete: result => {
                        if (Array.isArray(result.data)) {
                           setState((prevState) => ({...prevState, maskedFeatures: result.data as string[]}))
                        }
                    },
                    header: true,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
      const target = event.target as HTMLInputElement;
      const value = target.type === 'checkbox' ? target.checked : target.value;

      setState({
        ...state,
        [target.name]: value,
      });
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {

      event.preventDefault();

      // const target = event.target as HTMLInputElement;
      const {modelId, sampleId, featuresToDisplay} = state

      const predictionModelResponse = await api.requestPredictionsModel(state.modelId)

      setState((prevState) => ({...prevState, predictions: predictionModelResponse}))

      let intervalId: NodeJS.Timer | null = null;
      const runLimeAndMonitorStatus = async () => {
          try {
              //TODO Replace 'any' with actual type for modelId, sampleId, featuresToDisplay, and res
              const res: any = await api.requestRunLime(modelId, sampleId, featuresToDisplay);
              console.log(res)

              if (res && res.isRunning) {
                  intervalId = setInterval(() => {
                      api.requestXAIStatus();
                  }, 1000);
              }
          } catch (error: any) {
              console.error('Error during requestRunLime:', error);

              if (intervalId) clearInterval(intervalId);
          }

           if (intervalId) clearInterval(intervalId);
      };

      // Call the function
      await runLimeAndMonitorStatus();

     const formatProbabilityData = (yProbs: number[][], labels: string[], sampleId: number | null): ProbabilityData[] => {
      return labels.map((label, index) => ({
        key: index,
        label,
        probability: sampleId && yProbs[sampleId] ? yProbs[sampleId][index].toFixed(6) : '-'
      }));
    };

    const formatPieChartData = (yProbs: number[][], sampleId: number | null, labels: string[]): PieChartData[] => {
      return sampleId ? yProbs[sampleId].map((prob, i) => ({
        type: labels[i],
        value: parseFloat((prob * 100).toFixed(2))
      })) : [];
    };

    const parsePredictedProbs = (probs: string, sampleId: number | null): number[][] => {
      return probs.split('\n').slice(1).map(line =>
          line.split(',').map(val => parseFloat(val))
      );
    };

    const processProbsData = async (modelId: string, sampleId: number | null) => {
      const predictedProbsResponse = await api.requestPredictedProbsModel(state.modelId);
      const yProbs = parsePredictedProbs(predictedProbsResponse, sampleId);
      let dataTableProbs: ProbabilityData[] = [];
      let pieData: PieChartData[] = [];

      if (modelId.startsWith('ac-')) {
        dataTableProbs = formatProbabilityData(yProbs, ['Web', 'Interactive', 'Video'], sampleId);
        pieData = formatPieChartData(yProbs, sampleId, AC_OUTPUT_LABELS);
      } else {
        dataTableProbs = formatProbabilityData(yProbs, ['Normal traffic', 'Malware traffic'], sampleId);
        pieData = formatPieChartData(yProbs, sampleId, AD_OUTPUT_LABELS);
      }

      return { dataTableProbs, pieData };
    };

    const updateData = async () => {
      const { dataTableProbs, pieData } = await processProbsData(state.modelId, state.sampleId);
      setState((prevState) => ({...prevState, pieData: pieData, dataTableProbs: dataTableProbs }))

    };

    await updateData();

  }

  return (
   <Container>
       <h2> Explainable AI with Local Interpretable Model-agnostic Explanations (LIME) </h2>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group controlId="modelSelect" className="mb-3">
              <Form.Label>Model *</Form.Label>
                <Form.Select
                      name="modelId"
                      aria-label="Model select"
                      className="mb-3"
                      onChange={handleInputChange}
                      value={state.modelId}
                    >
                     <option value="" disabled selected={!!state.modelId}>Select a model</option>
                      {allModel && allModel.map(m => (
                        <option key={m.modelId} value={m.modelId}>{m.modelId}</option>
                      ))}
                    </Form.Select>
            </Form.Group>

            <Form.Group controlId="sampleID" className="mb-3">
              <Form.Label>Sample ID</Form.Label>
              <Form.Control
                type="number"
                name="sampleId"
                placeholder="Enter Sample ID"
                value={state.sampleId}
                onChange={handleInputChange}
                className="mb-3"
              />
            </Form.Group>

            <Form.Group controlId="featuresToMask" className="mb-3">
              <Form.Label>Feature(s) to mask</Form.Label>
              <InputGroup>
                <FormControl
                  as="select"
                   multiple={true}
                  name="featuresToMask"
                  className="form-select"
                  onChange={handleInputChange}
                >
                  <option value="%tcp_protocol">%tcp_protocol</option>
                  {state.maskedFeatures.length > 0 && (
                    Object.keys(state.maskedFeatures[0])
                    .sort() // Sorting the keys alphabetically
                    .map((key, index) => (
                      <option value={key} key={index}>{key}</option>
                    ))
                  )}
                </FormControl>
              </InputGroup>
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3 w-100">Submit</Button>
          </Col>

          <Col md={6}>
            <Form.Group controlId="featuresToDisplay" className="mb-3">
              <Form.Label>Features to display: {allowedValues[state.featuresToDisplay]}</Form.Label>
              <Form.Range
                name="featuresToDisplay"
                value={state.featuresToDisplay}
                onChange={handleInputChange}
                min="0"
                max={allowedValues.length - 1}
                step="1"
              />
            </Form.Group>

            <Form.Group controlId="contributionsToDisplay" className="mb-3">
              <Form.Check
                type="checkbox"
                name="positiveChecked"
                label="Positive"
                checked={state.positiveChecked}
                onChange={handleInputChange}
                className="mb-1"
              />
              <Form.Check
                type="checkbox"
                name="negativeChecked"
                label="Negative"
                checked={state.negativeChecked}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <Row className="mt-4">
        <Col md={6}>
          <PieChartComponent data={state.pieData} />
        </Col>
        <Col md={6}>
          <ProbabilityTable data={state.dataTableProbs as any} />
        </Col>
      </Row>
    </Container>
  );
};

export default LIMEParameters;
