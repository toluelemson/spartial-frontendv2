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
import ConfusionMatrix from "./ConfusionMatrix";
import {extractLabelsFromDataset} from "../util/utility";
import CSVComparator from "./modelComparison/CSVComparator";
import FairnessComparator from "../Services/Fairness/FairnessComparer";
import useFetchModelDataset from "../datasets/useFetchModelDataset";
import {TableSection} from "./TableSection";
import ModelPerformanceCompare from "./ModelPerformanceCompare";


interface ConfigParameter {
    parameter: string;
    value: string;
}

export const DataParameterRow: React.FC<{ data: ConfigParameter }> = ({data}) => (
    <tr>
        <td>{data.parameter}</td>
        <td>{data.value}</td>
    </tr>
);


ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ModelBuildConfigCompare: React.FC<{
    dataBuildConfigLeft: ConfigParameter[],
    dataBuildConfigRight: ConfigParameter[]
}> = ({
          dataBuildConfigLeft,
          dataBuildConfigRight,
      }) => (
    <div className="row">
        <div className="col">
            <TableSection title="Configuration" columns={[""]}>
                {dataBuildConfigLeft.map((d, index) => (
                    <DataParameterRow key={`left-${index}`} data={d}/>
                ))}
            </TableSection>
        </div>
        {/*<div className="col">*/}
        {/*    <TableSection title="Configuration" columns={[""]}>*/}
        {/*        {dataBuildConfigRight.map((d, index) => (*/}
        {/*            <DataParameterRow key={`right-${index}`} data={d}/>*/}
        {/*        ))}*/}
        {/*    </TableSection>*/}
        {/*</div>*/}
    </div>
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
    const {originalDataset} = useFetchModelDataset(false, selectedModelLeft, "train");

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

            {selectedCriteria === "Result" && <CSVComparator/>}
            {selectedCriteria === "Fairness" && <FairnessComparator/>}
        </div>
    );
};

export default ModelRow;
