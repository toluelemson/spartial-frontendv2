import React, { useState, useEffect } from "react";
import { useRoleContext } from "../../RoleProvider/RoleContext";
import XAINavbar from "./XAINavbar";
import { xaiAPI } from "../../../api";
import BarChart from "./BarChart";

// Define the types for different XAI methods
interface LimeResult {
  xai_method: "lime";
  top_T: string[];
  image_base64: string;
  bar_plot_base64: string;
  pred: [string, string];
  top_labels_names: string[];
  scores: number[];
}

interface ShapResult {
  xai_method: "shap";
  shap_V_plot_base64: string;
}

interface OccResult {
  xai_method: "occ";
  Occ_GradCam_base64: string; // Replace with the actual type of OccValues
  Occ_image_base64: string;
}

type ResultType = LimeResult | ShapResult | OccResult;

// Specify the type for the state
interface FormData {
  xai_method: string;
  imagetype: string;
  image: File | null;
  model: File | null;
}

// Inside ResultItem component
const ResultItem: React.FC<{
  result: ResultType;
  xai_method: "lime" | "shap" | "occ";
}> = ({ result, xai_method }) => {
  if (!result) {
    console.error("Error: No result data", result);
    return (
      <div className="result-item alert alert-danger">
        Error: No result data
      </div>
    );
  }

  if (!xai_method) {
    console.error("Error: xai_method is not provided");
    return (
      <div className="result-item alert alert-danger">
        Error: xai_method is not provided
      </div>
    );
  }

  return (
    <div>
      {/* className="result-item border p-3 mb-4" */}
      <h3 className="mb-3">Results:</h3>

      {/* Customize rendering based on xai_method */}
      {xai_method === "lime" && (
        <>
          <div className="row">
            <div className="col">
              <div className="border p-3">
                <p className="mb-2">Bar Plot:</p>
                {/* Add a custom class for BarChart */}
                <BarChart
                  scores={(result as LimeResult).scores}
                  labels={(result as LimeResult).top_labels_names}
                />

                <ul className="list-group mb-3">
                  {(result as LimeResult).top_T.map(
                    (label: string, index: number) => (
                      <li key={index} className="list-group-item">
                        {label}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            <div className="col">
              {" "}
              <div className="border p-3">
                <p className="mb-2">Lime Image:</p>
                {
                  <img
                    src={`data:image/png;base64, ${
                      (result as LimeResult).image_base64
                    }`}
                    alt="Lime Image"
                    className="img-fluid mx-auto d-block" // Add a custom class for the image
                    style={{ width: "550px", height: "550px" }}
                  />
                }
              </div>{" "}
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="border p-3">
                <p className="mb-2">Segment Importance:</p>
                <br />
                <img
                  src={`data:image/png;base64, ${
                    (result as LimeResult).bar_plot_base64
                  }`}
                  alt="Bar Plot Image"
                  className="img-fluid mx-auto d-block"
                  style={{ width: "550px", height: "550px" }}
                />
              </div>
            </div>{" "}
            <div className="col"></div>
          </div>
        </>
      )}

      {xai_method === "shap" && (
        <>
          <div className="row">
            <div className="col">
              <div className="border p-3">
                <p className="mb-2">Shap Image:</p>
                {
                  <img
                    src={`data:image/png;base64, ${
                      (result as ShapResult).shap_V_plot_base64
                    }`}
                    alt="Shap Plot Image"
                    className="img-fluid mx-auto d-block" // Add a custom class for the image
                    style={{ width: "3000px", height: "400px" }}
                  />
                }
              </div>
            </div>
          </div>
        </>
      )}

      {xai_method === "occ" && (
        <>
          {" "}
          <div className="row">
            <div className="col">
              <div className="border p-3">
                <p className="mb-2">Occlusion Sensitivity:</p>
                <img
                  src={`data:image/png;base64, ${
                    (result as OccResult).Occ_image_base64
                  }`}
                  alt="Occlusion Image"
                  className="img-fluid mx-auto d-block"
                  style={{ width: "550px", height: "550px" }}
                />
              </div>
            </div>

            <div className="col">
              <div className="border p-3">
                <p className="mb-2">GradCam:</p>

                <img
                  src={`data:image/png;base64, ${
                    (result as OccResult).Occ_GradCam_base64
                  }`}
                  alt="GradCam Image"
                  className="img-fluid mx-auto d-block"
                  // style={{ position: "relative" }}
                  style={{
                    width: "550px",
                    height: "550px",
                    position: "relative",
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const XAIHomepage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultType[] | null>(null);

  const { setCurrentService } = useRoleContext();

  useEffect(() => {
    setCurrentService("XAI");
  }, [setCurrentService]);

  // Specify the type for formData
  const [formData, setFormData] = useState<FormData>({
    xai_method: "lime",
    imagetype: "",
    image: null,
    model: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prevData) => ({
      ...prevData,
      image: file,
    }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prevData) => ({
      ...prevData,
      model: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.image && formData.model) {
        const response = await xaiAPI(
          formData.xai_method,
          formData.image,
          formData.model,
          formData.imagetype
        );
        console.log("response", response);

        setResult([response]); // Assuming the API response is an array
      } else {
        setError("Please upload both an image and a model.");
      }
    } catch (error) {
      console.error(error);
      // Provide more specific error messages based on the server response
      setError("Error processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <XAINavbar />
      <br />
      <div className="container mb-4">
        <div className="row ">
          {/* <h2 className="mb-4">Building Trust Through Explainable AI</h2> */}
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="border mb-4 col">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="selectxai_method" className="form-label">
                  XAI Method:
                </label>
                <select
                  id="selectxai_method"
                  name="xai_method"
                  value={formData.xai_method}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="lime">Lime</option>
                  <option value="shap">Shap</option>
                  <option value="occ">Occlusion</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="selectimagetype" className="form-label">
                  Class Label:
                </label>
                <select
                  id="selectimagetype"
                  name="imagetype"
                  value={formData.imagetype}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="cardboard">Cardboard</option>
                  <option value="glass">Glass</option>
                  <option value="metal">Metal</option>
                  <option value="paper">Paper</option>
                  <option value="plastic">Plastic</option>
                  <option value="trash">Trash</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="selectimage" className="form-label">
                  Upload Image:
                </label>{" "}
                &nbsp;
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="selectimage" className="form-label">
                  Upload Model:
                </label>{" "}
                &nbsp;
                <input
                  type="file"
                  accept=".h5, .onnx, .pb"
                  onChange={handleModelChange}
                />
              </div>

              <button
                type="submit"
                className="btn btn-secondary"
                disabled={loading}
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </form>
            <br />
          </div>{" "}
          {/* <div className="border mb-4 col">
            {" "}
            {result && result.length > 0 && (
              <div className=" col">
                <div>
                  {result.map((item, index) => (
                    <ResultItem
                      result={item}
                      xai_method={
                        formData.xai_method as "lime" | "shap" | "occ"
                      }
                    />
                  ))}
                </div>
              </div>
            )}
          </div> */}
          {/* <div className="border mb-4 col"></div> */}
        </div>
        <div className="row ">
          {result && result.length > 0 && (
            <div className="border mb-4 col">
              <div className=" col">
                <div>
                  {result.map((item, index) => (
                    <ResultItem
                      result={item}
                      xai_method={
                        formData.xai_method as "lime" | "shap" | "occ"
                      }
                    />
                  ))}
                </div>
              </div>{" "}
              <br />
            </div>
          )}{" "}
        </div>{" "}
        {/* <div className="border mb-4 col">
            {result && result.length > 0 && (
              <div className=" col">
                <div>
                  {result.map((item, index) => (
                    <ResultItem
                      result={item}
                      xai_method={
                        formData.xai_method as "lime" | "shap" | "occ"
                      }
                    />
                  ))}
                </div>
              </div>
            )}{" "}
          </div> */}
      </div>
      {/* <div className="row "></div> */}
    </>
  );
};
export default XAIHomepage;
