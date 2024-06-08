import React, { useState, FormEvent } from 'react';
import {differentialPrivacy} from "../../../api";

interface PrivacyMicroservicesFormProps {

}

interface FormState {
    clientSamplingRate: number;
    clippingValue: number;
    delta: number;
    epsilon: number;
    modelParameters1: number;
    modelParameters2: number;
    noiseType: number;
    sigma: number;
    totalFLRounds: number;
}

const PrivacyMicroservicesForm: React.FC<PrivacyMicroservicesFormProps> = () => {
    const [formState, setFormState] = useState<FormState>({
        clientSamplingRate: 0.5,
        clippingValue: 15.5,
        delta: 0.01,
        epsilon: 5,
        modelParameters1: 1,
        modelParameters2: 1,
        noiseType: 1127.0015000,
        sigma: 1.2,
        totalFLRounds: 100,
    });

    const [results, setResults] = useState<string[]>([]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        console.log(formState);
        const res = await differentialPrivacy(formState)
        console.log(res)
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Privacy Microservices Interface</h2>
            <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                    <div className="col">
                        <label htmlFor="clientSamplingRate" className="form-label">Client Sampling Rate:</label>
                        <input type="number" step="0.1"  className="form-control" id="clientSamplingRate" name="clientSamplingRate" value={formState.clientSamplingRate} onChange={handleInputChange} />

                    </div>
                    <div className="col">
                        <label htmlFor="clippingValue" className="form-label">Clipping Value:</label>
                        <input type="number" step="0.1" className="form-control" id="clippingValue" name="clippingValue" value={formState.clippingValue} onChange={handleInputChange} />
                    </div>
                    <div className="col">
                        <label htmlFor="delta" className="form-label">Delta:</label>
                        <input type="number" step="0.1" className="form-control" id="delta" name="delta" value={formState.delta} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label htmlFor="epsilon" className="form-label">Epsilon:</label>
                        <input type="number"  step="0.1" className="form-control" id="epsilon" name="epsilon" value={formState.epsilon} onChange={handleInputChange} />
                    </div>
                    <div className="col">
                        <label htmlFor="modelParameter1" className="form-label">Model Parameter 1:</label>
                        <input type="number" step="0.1" className="form-control" id="modelParameter1" name="modelParameter1" value={formState.modelParameters1} onChange={handleInputChange} />
                    </div>
                    <div className="col">
                        <label htmlFor="modelParameter2" className="form-label">Model Parameter 2:</label>
                        <input type="number" step="0.1" className="form-control" id="modelParameter2" name="modelParameter2" value={formState.modelParameters2} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col">
                        <label htmlFor="noiseType" className="form-label">Noise Type:</label>
                        <input type="number" step="0.1" className="form-control" id="noiseType" name="noiseType" value={formState.noiseType} onChange={handleInputChange} />
                    </div>
                    <div className="col">
                        <label htmlFor="sigma" className="form-label">Sigma:</label>
                        <input type="number" step="0.1" className="form-control" id="sigma" name="sigma" value={formState.sigma} onChange={handleInputChange} />
                    </div>
                    <div className="col">
                        <label htmlFor="totalFLRounds" className="form-label">Total FL Rounds:</label>
                        <input type="number" step="0.1" className="form-control" id="totalFLRounds" name="totalFLRounds" value={formState.totalFLRounds} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <button type="submit" className="btn btn-primary">Submit</button>
                    </div>
                </div>
            </form>
            <div className="row mt-4">
                <div className="col">
                    <h3>Results:</h3>
                    {results.map((result, index) => (
                        <div key={index} className="border-top pt-3">
                            {result}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrivacyMicroservicesForm;
