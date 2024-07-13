import React, {useState, FC, useEffect} from 'react';
import {Container, Form} from 'react-bootstrap';
import {useParams} from 'react-router-dom';

import MedicalModelList from './ModelList/MedicalModelList';
import NetworkTrafficModelList from './ModelList/NetworkTrafficModelList';

const AllModelList: FC = () => {
    const {ac: routeModelId}: Record<string, string | undefined> = useParams<Record<string, string | undefined>>();

    const [filterPrefix, setFilterPrefix] = useState<string>(routeModelId || '');

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
                    </Form.Select>
                </Form.Group>
            </Form>

            {filterPrefix === 'ma' && <MedicalModelList/>}
            {filterPrefix === 'ac' && <NetworkTrafficModelList models={null}/>}
        </Container>
    );
};

export default AllModelList;
