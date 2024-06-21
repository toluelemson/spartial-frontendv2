import { TableSection } from "../Tables/TableSection";

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
        <div className="col">
            <TableSection title="Configuration" columns={[""]}>
                {dataBuildConfigRight.map((d, index) => (
                    <DataParameterRow key={`right-${index}`} data={d}/>
                ))}
            </TableSection>
        </div>
    </div>
);
export default ModelBuildConfigCompare;