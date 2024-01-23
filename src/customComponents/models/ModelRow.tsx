import React, {useEffect, useState} from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ConfusionMatrix from "./ConfusionMatrix";
import {extractLabelsFromDataset} from "../util/utility";

interface PerformanceMetrics {
    metric: string;
    class0: string,
    class1: string,
    class2: string
}

interface ModelPerformanceCompareProps {
  selectedModelLeft: boolean;
  selectedModelRight: boolean;
  dataStatsLeft: PerformanceMetrics[];
  dataStatsRight: PerformanceMetrics[];
  classificationLabel: any
}

interface ConfigParameter {
  parameter: string;
  value: string;
}

interface PerformanceMetrics {
  [key: string]: string | number;
}

export const DataParameterRow: React.FC<{ data: ConfigParameter }> = ({ data }) => (
  <tr>
      <td>{data.parameter}</td>
      <td>{data.value}</td>
  </tr>
);
const PerformanceRow: React.FC<{ data?: PerformanceMetrics }> = ({ data }) => {
  console.log('PerformanceRow data:', data);

  if (!data) {
    return <tr><td colSpan={100}>Data not available</td></tr>;
  }

  return (
     <tr>
        {
            Object.keys(data)
                .slice(1)
                .map((key, index) => (
                    <td key={index}>{data[key]}</td>
                ))
        }
     </tr>


  );
};


export const TableSection: React.FC<{ title: string; columns: any[]; children: React.ReactNode }> = ({ title, columns, children }) => (
    <table className="table table-bordered mt-5">
            <thead>
                <tr>
                    {title === "Confusion Matrix" ? <th>Predicted\\Observed</th> : <th><b>Metrics</b></th> }
                  {columns.map((column, index) => (
                      <>
                          <th key={index}>{column}</th>
                      </>
                  ))}
                </tr>
          </thead>
         <tbody>
          {children}
         </tbody>
    </table>
);

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ModelBuildConfigCompare: React.FC<any> = ({dataBuildConfigLeft, dataBuildConfigRight}) => (
    <div className="row">
        <div className="col">
            <TableSection title= {'Configuration'} columns= {['']}>
                {dataBuildConfigLeft && Array.isArray(dataBuildConfigLeft) && dataBuildConfigLeft.map((d: ConfigParameter, index: any) => (
                    <DataParameterRow key={`left-${index}`} data={d}/>
                ))}
            </TableSection>
        </div>
        <div className="col">
            <TableSection title= {'Configuration'} columns= {['']}>
                {dataBuildConfigRight && Array.isArray(dataBuildConfigRight) && dataBuildConfigRight.map((d: ConfigParameter, index: any) => (
                    <DataParameterRow key={`right-${index}`} data={d}/>
                ))}
            </TableSection>
        </div>
    </div>
)

const ModelPerformanceCompare: React.FC<ModelPerformanceCompareProps> = ({
  selectedModelLeft,
  selectedModelRight,
  dataStatsLeft,
  dataStatsRight, classificationLabel

}) => {
    return(
      <div className="row">
        <div className="col">
          <TableSection title="Performance" columns={classificationLabel.label1}>
            {selectedModelLeft && dataStatsLeft.map((d, index) => (
              <PerformanceRow key={`left-${index}`} data={d} />
            ))}
          </TableSection>
        </div>
        <div className="col">
          <TableSection title="Performance" columns={classificationLabel.label2}>
            {selectedModelRight && dataStatsRight.map((d, index) => (
              <PerformanceRow key={`right-${index}`} data={d} />
            ))}
          </TableSection>
        </div>
      </div>
)};


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

    } = state

    const [classificationLabel, setClassificationLabel] = useState<any>([]);


  useEffect(() => {
    const fetchLabels = async () => {
        try {
            const label1 = await extractLabelsFromDataset(selectedModelLeft);
            const label2 = await extractLabelsFromDataset(selectedModelRight);
            const labels = { label1 , label2}
            setClassificationLabel(labels);
            console.log(labels);
        } catch (error) {
            console.error('Error fetching classification labels:', error);
        }
    };

    fetchLabels();
}, [dataBuildConfigLeft, cmConfigRight, dataStatsLeft, dataStatsRight, cmConfigLeft, selectedModelLeft, selectedModelRight]);


    return (
        <div className="container-fluid">
            {selectedCriteria === "Build Configuration" && (cmConfigLeft || cmConfigRight) &&
                <ModelBuildConfigCompare
                    dataBuildConfigLeft={dataBuildConfigLeft}
                    dataBuildConfigRight={dataBuildConfigRight}
                />
            }

            {selectedCriteria === "Model Performance" && (cmConfigLeft || cmConfigRight) &&
                <ModelPerformanceCompare
                    selectedModelLeft={selectedModelLeft}
                    selectedModelRight={selectedModelRight}
                    dataStatsLeft={dataStatsLeft}
                    dataStatsRight={dataStatsRight}
                    classificationLabel ={classificationLabel}
                />
            }

            {selectedCriteria === "Confusion Matrix" && (cmConfigLeft || cmConfigRight) &&
                <ConfusionMatrix
                    cmConfigLeft={cmConfigLeft}
                    cmConfigRight={cmConfigRight}
                />
            }

            {selectedCriteria === "Result" &&
                <CSVComparator/>
            }

        </div>

    )
};

export default ModelRow;
