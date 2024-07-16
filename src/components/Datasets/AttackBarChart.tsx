import React, { useEffect } from "react";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryGroup,
  VictoryTheme,
  VictoryTooltip,
} from "victory";

interface DataSet {
  datasetType: string;
  classLabels: string;
  count: number;
}

interface AttackBarChartProps {
  dataSets: DataSet[];
  attackStatus?: boolean;
}

const AttackBarChart: React.FC<AttackBarChartProps> = ({
  dataSets,
  attackStatus,
}) => {
  console.log(dataSets);
  useEffect(() => {
    console.log(dataSets);
  }, [dataSets, attackStatus]);

  const data = dataSets.reduce((acc, { datasetType, classLabels, count }) => {
    const index = acc.findIndex((item) => item.classLabels === classLabels);
    if (index >= 0) {
      if (datasetType === "original") {
        acc[index].original = count;
      } else if (datasetType === "poisoned") {
        acc[index].poisoned = count;
      }
    } else {
      acc.push({
        classLabels,
        original: datasetType === "original" ? count : 0,
        poisoned: datasetType === "poisoned" ? count : 0,
      });
    }
    return acc;
  }, [] as Array<{ classLabels: string; original: number; poisoned: number }>);

  // Calculate the max count to set the domain dynamically
  const maxCount = Math.max(
    ...data.map((d) => Math.max(d.original, d.poisoned))
  );

  return (
    <VictoryChart
      domainPadding={20}
      theme={VictoryTheme.material}
      domain={{ y: [0, maxCount] }}
    >
      <VictoryAxis
        label="Class Labels"
        style={{
          axisLabel: { fontSize: 20, padding: 35 },
          tickLabels: { fontSize: 10, padding: 5 },
        }}
      />
      <VictoryAxis
        dependentAxis
        label="Count"
        style={{
          axisLabel: { fontSize: 20, padding: 40 },
          tickLabels: { fontSize: 10, padding: 5 },
        }}
      />
      <VictoryGroup offset={10} colorScale={"qualitative"}>
        <VictoryBar
          data={data}
          x="classLabels"
          y="original"
          barWidth={20}
          style={{ data: { fill: "rgba(0, 128, 0, 0.6)" } }}
          labelComponent={
            <VictoryTooltip
              flyoutStyle={{
                fill: "white",
                stroke: "lightgrey",
                strokeWidth: 1,
              }}
            />
          }
          labels={({ datum }) => `Original: ${datum.original}`}
        />
        <VictoryBar
          data={data}
          x="classLabels"
          y={(datum: { poisoned: any }) => datum.poisoned}
          barWidth={20}
          style={{ data: { fill: "rgba(255, 0, 0)" } }}
          labelComponent={
            <VictoryTooltip
              flyoutStyle={{
                fill: "white",
                stroke: "lightgrey",
                strokeWidth: 1,
              }}
            />
          }
          labels={({ datum }) => `Poisoned: ${datum.poisoned}`}
        />
      </VictoryGroup>
    </VictoryChart>
  );
};

export default AttackBarChart;
