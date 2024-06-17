import { DataParameterRow } from "./ModelRow";
import { TableSection } from "./TableSection";

interface ConfigParameter {
    parameter: string;
    value: string;
}


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