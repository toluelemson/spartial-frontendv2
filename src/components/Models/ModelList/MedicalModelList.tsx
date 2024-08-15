import React, { FC, useCallback, useRef, useState } from "react";
import {
  Table,
  Modal,
  Button,
  DropdownButton,
  Dropdown,
  Pagination,
} from "react-bootstrap";
import { ModelData } from "../../../types/types";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../util/ActionButton";
import {
  BsCamera,
  BsDownload,
  BsEye,
  BsPencil,
  BsSave2,
  BsTrash,
} from "react-icons/bs";
import { CopyIcon } from "@radix-ui/react-icons";
import useMedicalModelAPI from "../MedicalModelsAPI";
import { deleteMedicalModel } from "../../../api";
import { ConvertTimeStamp } from "../../util/utility";

interface MedicalModelListProps {
  models?: ModelData[] | null;
}

const MedicalModelList: FC<MedicalModelListProps> = () => {
  console.log("MedicalModelList component mounted");
  const navigate = useNavigate();
  const { models, loading, error } = useMedicalModelAPI();
  console.log("models:", models, "loading:", loading, "error:", error);
  const [showModal, setShowModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelData | null>(null);
  const [editableModelId, setEditableModelId] = useState<string | null>(null);
  const editableDivRefs = useRef<{ [key: string]: HTMLDivElement }>({});
  const [newModelId, setNewModelId] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  const handleCloseModal = () => {
    setShowModal(false);
  };
  const openModal = useCallback((model: ModelData) => {
    setSelectedModel(model);
    setShowModal(true);
  }, []);

  const toggleEdit = (modelId: string) => {
    const isCurrentModelEditable = editableModelId === modelId;
    setEditableModelId(isCurrentModelEditable ? null : modelId);
    setTimeout(() => {
      if (!isCurrentModelEditable && editableDivRefs.current[modelId]) {
        editableDivRefs.current[modelId].focus();
      }
    }, 0);
  };
  const handleNavigate = (modelId: string) => {
    const trimmedModelId = modelId.replace(/^ma-/, "");
    // navigate(`/spatial/dashboard/${trimmedModelId}`);
    return trimmedModelId;
  };

  const handleDivInput = (e: React.FormEvent<HTMLDivElement>) =>
    setNewModelId(e.currentTarget.textContent || "");

  //   const handleDownload = (modelId: string) =>
  //     requestDownloadModel(modelId).catch(console.log);

  const handleCopy = (modelId: string) => {
    const modelIDtrim = handleNavigate(modelId);
    navigator.clipboard
      .writeText(modelIDtrim)
      .then(() => console.log("Text copied to clipboard"))
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  const closeDeleteModal = () => {
    setModelToDelete(null);
    setShowDeleteModal(false);
  };

  const openDeleteModal = (modelId: string) => {
    const modelIDtrim = handleNavigate(modelId);
    console.log("Opening delete modal for model:", modelIDtrim);
    setModelToDelete(modelIDtrim);
    setShowDeleteModal(true);
  };

  const confirmDeleteModel = async () => {
    console.log("Confirm delete for model:", modelToDelete);
    if (modelToDelete) {
      try {
        await deleteMedicalModel(modelToDelete);
        console.log("Model deleted successfully:", modelToDelete);
      } catch (error) {
        console.error("Error deleting model:", error);
      }
      setModelToDelete(null);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading models</div>;
  }

  if (!models || models.length === 0) {
    console.log("Models data:", models); // Debugging line to check models data
    return <div>No models available</div>;
  }

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
          {models.map((model: ModelData) => (
            <tr key={model.modelId}>
              <td>
                <div className="d-flex flex-column flex-lg-row align-items-center">
                  <div
                    ref={(el) =>
                      (editableDivRefs.current[model.modelId] =
                        el as HTMLDivElement)
                    }
                    className="p-2 mb-2 mb-lg-0"
                    style={{
                      cursor: "pointer",
                      width: "105px",
                      textAlign: "left",
                    }}
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
                      <BsEye />
                    </ActionButton>
                    {/* <ActionButton
                      onClick={() => handleDownload(model.modelId)}
                      tooltip={`Download ${model.modelId}`}
                      id={`download-tooltip-${model.modelId}`}
                      placement="top"
                    >
                      <BsDownload />
                    </ActionButton> */}
                    {/* <ActionButton
                      onClick={() => toggleEdit(model.modelId)}
                      tooltip={`Edit ${model.modelId}`}
                      id={`edit-tooltip-${model.modelId}`}
                      placement="top"
                    >
                      {editableModelId === model.modelId ? (
                        <BsSave2 />
                      ) : (
                        <BsPencil />
                      )}
                    </ActionButton> */}
                    <ActionButton
                      onClick={() => handleCopy(model.modelId)}
                      tooltip={`Copy ${model.modelId}`}
                      id={`copy-tooltip-${model.modelId}`}
                      placement="top"
                    >
                      <CopyIcon />
                    </ActionButton>
                    {![
                      "ac-neuralnetwork",
                      "ac-lightgbm",
                      "ac-xgboost",
                    ].includes(model.modelId) && (
                      <ActionButton
                        onClick={() => openDeleteModal(model.modelId)}
                        tooltip={`Delete ${model.modelId}`}
                        id={`delete-tooltip-${model.modelId}`}
                        placement="top"
                      >
                        <BsTrash />
                      </ActionButton>
                    )}
                  </div>
                </div>
              </td>
              <td>{ConvertTimeStamp(model.lastBuildAt)}</td>
              {/* <td>{ConvertTimeStamp(model.lastBuildAt)}</td> */}
              {/* <td>{ConvertTimeStamp(model.lastBuildAt)}</td> */}
              <td className="align-item text-center">
                <DropdownButton
                  id="dropdown-item-button"
                  title="Select an action"
                >
                  <Dropdown.Item
                    as="button"
                    onClick={() =>
                      navigate(`/spatial/dashboard/${model.modelId}`)
                    }
                  >
                    Send to Spatial
                  </Dropdown.Item>
                </DropdownButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* <Modal show={showModal} onHide={handleCloseModal}>
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
      </Modal> */}
      <Pagination>
        <Pagination.Prev />
        <Pagination.Item active>{1}</Pagination.Item>
        <Pagination.Next />
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
        <Modal.Body>Are you sure you want to delete the model?</Modal.Body>
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

export default MedicalModelList;
