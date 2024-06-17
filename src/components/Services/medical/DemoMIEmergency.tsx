import React, { useState } from "react";
import { Col, Row, Button } from "react-bootstrap";

import { demoMIEmergency } from "../../../api";

import MedicalNavbar from "./medicalNavbar";

interface ResultItem {
  _id: string;
  hea: string;
  dat: string;
}

const DemoMIEmergency: React.FC = () => {
  const [formData, setFormData] = useState({
    limit: 10,
  });

  const [result, setResult] = useState<Array<ResultItem>>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await demoMIEmergency(formData.limit);
      console.log("API Response:", response);
      setResult(response);
    } catch (error) {
      // Handle API request error
      console.error("Error in handleSubmit:", error);
      // You might want to set an error state or display an error message to the user
    } finally {
      setLoading(false); // Set loading state to false after the API call completes
    }
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
              Get list of stored emergency ECG signals - Demo
            </h2>
            <div className="col">
              <label htmlFor="limit" className="form-label">
                limit:
              </label>
              <input
                type="number"
                step="10"
                className="form-control"
                id="limit"
                name="limit"
                value={formData.limit}
                onChange={handleInputChange}
              />
            </div>
            <br />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
      {/* Right side with the results */}
      <br />
      <div className="container mt-4">
        {result.length > 0 && (
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

export default DemoMIEmergency;
