import React, { useState, useEffect } from "react";
import { useRoleContext } from "../../RoleProvider/RoleContext";
import { Link } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Col,
  Row,
  Card,
  Spinner,
  Table,
} from "react-bootstrap";
import { requestWithSecureData, PostWithSecureData } from "../../../api";
import "./AllWithSecureData.css";
import { DataItem } from "../../../types/types";

const withsecureHomepage = "/data/all";


const AllWithSecureData: React.FC = () => {
  const [formData, setFormData] = useState({
    classname: "",
    file: null as File | null,
  });
  const { setCurrentService } = useRoleContext();
  const [loading, setLoading] = useState(false);
  const [dataList, setDataList] = useState<DataItem[]>([]);

  useEffect(() => {
    setCurrentService("WithSecure");
    fetchDataList();
  }, [setCurrentService]);

  const fetchDataList = async () => {
    try {
      const data = await requestWithSecureData();
      setDataList(data);
    } catch (error) {
      console.error("Error fetching data list:", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.file && formData.classname) {
        await PostWithSecureData(formData.file, formData.classname);
        fetchDataList();
      } else {
        alert("Please provide both file and class name.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mt-5">
        <Link to={withsecureHomepage} className="nav-link text-lightblue fs-5">
          Add Data & Constraints
        </Link>
        <p></p>
      </div>
      <Container>
        <Row>
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <h4 className="mb-4">Upload Data Item</h4>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload Data/Constraints File:</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Class Name:</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="classname"
                      placeholder="Enter Class Name"
                      value={formData.classname}
                      onChange={handleInputChange}
                      rows={1}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="mt-3 w-100"
                    disabled={loading}
                  >
                    {loading ? "Uploading..." : "Upload File"}
                    {/* {loading && <SpinnerComponent />} */}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Body>
                <h4 className="mb-4">Data List</h4>
                {dataList.length === 0 ? (
                  <p>No data available.</p>
                ) : (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Digest</th>
                        <th>Mime Type</th>
                        <th>Class Name</th>
                        <th>Extension</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataList.map((item) => (
                        <tr key={item.id}>
                          <td className="wrap-text">{item.id}</td>
                          <td className="wrap-text">{item.name}</td>
                          <td className="wrap-text">{item.digest}</td>
                          <td className="wrap-text">{item.mime_type}</td>
                          <td className="wrap-text">{item.classname}</td>
                          <td className="wrap-text">{item.extension}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

const SpinnerComponent = () => (
  <div className="text-center my-5">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

export default AllWithSecureData;
