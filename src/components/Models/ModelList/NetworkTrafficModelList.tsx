import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {Button, Dropdown, DropdownButton, Modal, Pagination, Table} from 'react-bootstrap';
import {ModelData, ModelListType} from '../../../types/types';
import {ConvertTimeStamp} from '../../util/utility';
import {useNavigate} from "react-router-dom";
import ActionButton from '../../util/ActionButton';
import {BsCamera, BsDownload, BsEye, BsPencil, BsSave2, BsTrash} from 'react-icons/bs';
import {deleteModel, requestAllModels, requestDownloadDatasets, requestDownloadModel} from '../../../api';
import {CopyIcon} from '@radix-ui/react-icons';
import useModelAPI from '../ModelAPI';

interface ModelListProps {
    models?: ModelData[] | null;
}

const NetworkTrafficModelList: FC<ModelListProps> = () => {
    const navigate = useNavigate();
    const {models, loading, error} = useModelAPI();
    const [modelList, setModelList] = useState<ModelListType | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
    const [editableModelId, setEditableModelId] = useState<string | null>(null);
    const [newModelId, setNewModelId] = useState<string>("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modelToDelete, setModelToDelete] = useState<string | null>(null);
    const editableDivRefs = useRef<{ [key: string]: HTMLDivElement }>({});

    const toggleEdit = (modelId: string) => {
        const isCurrentModelEditable = editableModelId === modelId;
        setEditableModelId(isCurrentModelEditable ? null : modelId);
        setTimeout(() => {
            if (!isCurrentModelEditable && editableDivRefs.current[modelId]) {
                editableDivRefs.current[modelId].focus();
            }
        }, 0);
    };

    useEffect(() => {
        const fetchModels = async () => {
            const updatedModels = await requestAllModels();
            setModelList(updatedModels);
        };
        fetchModels();
    }, []);

    const handleButtonNavigate = (targetPath: string) => navigate(targetPath);

    const handleNavigation = (url: string) => navigate(url);

    const handleDivInput = (e: React.FormEvent<HTMLDivElement>) => setNewModelId(e.currentTarget.textContent || "");

    const openModal = useCallback((model: ModelData) => {
        setSelectedModel(model);
        setShowModal(true);
    }, []);

    const handleDownload = (modelId: string) => requestDownloadModel(modelId).catch(console.log);

    const handleDownloadDataset = (modelId: string, datasetType: string) => {
        requestDownloadDatasets(modelId, datasetType).catch(console.log);
    };

    const handleCopy = (modelId: string) => {
        navigator.clipboard.writeText(modelId)
            .then(() => console.log('Text copied to clipboard'))
            .catch(err => console.error('Failed to copy text: ', err));
    };

    const openDeleteModal = (modelId: string) => {
        setModelToDelete(modelId);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setModelToDelete(null);
        setShowDeleteModal(false);
    };

    const confirmDeleteModel = async () => {
        if (modelToDelete) {
            try {
                await deleteModel(modelToDelete);
                setModelToDelete(null);
                setShowDeleteModal(false);
                const updatedModels = await requestAllModels();
                setModelList(updatedModels);
            } catch (error) {
                console.error("Error deleting model:", error);
            }
        }
    };

    const handleCloseModal = () => setShowModal(false);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!models) {
        return <div>No models available</div>;
    }

    return (
        <>
            <Table striped bordered hover responsive className="align-middle mt-3">
                <thead>
                <tr>
                    <th>Model Id</th>
                    <th>Built At</th>
                    <th>Training Dataset</th>
                    <th>Testing Dataset</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {models.map(model => (
                    <tr key={model.modelId}>
                        <td>
                            <div className="d-flex flex-column flex-lg-row align-items-center">
                                <div
                                    ref={el => (editableDivRefs.current[model.modelId] = el as HTMLDivElement)}
                                    className="p-2 mb-2 mb-lg-0"
                                    style={{cursor: 'pointer', width: '105px', textAlign: 'left'}}
                                    contentEditable={editableModelId === model.modelId}
                                    onInput={handleDivInput}
                                >
                                    {model.modelId}
                                </div>
                                <div className="d-flex flex-grow-1 justify-content-start justify-content-lg-center">
                                    <ActionButton
                                        onClick={() => openModal(model)}
                                        tooltip={`View Config ${model.modelId}`}
                                        id={`view-config-tooltip-${model.modelId}`}
                                        placement="top"
                                    >
                                        <BsEye/>
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => handleDownload(model.modelId)}
                                        tooltip={`Download ${model.modelId}`}
                                        id={`download-tooltip-${model.modelId}`}
                                        placement="top"
                                    >
                                        <BsDownload/>
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => toggleEdit(model.modelId)}
                                        tooltip={`Edit ${model.modelId}`}
                                        id={`edit-tooltip-${model.modelId}`}
                                        placement="top"
                                    >
                                        {editableModelId === model.modelId ? <BsSave2/> : <BsPencil/>}
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => handleCopy(model.modelId)}
                                        tooltip={`Copy ${model.modelId}`}
                                        id={`copy-tooltip-${model.modelId}`}
                                        placement="top"
                                    >
                                        <CopyIcon/>
                                    </ActionButton>
                                    {!["ac-neuralnetwork", "ac-lightgbm", "ac-xgboost"].includes(model.modelId) && (
                                        <ActionButton
                                            onClick={() => openDeleteModal(model.modelId)}
                                            tooltip={`Delete ${model.modelId}`}
                                            id={`delete-tooltip-${model.modelId}`}
                                            placement="top"
                                        >
                                            <BsTrash/>
                                        </ActionButton>
                                    )}
                                </div>
                            </div>
                        </td>
                        <td>{ConvertTimeStamp(model.lastBuildAt)}</td>
                        <td>
                            <ActionButton
                                onClick={() => handleButtonNavigate(`/datasets/${model.modelId}/train`)}
                                tooltip={`View Config ${model.modelId}`}
                                id={`view-config-tooltip-${model.modelId}`}
                                placement="top"
                                icon={<BsCamera/>}
                                buttonText="View"
                            />
                            <ActionButton
                                onClick={() => handleDownloadDataset(model.modelId, "train")}
                                tooltip={`Download Training Dataset ${model.modelId}`}
                                id={`download-train-dataset-tooltip-${model.modelId}`}
                                placement="top"
                                icon={<BsDownload/>}
                                buttonText="Download"
                            />
                        </td>
                        <td>
                            <ActionButton
                                onClick={() => handleButtonNavigate(`/datasets/${model.modelId}/test`)}
                                tooltip={`View Testing Dataset ${model.modelId}`}
                                id={`view-test-dataset-tooltip-${model.modelId}`}
                                placement="top"
                                icon={<BsCamera/>}
                                buttonText="View"
                            />
                            <ActionButton
                                onClick={() => handleDownloadDataset(model.modelId, "test")}
                                tooltip={`Download Testing Dataset ${model.modelId}`}
                                id={`download-test-dataset-tooltip-${model.modelId}`}
                                placement="top"
                                icon={<BsDownload/>}
                                buttonText="Download"
                            />
                        </td>
                        <td>
                            <DropdownButton id="dropdown-item-button" title="Select an action">
                                <Dropdown.Item
                                    as="button"
                                    onClick={() => handleNavigation(`/spatial/dashboard/${model.modelId}`)}
                                >
                                    Send to Spatial
                                </Dropdown.Item>
                            </DropdownButton>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>
            <Pagination>
                <Pagination.Prev/>
                <Pagination.Item active>{1}</Pagination.Item>
                <Pagination.Next/>
            </Pagination>
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Build config for {selectedModel?.modelId}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <pre>{JSON.stringify(selectedModel?.buildConfig, null, 2)}</pre>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={closeDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the model?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteModel}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default NetworkTrafficModelList;
