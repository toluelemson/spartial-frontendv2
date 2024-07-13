import React, {FC, useState, useRef, useCallback} from 'react';
import {Table, Modal, Button, DropdownButton, Dropdown} from 'react-bootstrap';
import {ModelData, TODO} from "../../../types/types";

import {useNavigate} from "react-router-dom";

interface MedicalModelListProps {
    models: ModelData[];
}

const MedicalModelList: FC<TODO> = () => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
    
    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <>
            <Table striped bordered hover responsive className="align-middle mt-3">
                <thead>
                <tr>
                    <th>Model Id</th>
                    <th>Built At</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {/*{models.map((model: { modelId: React.Key | null | undefined; lastBuildAt: number; }) => (*/}
                {/*    <tr key={model.modelId}>*/}
                {/*        <td>{ConvertTimeStamp(model.lastBuildAt)}</td>*/}
                {/*        <td>*/}
                {/*            <DropdownButton id="dropdown-item-button" title="Select an action">*/}
                {/*                <Dropdown.Item as="button"*/}
                {/*                               onClick={() => navigate(`/spatial/dashboard/${model.modelId}`)}>Send*/}
                {/*                    to Spatial </Dropdown.Item>*/}
                {/*            </DropdownButton>*/}
                {/*        </td>*/}
                {/*    </tr>*/}
                {/*))}*/}
                </tbody>
            </Table>

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
        </>
    );
};

export default MedicalModelList;
