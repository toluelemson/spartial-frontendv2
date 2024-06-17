import React, {useEffect, useState} from 'react';
import {TableSection} from "./TableSection";

interface ConfusionMatrixProps {
  cmConfigRight : {
    data: any
  }
  cmConfigLeft : {
    data: any
  }
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ cmConfigLeft, cmConfigRight }) => {


    const [matrixLeft, setMatrixLeft] = useState<any>({});
    const [matrixRight, setMatrixRight] = useState<any>({});


   useEffect(() => {
    const buildMatrix = (data: any[]) => {
        const matrix: any = {};
        data.forEach(item => {
            if (!matrix[item.actual]) {
                matrix[item.actual] = {};
            }
            matrix[item.actual][item.predicted] = `${item.count} (${item.percentage})`;
        });
        return matrix;
    };

    if (cmConfigRight && cmConfigRight.data && Array.isArray(cmConfigRight.data)) {
        setMatrixRight(buildMatrix(cmConfigRight.data));
    }

    if (cmConfigLeft && cmConfigLeft.data && Array.isArray(cmConfigLeft.data)) {
        setMatrixLeft(buildMatrix(cmConfigLeft.data));
    }
}, [cmConfigLeft, cmConfigRight]);

    // cmConfigRight && cmConfigRight.data && Array.isArray(cmConfigRight.data) && cmConfigRight.data.forEach((item: any) => {
    //     if (!matrixRight[item.actual]) {
    //         matrixRight[item.actual] = {};
    //     }
    //     matrixRight[item.actual][item.predicted] = `${item.count} (${item.percentage})`;
    // });

    const categoriesRight = Object.keys(matrixRight);
    const categoriesLeft = Object.keys(matrixLeft);


    // cmConfigLeft && cmConfigLeft.data && Array.isArray(cmConfigLeft.data) && cmConfigLeft.data.forEach((item: any) => {
    //     if (!matrixLeft[item.actual]) {
    //         matrixLeft[item.actual] = {};
    //     }
    //     matrixLeft[item.actual][item.predicted] = `${item.count} (${item.percentage})`;
    //
    // });

    const columnLeft = categoriesLeft.map((category) => category)
    const columnRight = categoriesRight.map((category) => category)

    return (
        <div className="row">
            <div className="col">
                <TableSection
                    title={"Confusion Matrix"}
                    columns={columnLeft} >
                    {categoriesLeft.map((actual) => (
                        <tr key={actual}>
                            <td>{actual}</td>
                            {categoriesLeft.map((predicted) => (
                                <td key={predicted}>{matrixLeft[actual][predicted] || '0 (0.00%)'}</td>
                            ))}
                        </tr>
                    ))}
                </TableSection>

            </div>
            <div className="col">
                     <TableSection
                        title={"Confusion Matrix"}
                        columns={columnRight} >
                        {categoriesRight.map((actual) => (
                            <tr key={actual}>
                                <td>{actual}</td>
                                {categoriesRight.map((predicted) => (
                                    <td key={predicted}>{matrixRight[actual][predicted] || '0 (0.00%)'}</td>
                                ))}
                        </tr>
                    ))}
                </TableSection>
            </div>
        </div>


    )
}

export default ConfusionMatrix;
