import React, {useState, useEffect} from 'react';
import {Container, Row, Col, Form, Accordion, InputGroup, Button, Spinner} from 'react-bootstrap';
import useWithSecureDatasetAPI from '../../../Datasets/useFetchWithSecureData';
import {withSecureAttack} from '../../../../api';
import {TODO} from '../../../../types/types';
import CheckAttackStatusUtil from '../../../util/CheckAttackStatus';


interface AttackParams {
    targeted: boolean;
    confidence: number;
    learning_rate: number;
    max_iter: number;
    binary_search_steps: number;
    initial_const: number;
    abort_early: boolean;
    use_resize: boolean;
    use_importance: boolean;
    nb_parallel: number;
    variable_h: number;
    verbose: boolean;
    norm: number;
}

interface Attack {
    classname: string;
    params: AttackParams;
    metrics_collector_kwargs: {
        measure_every: number;
    };
    maldoc?: boolean;
}

interface FormDataState {
    attackType: string;
    experimentName: string;
    model: object | string;
    data: string;
    constraints: {
        clip_min?: number;
        clip_max?: number;
        df?: string;
    };
    random_seed: number;
    num_examples: number;
    attacks: Attack[];
}

interface InputState {
    modelId: string;
}

const AdversarialAttacksForm: React.FC<InputState> = ({modelId}) => {
    const [attackType, setAttackType] = useState<string>('');
    const [jsonUploaded, setJsonUploaded] = useState(false);
    const [uploadedJsonData, setUploadedJsonData] = useState<TODO | null>(null);
    const {dataList, loading, error} = useWithSecureDatasetAPI();

    const [attackId, setAttackId] = useState('')

    const defaultFormData: FormDataState = {
        experimentName: '',
        model: {id: modelId},
        data: '',
        constraints: {
            clip_min: 0,
            clip_max: 0,
        },
        random_seed: 0,
        num_examples: 0,
        attacks: [
            {
                classname: '',
                params: {
                    targeted: false,
                    confidence: 0,
                    learning_rate: 0,
                    max_iter: 0,
                    binary_search_steps: 0,
                    initial_const: 0,
                    abort_early: false,
                    use_resize: false,
                    use_importance: false,
                    nb_parallel: 0,
                    variable_h: 0,
                    verbose: false,
                    norm: 0,
                },
                metrics_collector_kwargs: {
                    measure_every: 0,
                },
                maldoc: false,
            },
        ],
        attackType: '',
    };

    const diApkFormData: FormDataState = {
        experimentName: '',
        model: modelId,
        data: '',
        constraints: {
            df: '',
        },
        random_seed: 42,
        num_examples: 2,
        attacks: [
            {
                classname: '',
                params: {
                    targeted: false,
                    confidence: 0,
                    learning_rate: 0,
                    max_iter: 0,
                    binary_search_steps: 2,
                    initial_const: 0,
                    abort_early: true,
                    use_resize: false,
                    use_importance: false,
                    nb_parallel: 1,
                    variable_h: 0,
                    verbose: true,
                    norm: 2,
                },
                metrics_collector_kwargs: {
                    measure_every: 50,
                },
            },
        ],
        attackType: '',
    };


    const [formData, setFormData] = useState<FormDataState>(defaultFormData);
    const {updateAttackStatus} = CheckAttackStatusUtil(attackId);
    const [isPending, setIsPending] = useState(false)

    console.log(isPending)
    useEffect(() => {
        if (uploadedJsonData && attackType === uploadedJsonData.attackType) {
            const {attackType, ...rest} = uploadedJsonData;
            setFormData(rest as FormDataState);
            setJsonUploaded(true);
        } else {
            setJsonUploaded(false);
        }
    }, [attackType, uploadedJsonData, formData.data]);

    useEffect(() => {
        setFormData((prevState) => ({
            ...prevState,
            model: {
                id: modelId.substring(3),
            },
            data: formData.data,
        }));
    }, [attackType, uploadedJsonData, formData.data]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                try {
                    const jsonData = JSON.parse(content);
                    setUploadedJsonData(jsonData);
                    if (dataList.some((item) => item.id === jsonData.data)) {
                        setFormData((prevState) => ({
                            ...jsonData,
                            data: jsonData.data,
                        }));
                        setJsonUploaded(true);
                    } else {
                        setJsonUploaded(false);
                    }
                } catch (error) {
                    console.error('Invalid JSON file');
                    setJsonUploaded(false);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        const [mainKey, subKey] = name.split('.') as [keyof FormDataState, string | undefined];

        if (subKey) {
            setFormData((prevState) => ({
                ...prevState,
                [mainKey]: {
                    ...((prevState[mainKey] as any) || {}),
                    [subKey]: type === 'checkbox' ? checked : value,
                },
            }));
        } else {
            setFormData((prevState) => ({
                ...prevState,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const {name, value} = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
        if (name === 'attackType') {
            setAttackType(value);
            if (value === 'di-apk') {
                setFormData(diApkFormData);
            } else {
                setFormData(defaultFormData);
            }
        }
    };

    const handleAttackParamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;
        setFormData((prevState) => ({
            ...prevState,
            attacks: [
                {
                    ...prevState.attacks[0],
                    params: {
                        ...prevState.attacks[0].params,
                        [name]: type === 'checkbox' ? checked : Number(value),
                    },
                },
            ],
        }));
    };

    const handleMaldocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {checked} = e.target;
        setFormData((prevState) => ({
            ...prevState,
            attacks: [
                {
                    ...prevState.attacks[0],
                    maldoc: checked,
                },
            ],
        }));
    };

    const callApi = async () => {
        try {
            setIsPending(true)
            const {id} = await withSecureAttack(formData)
            console.log(id)
            setAttackId(id)
            console.log(id)
            updateAttackStatus();
        } catch (error) {
            console.error('Error calling API:', error);
        } finally {
            setIsPending(false)
        }
    };

    return (
        <Container className="mt-4">
            <Form>
                <Row className="mb-3">
                    <Col md={10} lg={8}>
                        <Form.Group as={Row} className="mb-3">
                            <InputGroup>
                                <InputGroup.Text>Attack Type:</InputGroup.Text>
                                <Form.Select name="attackType" onChange={handleSelectChange} value={attackType}>
                                    <option value="">Choose an attack type</option>
                                    <option value="maldoc">Maldoc</option>
                                    <option value="di-apk">di-apk</option>
                                </Form.Select>
                            </InputGroup>
                        </Form.Group>
                    </Col>
                    <Col md={12} className="d-flex align-items-end">
                        <Form.Group controlId="formFileUpload" className="mb-3">
                            <Form.Control
                                required
                                type="file"
                                accept=".json"
                                onChange={handleFileUpload}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={12}>
                        {jsonUploaded && (
                            <Form.Group as={Row} className="mb-3">
                                <InputGroup>
                                    <InputGroup.Text>Choose Dataset:</InputGroup.Text>
                                    <Form.Select
                                        required
                                        name="data"
                                        value={formData.data}
                                        onChange={handleSelectChange}
                                    >
                                        <option value="">Choose a dataset</option>
                                        {dataList
                                            .filter(item => item.name.includes('attack'))
                                            .map((item) => (
                                                <option key={item.id} value={item.id}>{item.id} - {item.name}</option>
                                            ))}
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        )}
                    </Col>
                    <Col md={12}>
                        {jsonUploaded && attackType === 'di-apk' && (
                            <Form.Group as={Row} className="mb-3">
                                <InputGroup>
                                    <InputGroup.Text>Choose Constraint Dataset:</InputGroup.Text>
                                    <Form.Select
                                        required
                                        name="data"
                                        value={formData.constraints.df}
                                        onChange={handleSelectChange}
                                    >
                                        <option value="">Choose a dataset</option>
                                        {dataList
                                            .filter(item => item.name.includes('constraints'))
                                            .map((item) => (
                                                <option key={item.id} value={item.id}>{item.id} - {item.name}</option>
                                            ))}

                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        )}
                    </Col>
                </Row>

                {!jsonUploaded && (
                    <h2>Uploaded JSON does not match the attack type or the dataset ID is not in the list</h2>
                )}

                {jsonUploaded && (
                    <>
                        <Accordion defaultActiveKey="0">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Experiment Details</Accordion.Header>
                                <Accordion.Body>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group controlId="formModelId">
                                                <Form.Label>Model ID</Form.Label>
                                                <Form.Control
                                                    disabled
                                                    type="text"
                                                    name="model"
                                                    value={modelId.substring(3)}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Group controlId="formDataId">
                                                <Form.Label>Data ID</Form.Label>
                                                <Form.Control
                                                    required
                                                    disabled
                                                    type="text"
                                                    name="data"
                                                    value={formData.data}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>

                                        {attackType === 'maldoc' && (
                                            <Col md={4}>
                                                <Form.Group controlId="formClipMin">
                                                    <Form.Label>Clip Min</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="constraints.clip_min"
                                                        value={formData.constraints.clip_min}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        )}
                                    </Row>

                                    <Row className="mb-3">
                                        {attackType === 'maldoc' && (
                                            <Col md={4}>
                                                <Form.Group controlId="formClipMax">
                                                    <Form.Label>Clip Max</Form.Label>
                                                    <Form.Control
                                                        type="number"
                                                        name="constraints.clip_max"
                                                        value={formData.constraints.clip_max}
                                                        onChange={handleChange}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        )}
                                        {attackType === 'di-apk' && (
                                            <Col md={4}>
                                                <Form.Group controlId="formDf">
                                                    <Form.Label>DF</Form.Label>
                                                    <Form.Control
                                                        disabled
                                                        type="text"
                                                        name="constraints.df"
                                                        value={formData.constraints.df}
                                                        readOnly
                                                    />
                                                </Form.Group>
                                            </Col>
                                        )}
                                        <Col md={4}>
                                            <Form.Group controlId="formRandomSeed">
                                                <Form.Label>Random Seed</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="random_seed"
                                                    value={formData.random_seed}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formNumExamples">
                                                <Form.Label>Number of Examples</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="num_examples"
                                                    value={formData.num_examples}
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="3">
                                <Accordion.Header>Basic Parameters</Accordion.Header>
                                <Accordion.Body>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group controlId="formAttackClassname">
                                                <Form.Label>Attack Name</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="classname"
                                                    value={formData.attacks[0].classname}
                                                    onChange={handleChange}
                                                    readOnly
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formConfidence">
                                                <Form.Label>Confidence</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="confidence"
                                                    value={formData.attacks[0].params.confidence}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formLearningRate">
                                                <Form.Label>Learning Rate</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="learning_rate"
                                                    value={formData.attacks[0].params.learning_rate}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="formTargeted">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="targeted"
                                                    label="Targeted"
                                                    checked={formData.attacks[0].params.targeted}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="formMaldoc">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="maldoc"
                                                    label="Maldoc"
                                                    checked={formData.attacks[0].maldoc}
                                                    onChange={handleMaldocChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="4">
                                <Accordion.Header>Advanced Parameters</Accordion.Header>
                                <Accordion.Body>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group controlId="formMaxIter">
                                                <Form.Label>Max Iterations</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="max_iter"
                                                    value={formData.attacks[0].params.max_iter}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formBinarySearchSteps">
                                                <Form.Label>Binary Search Steps</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="binary_search_steps"
                                                    value={formData.attacks[0].params.binary_search_steps}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formInitialConst">
                                                <Form.Label>Initial Const</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="initial_const"
                                                    value={formData.attacks[0].params.initial_const}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row className="mb-3">
                                        <Col md={4}>
                                            <Form.Group controlId="formNbParallel">
                                                <Form.Label>Nb Parallel</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="nb_parallel"
                                                    value={formData.attacks[0].params.nb_parallel}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formVariableH">
                                                <Form.Label>Variable H</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="variable_h"
                                                    value={formData.attacks[0].params.variable_h}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group controlId="formNorm">
                                                <Form.Label>Norm</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name="norm"
                                                    value={formData.attacks[0].params.norm}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="formAbortEarly">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="abort_early"
                                                    label="Abort Early"
                                                    checked={formData.attacks[0].params.abort_early}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="formUseResize">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="use_resize"
                                                    label="Use Resize"
                                                    checked={formData.attacks[0].params.use_resize}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="formUseImportance">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="use_importance"
                                                    label="Use Importance"
                                                    checked={formData.attacks[0].params.use_importance}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={12}>
                                            <Form.Group controlId="formVerbose">
                                                <Form.Check
                                                    type="checkbox"
                                                    name="verbose"
                                                    label="Verbose"
                                                    checked={formData.attacks[0].params.verbose}
                                                    onChange={handleAttackParamChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    </>
                )}

                <Button className="mt-3" onClick={callApi}>
                    {isPending ? 'Performing Attack...' : 'Perform Attack'}
                    {isPending && (
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="ms-2"
                        />
                    )}
                </Button>
            </Form>
        </Container>
    );
};

export default AdversarialAttacksForm;
