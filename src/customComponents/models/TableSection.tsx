export const TableSection: React.FC<{
    title: string;
    columns: any[];
    children: React.ReactNode;
}> = ({title, columns, children}) => (
    <table className="table table-bordered mt-5">
        <thead>
        <tr>
            {title === "Confusion Matrix" && (
                <>
                    <th>Predicted\Observed</th>
                    {/*<th>Before Attack</th>*/}
                    {/*<th>After Attack</th>*/}
                </>
            )}
            {title === "Performance" && (
                <>
                    {/*<th><b>Metrics</b></th>*/}

                </>
            )}
            {/*{title !== "Confusion Matrix" && title !== "Performance Attack" && (*/}
            {/*    <>*/}
            {/*        /!*<th><b>Metrics</b></th>*!/*/}
            {/*        /!*<th>Before Attack</th>*!/*/}
            {/*        /!*<th>After Attack</th>*!/*/}
            {/*    </>*/}
            {/*)}*/}
            {Array.isArray(columns) && columns.map((column, index) => {
                console.log(column)
                return (
                    <th key={index}>{column}</th>
                )
            })}
        </tr>
        </thead>
        <tbody>
        {children}
        </tbody>
    </table>
);