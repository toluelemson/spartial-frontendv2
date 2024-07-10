import React, { useState, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { visualizeECG, descriptionECGSignal } from "../../../api";
import MedicalNavbar from "../medical/medicalNavbar";
import { useRoleContext, Role } from "../../RoleProvider/RoleContext"; // Import the RoleContext and Role type

const VisualizeECG: React.FC = () => {
  const [formData, setFormData] = useState({
    dat: "",
    hea: "",
    cut_classification_window: "--",
  });
  const [result1, setResult1] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<{ [key: string]: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const { roles, setCurrentService, userRole } = useRoleContext(); // Ensure setUserRole is included

  useEffect(() => {
    setCurrentService("Medical"); // Ensure the current service is set to 'Medical'
  }, [setCurrentService]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response1 = await visualizeECG(
        formData.dat,
        formData.hea,
        formData.cut_classification_window
      );
      if (response1) {
        const imageUrl1 = URL.createObjectURL(response1);
        setResult1(imageUrl1);

        const promises = roles.map((role) =>
          descriptionECGSignal(role, formData.cut_classification_window)
            .then((response) => {
              if (response) {
                return { [role]: response.description };
              } else {
                console.error(
                  `Invalid response format for ${role} description`
                );
                return { [role]: "No description available" };
              }
            })
            .catch((error) => {
              console.error(`Error fetching ${role} description:`, error);
              return { [role]: "Error fetching description" };
            })
        );

        const descriptions = await Promise.all(promises);
        const explanationsObject = descriptions.reduce(
          (acc, curr) => ({ ...acc, ...curr }),
          {}
        );
        setExplanations(explanationsObject);
      } else {
        console.error("Invalid response format for API 1:", response1);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MedicalNavbar />
      <div className="container mt-4">
        <Row>
          <Col md={6}>
            <div className="border p-3">
              <form onSubmit={handleSubmit}>
                <h2 className="text-gray">
                  Plot the provided encoded ECG signal
                </h2>
                <div className="mb-3">
                  <label
                    htmlFor="selectCutClassificationWindow"
                    className="form-label"
                  >
                    Cut Classification Window:
                  </label>
                  <select
                    id="selectCutClassificationWindow"
                    name="cut_classification_window"
                    value={formData.cut_classification_window}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="--">--</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="textareaDat" className="form-label">
                    dat:
                  </label>
                  <textarea
                    id="textareaDat"
                    name="dat"
                    value={formData.dat}
                    onChange={handleInputChange}
                    className="form-control"
                    rows={4}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="textareaHea" className="form-label">
                    hea:
                  </label>
                  <textarea
                    id="textareaHea"
                    name="hea"
                    value={formData.hea}
                    onChange={handleInputChange}
                    className="form-control"
                    rows={4}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Submit"}
                </button>
              </form>
            </div>
          </Col>
          <Col md={6}>
            {result1 && (
              <div className="border p-3">
                <h2>ECG Plot:</h2>
                <img
                  src={result1}
                  // width="300"
                  // height="250"
                  alt="Result Image"
                  className="img-fluid"
                />
              </div>
            )}
            {explanations[userRole] && (
              <div className="border p-3 mt-4">
                <h2>Explanation:</h2>
                <p>{explanations[userRole]}</p>
              </div>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default VisualizeECG;
