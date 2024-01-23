import React, {useState, useCallback, useMemo, FC, useRef} from 'react';
import {
    Button,
    Table,
    DropdownButton,
    Dropdown,
    Pagination,
    Container,
    Modal,
    Form
} from 'react-bootstrap';
import {BsDownload, BsEye, BsPencil, BsCamera, BsSave2} from "react-icons/bs";
import {CopyIcon} from "@radix-ui/react-icons";
import {useSpatialContext} from "../../context/context";
import {ModelData, ModelListType} from "../../types/types";
import {ConvertTimeStamp} from "../util/utility";
import ActionButton from "../util/ActionButton";
import {requestDownloadDatasets, requestDownloadModel, requestUpdateModel} from "../../api";
import {To, useNavigate} from "react-router-dom";


const AllModels: FC = () => {

    const navigate = useNavigate();

    const {allModel} = useSpatialContext();
    const models = useMemo(() => allModel as ModelListType | null, [allModel]);
    const [showModal, setShowModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    // const [isEditable, setIsEditable] = useState(false);
    const [editableModelId, setEditableModelId] = useState<string | null>(null);
    const [newModelId, setNewModelId] = useState<string>("");

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

    const [filterPrefix, setFilterPrefix] = useState<string>('compare');

    const filteredModels = useMemo(() => {
        return filterPrefix !== 'compare'
            ? models && models.filter(model => model.modelId.toLowerCase().startsWith(filterPrefix))
            : models;
    }, [models, filterPrefix]);

    const handleCheckboxChange = (modelId: string, isChecked: boolean) => {
        setSelectedModels(prev => {
            if (isChecked) {
                return [...prev, modelId];
            } else {
                return prev.filter(id => id !== modelId);
            }
        });
    };

    const handleButtonNavigate = (targetPath: To) => {
        navigate(targetPath);
    };

    const handleNavigation = (url: string) => {
        navigate(url);
    };

    const handleDivInput = (e: React.FormEvent<HTMLDivElement>) => {
        const content = e.currentTarget.textContent || "";
        console.log(content);
        setNewModelId(content);
    };

    const openModal = useCallback((model: ModelData) => {
        setSelectedModel(model);
        setShowModal(true);
    }, []);

    const handleDownload = (modelId: string) => {
        requestDownloadModel(modelId).catch(e => console.log(e))
    }

    const handleDownloadDataset = (modelId: string, datasetType: string) => {
        requestDownloadDatasets(modelId, datasetType).catch(e => console.log(e))
    }

    function handleCopy(modelId: string) {
        navigator.clipboard.writeText(modelId)
            .then(() => {
                console.log('Text copied to clipboard');
            })
            .catch(err => {
                console.error('Failed to copy text: ', err);
            });
    }

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <Container>
            <h1>All models</h1>
            <Form>
                <Form.Group controlId="filterPrefix">
                    <Form.Label>Filter models by Services</Form.Label>
                    <Form.Select
                        value={filterPrefix}
                        onChange={(e) => setFilterPrefix(e.target.value)}
                        aria-label="Model ID prefix filter"
                    >
                        <option value="">Select a Service</option>
                        <option value="ac-">Network Traffic-</option>
                        <option value="model">Privacy-</option>
                    </Form.Select>
                </Form.Group>
            </Form>
            <Table striped bordered hover responsive className="align-middle">
                <thead>
                <tr>
                    <th style={{width: '5%'}}>Select</th>
                    <th>Model Id</th>
                    <th>Built At</th>
                    <th>Training Dataset</th>
                    <th>Testing Dataset</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredModels?.map(model => (
                    <tr key={model.modelId}>
                        <td>
                            <input
                                type="checkbox"
                                onChange={(e) => handleCheckboxChange(model.modelId, e.target.checked)}
                            />
                        </td>
                        <td>
                            <div className="d-flex flex-column flex-lg-row align-items-center">
                                <div ref={el => editableDivRefs.current[model.modelId] = el as HTMLDivElement}
                                     className="p-2 mb-2 mb-lg-0"
                                     style={{cursor: 'pointer', width: '105px', textAlign: 'left'}}
                                     contentEditable={editableModelId === model.modelId}
                                     onInput={(e) => handleDivInput(e)}
                                     suppressContentEditableWarning={true}>
                                    {model.modelId}
                                </div>
                                <div className="d-flex flex-grow-1 justify-content-start justify-content-lg-center">
                                    <ActionButton onClick={() => openModal(model)}
                                                  tooltip={`View Config ${model.modelId}`}
                                                  id={`view-config-tooltip-${model.modelId}`} placement="top">
                                        <BsEye/>
                                    </ActionButton>
                                    <ActionButton onClick={() => handleDownload(model.modelId)}
                                                  tooltip={`Download ${model.modelId}`}
                                                  id={`download-tooltip-${model.modelId} `} placement="top">
                                        <BsDownload/>
                                    </ActionButton>
                                    <ActionButton onClick={() => toggleEdit(model.modelId)}
                                                  tooltip={`Edit ${model.modelId}`}
                                                  id={`edit-tooltip-${model.modelId}`}
                                                  placement="top">
                                        {editableModelId === model.modelId ? <BsSave2/> : <BsPencil/>}
                                    </ActionButton>
                                    <ActionButton onClick={() => handleCopy(model.modelId)}
                                                  tooltip={`Copy ${model.modelId}`} id={`copy-tooltip-${model.modelId}`}
                                                  placement="top">
                                        <CopyIcon/>
                                    </ActionButton>
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
                                tooltip={`View Config ${model.modelId}`}
                                id={`view-config-tooltip-${model.modelId}`}
                                placement="top"
                                icon={<BsDownload/>}
                                buttonText="Download"/>
                        </td>
                        <td>
                            <ActionButton
                                onClick={() => handleButtonNavigate(`/datasets/${model.modelId}/test`)}
                                tooltip={`View Config ${model.modelId}`}
                                id={`view-config-tooltip-${model.modelId}`}
                                placement="top"
                                icon={<BsCamera/>}
                                buttonText="View"
                            />
                            <ActionButton
                                onClick={() => handleDownloadDataset(model.modelId, "test")}
                                tooltip={`View Config ${model.modelId}`}
                                id={`view-config-tooltip-${model.modelId}`}
                                placement="top"
                                icon={<BsDownload/>}
                                buttonText="Download"
                            />
                        </td>
                        <td>
                            <DropdownButton id="dropdown-item-button" title="Select an action">
                                <Dropdown.Item as="button"
                                               onClick={() => handleNavigation(`/spatial/dashboard/${model.modelId}`)}>Send to
                                    Spatial </Dropdown.Item>
                                {/*<Dropdown.Item as="button" onClick={() => handleNavigation(`/xai/lime/${model.modelId}`)}>Lime </Dropdown.Item>*/}
                            </DropdownButton>
                        </td>
                    </tr>
                ))}
                </tbody>
            </Table>

            <div className="my-3">
                <Button variant="danger">Delete All Models</Button>
                {/*<Button variant="primary m-2" onClick={sendToSpatial}>Send to Spatial</Button>*/}
            </div>
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
        </Container>
    );
};

export default AllModels;
