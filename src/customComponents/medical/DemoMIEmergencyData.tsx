import React, { useState } from "react";
import { Col, Row, Button } from "react-bootstrap";

import { demoMIEmergencyData } from "../../api";

import MedicalNavbar from "./medicalNavbar";

interface ResultItem {
  _id: string;
  hea: string;
  dat: string;
}

const DemoMIEmergencyData: React.FC = () => {
  const [formData, setFormData] = useState({
    data_id: "7b07253d-0f92-4994-8170-081bd831cefd",
  });

  const [result, setResult] = useState<Array<ResultItem>>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await demoMIEmergencyData(formData.data_id);
    console.log("API Response:", response);
    setResult(response);
  };

  const handleCopyToClipboard = (content: string) => {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = content;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + " ...";
    }
    return text;
  };

  return (
    <>
      <MedicalNavbar />
      <div className="container mt-4">
        {/* Left side with the form */}

        <div className="border p-3">
          <form onSubmit={handleSubmit}>
            <h2 className="text-gray">
              Get a stored emergency ECG signals - Demo
            </h2>
            <div className="mb-3">
              <label htmlFor="textareadata_id" className="form-label">
                data_id:
              </label>
              <textarea
                id="data_id"
                name="data_id"
                value={formData.data_id}
                onChange={handleInputChange}
                className="form-control"
                rows={1}
              />
            </div>
            <br />
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      </div>
      {/* Right side with the results */}
      <br />
      <div className="container mt-4">
        {result && (
          <div className="border p-3">
            <h2>Results:</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>dat</th>
                  <th>hea</th>
                </tr>
              </thead>
              <tbody>
                {result.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {item._id} <br />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyToClipboard(item._id)}
                      >
                        Copy
                      </Button>
                    </td>
                    <td style={{ wordBreak: "break-all" }}>
                      {truncateText(item.dat, 25)} <br />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyToClipboard(item.dat)}
                      >
                        Copy
                      </Button>
                    </td>
                    <td style={{ wordBreak: "break-all" }}>
                      {truncateText(item.hea, 25)} <br />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopyToClipboard(item.hea)}
                      >
                        Copy
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default DemoMIEmergencyData;
