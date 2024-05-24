import React, {useEffect, useMemo, useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import useFetchModelDataset from "./useFetchModelDataset";
import * as api from "../../api";

interface TableComponentProps {
    modelIdProp?: string | null;
    datasetTypeProp?: string;
}

const TableComponent: React.FC<TableComponentProps> = ({modelIdProp, datasetTypeProp}) => {

    const [viewDatasetModel, setViewDatasetModel] = useState<any>([])
    // const { modelId: modelIdUrl, datasetType: datasetTypeUrl } = useParams();

    const getPathSegments = useMemo(() => {
        const segments = window.location.pathname.split('/').filter(Boolean);
        return {
            lastPath: segments[segments.length - 1] || '',
            secondToLastPath: segments[segments.length - 2] || ''
        };
    }, []);

    const {secondToLastPath, lastPath} = getPathSegments;

    const modelId = modelIdProp || secondToLastPath;
    const datasetType = datasetTypeProp || lastPath;

    const {originalDataset, error} = useFetchModelDataset(true, modelId, "train");


    useEffect(() => {
        if (originalDataset && originalDataset.resultData && originalDataset.resultData.length > 0) {
            setViewDatasetModel(originalDataset.resultData);
        }
    }, [originalDataset, datasetType, modelId, modelIdProp]);

    const [currentPage, setCurrentPage] = useState(1);
    // Assuming 10 rows per page
    const rowsPerPage = 12;
    // Calculate the current data slice
    const currentDatasetModel = useMemo(() =>
            viewDatasetModel.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage),
        [currentPage, viewDatasetModel, rowsPerPage]
    );

    const Pagination = () => {
        return (
            <nav>
                <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <a className="page-link" href="#" onClick={() => setCurrentPage(1)}>First</a>
                    </li>
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <a className="page-link" href="#"
                           onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Previous</a>
                    </li>
                    <li className={`page-item ${currentPage === 27 ? 'disabled' : ''}`}>
                        <a className="page-link" href="#" onClick={() => setCurrentPage(prev => prev + 1)}>Next</a>
                    </li>
                    <li className={`page-item ${currentPage === 27 ? 'disabled' : ''}`}>
                        <a className="page-link" href="#" onClick={() => setCurrentPage(27)}>Last</a>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div className="container mt-4">
            <h2>Data</h2>
            <p>Total number of samples: {viewDatasetModel.length}; Total number of features: 21</p>
            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead>
                    <tr>
                        {viewDatasetModel.length > 0 && (
                            Object.keys(viewDatasetModel[0]).map((key, index) => (
                                <th key={index}>{key}</th>
                            ))
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {currentDatasetModel.map((item: { [x: string]: any; }, index: React.Key | null | undefined) => (
                        <tr key={index}>
                            {Object.keys(item).map((key, valIndex) => {
                                const value = item[key];

                                if (typeof value === 'string' || typeof value === 'number') {
                                    return <td key={valIndex}>{value}</td>;
                                }
                                return <td key={valIndex}>Not renderable value</td>;
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                <Pagination/>
            </div>
        </div>
    );
};

export default TableComponent;