import PerformanceRow from "./Details/PerformanceRow";
import {TableSection} from "./Tables/TableSection";


interface PerformanceMetrics {
    metric: string;
    class0: string;
    class1: string;
    class2: string;
}

interface classificationLabel {
    label1: string[];
    label2: string[];
}

interface ModelPerformanceCompareProps {
    selectedModelLeft: boolean;
    selectedModelRight: boolean;
    dataStatsLeft: PerformanceMetrics[];
    dataStatsRight: PerformanceMetrics[];
    classificationLabel: classificationLabel;
}

const ModelPerformanceCompare: React.FC<ModelPerformanceCompareProps> = ({
                                                                             selectedModelLeft,
                                                                             selectedModelRight,
                                                                             dataStatsLeft,
                                                                             dataStatsRight,
                                                                             classificationLabel,
                                                                         }) => {
    return (
        <>
            <div className="row">
                <div className="col">
                    <TableSection title="Performance" columns={classificationLabel.label1}>
                        {selectedModelLeft && dataStatsLeft.map((d, index: any) => (
                            <PerformanceRow key={`left-${index}`} data={d}/>
                        ))}
                    </TableSection>
                </div>
                <div className="col">
                    <TableSection title="Performance" columns={classificationLabel.label2}>
                        {selectedModelRight && dataStatsRight.map((d, index) => (
                            <PerformanceRow key={`right-${index}`} data={d}/>
                        ))}
                    </TableSection>
                </div>
                {/*<div className="col">*/}
                {/*    <TableSection title="Performance" columns={classificationLabel.label1}>*/}
                {/*        {selectedModelLeft && dataStatsLeft.map((d, index) => (*/}
                {/*            <PerformanceRow key={`left-${index}`} data={d}/>*/}
                {/*        ))}*/}
                {/*    </TableSection>*/}
                {/*</div>*/}
            </div>
            <div className="row">
                {/*<div className="col">*/}
                {/*    <TableSection title="Attack Performance" columns={classificationLabel.label1}>*/}
                {/*        {selectedModelLeft && dataStatsLeft.map((d, index) => (*/}
                {/*            <PerformanceRow key={`left-${index}`} data={d}/>*/}
                {/*        ))}*/}
                {/*    </TableSection>*/}
                {/*</div>*/}
                {/*<div className="col">*/}
                {/*    <TableSection title="Attack Performance" columns={classificationLabel.label2}>*/}
                {/*        {selectedModelRight && dataStatsRight.map((d, index) => (*/}
                {/*            <PerformanceRow key={`right-${index}`} data={d}/>*/}
                {/*        ))}*/}
                {/*    </TableSection>*/}
                {/*</div>*/}
            </div>
        </>
    )
}

export default ModelPerformanceCompare;