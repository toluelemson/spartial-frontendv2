import React, { useState } from "react";
import "./ParaphraseButton.css";
import { Llama_Service } from "../../../api";

interface ParaphraseButtonProps {
  explanation: string;
  userRole: string;
}

const LlamaParaphrase: React.FC<ParaphraseButtonProps> = ({
  explanation,
  userRole,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [paraphrasedExplanation, setParaphrasedExplanation] = useState("");
  const [paraloading, setparaLoading] = useState(false);

  const openModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setModalIsOpen(true);
    paraphraseText(); // Start paraphrasing when the modal opens
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const removeHTMLTags = (str: string): string => {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const paraphraseText = async () => {
    setparaLoading(true);
    try {
      const response = await Llama_Service(userRole, explanation);

      console.log("API Response:", response);

      if (response && response.texts) {
        const cleanText = removeHTMLTags(response.texts);
        setParaphrasedExplanation(cleanText);
      } else {
        console.error("Invalid response format:", response);
        setParaphrasedExplanation("No paraphrased text available");
      }
    } catch (error) {
      console.error("Error in paraphraseText:", error);
      setParaphrasedExplanation("Error fetching paraphrased text");
    } finally {
      setparaLoading(false);
    }
  };

  return (
    <div>
      <button onClick={openModal} className="btn mt-2">
        <img
          src="/LLAMA.png"
          alt="Llama"
          style={{ width: "30px", marginRight: "10px" }}
        />
        <b>Get LLM Explanation </b>
      </button>
      {modalIsOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-button" onClick={closeModal}>
              &times;
            </span>
            <h3>LLM Generated</h3>
            <img
              src="/LLAMA.png"
              alt="Llama"
              style={{ width: "30px", marginRight: "10px" }}
            />
            <span className="text-muted">Powered By: Llama-2-7B-Chat</span>{" "}
            <br />
            {paraloading ? <p>Loading...</p> : <p>{paraphrasedExplanation}</p>}
            {/* <p>{paraphrasedExplanation}</p> */}
            <button onClick={closeModal} className="btn btn-secondary mt-2">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LlamaParaphrase;
