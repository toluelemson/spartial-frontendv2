import React, { useState, FC, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import WithSecureModelList from "./ModelList/WithSecureModelList";
import MedicalModelList from "./ModelList/MedicalModelList";
import NetworkTrafficModelList from "./ModelList/NetworkTrafficModelList";

const AllModelList: FC = () => {
  const { ac: routeModelId }: Record<string, string | undefined> =
    useParams<Record<string, string | undefined>>();

  const [filterPrefix, setFilterPrefix] = useState<string>(routeModelId || "");

  return (
    <Container fluid>
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
            <option value="ac">Network Traffic</option>
            <option value="ma">Medical</option>
            <option value="ws">WithSecure</option>
          </Form.Select>
        </Form.Group>
      </Form>

      {filterPrefix === "ma" && <MedicalModelList models={null} />}
      {filterPrefix === "ac" && <NetworkTrafficModelList models={null} />}
      {filterPrefix === "ws" && <WithSecureModelList models={null} />}
    </Container>
  );
};

export default AllModelList;
