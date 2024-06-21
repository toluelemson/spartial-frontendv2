import React, {useEffect, useState} from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import ConfusionMatrix from "../ConfusionMatrix";
import {extractLabelsFromDataset} from "../../util/utility";
import FairnessComparator from "../../Services/Fairness/FairnessComparer";
import ModelPerformanceCompare from "../ModelPerformanceCompare";
import CSVComparator from "../Comparison/CSVComparator";
import useFetchModelDataset from "../../Datasets/useFetchDataset";
import ModelBuildConfigCompare from "./ModelBuildConfigCompare";


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);



const ModelRow: React.FC<any> = ({state}) => {
    const {
        dataBuildConfigLeft,
        dataBuildConfigRight,
        dataStatsLeft,
        dataStatsRight,
        selectedModelLeft,
        selectedModelRight,
        selectedCriteria,
        cmConfigLeft,
        cmConfigRight,
    } = state;
    const {originalDataset} = useFetchModelDataset(selectedModelLeft, "train");

    const [classificationLabel, setClassificationLabel] = useState<any>([]);

    useEffect(() => {
        const fetchLabels = async () => {
            try {
                const label1 = selectedModelLeft
                    ? await extractLabelsFromDataset({
                        modelId: selectedModelLeft,
                        datasets: originalDataset.resultData,
                    })
                    : [];
                const label2 = selectedModelRight
                    ? await extractLabelsFromDataset({
                        modelId: selectedModelRight,
                        datasets: originalDataset.resultData,
                    })
                    : [];

                setClassificationLabel([label1, label2]);
            } catch (error) {
                console.error("Error fetching classification labels:", error);
            }
        };

        fetchLabels();
    }, [
        dataBuildConfigLeft,
        cmConfigRight,
        dataStatsLeft,
        dataStatsRight,
        cmConfigLeft,
        selectedModelLeft,
        selectedModelRight,
    ]);

    return (
        <div className="container-fluid">
            {selectedCriteria === "Build Configuration" && (cmConfigLeft || cmConfigRight) && (
                <ModelBuildConfigCompare
                    dataBuildConfigLeft={dataBuildConfigLeft}
                    dataBuildConfigRight={dataBuildConfigRight}
                />
            )}

            {["Model Performance"].includes(selectedCriteria) && (cmConfigLeft || cmConfigRight) && (
                <ModelPerformanceCompare
                    selectedModelLeft={selectedModelLeft}
                    selectedModelRight={selectedModelRight}
                    dataStatsLeft={dataStatsLeft}
                    dataStatsRight={dataStatsRight}
                    classificationLabel={classificationLabel}
                />
            )}

            {selectedCriteria === "Attack Performance" && (cmConfigLeft || cmConfigRight) && (
                <ModelPerformanceCompare
                    selectedModelLeft={selectedModelLeft}
                    selectedModelRight={selectedModelRight}
                    dataStatsLeft={dataStatsLeft || []}
                    dataStatsRight={dataStatsRight || []}
                    classificationLabel={classificationLabel}
                />
            )}

            {selectedCriteria === "Confusion Matrix" && (cmConfigLeft || cmConfigRight) && (
                <ConfusionMatrix cmConfigLeft={cmConfigLeft} cmConfigRight={cmConfigRight}/>
            )}

            {selectedCriteria === "XAI Result" && <CSVComparator/>}
            {selectedCriteria === "Fairness" && <FairnessComparator/>}
        </div>
    );
};

export default ModelRow;
