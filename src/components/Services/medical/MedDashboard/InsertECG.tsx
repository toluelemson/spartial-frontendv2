import React, {useState} from "react";
import {Container, Form, Button, Col, Row} from "react-bootstrap";
import {
    visualizeECG,
    descriptionECGSignal,
    descriptionTickImportance,
    descriptionTimeImportance,
    descriptionLeadImportance,
} from "../../../../api";
import {useRoleContext, Role} from "../../../RoleProvider/RoleContext";

interface InsertECGProps {
    modelId: string;
    // setActiveTab: (tab: string) => void;
    setAnalyzeData: (data: {
        result1: string | null;
        explanations: { [key: string]: string };
        allResponses: { [key: string]: string }[];
    }) => void;
}

export const InsertECG: React.FC<InsertECGProps> = ({
                                                        modelId,
                                                        // setActiveTab,
                                                        setAnalyzeData,
                                                    }) => {
    const [formData, setFormData] = useState({
        dat: "",
        hea: "",
        cut_classification_window: "--",
    });
    const {roles, userRole} = useRoleContext();
    const [loading, setLoading] = useState(false);
    const [result1, setResult1] = useState<string | null>(null);
    const [explanations, setExplanations] = useState<{ [key: string]: string }>(
        {}
    );
    // const { roles, setCurrentService, userRole } = useRoleContext();

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const {name, value} = e.target;
        setFormData((prevData) => ({...prevData, [name]: value}));
    };

    const stripPrefix = (id: string) => {
        const prefixMatch = id.match(/^[a-z]+-/);
        return prefixMatch ? id.replace(prefixMatch[0], "") : id;
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
                const strippedModelId = stripPrefix(modelId);
                const submissionData = {...formData, modelId: strippedModelId};
                const imageUrl1 = URL.createObjectURL(response1);

                setResult1(imageUrl1);

                // Fetch descriptions for each role
                const rolePromises = roles.map((role) =>
                    descriptionECGSignal(role, formData.cut_classification_window)
                        .then((response) => {
                            if (response) {
                                return {[role]: response.description};
                            } else {
                                console.error(
                                    `Invalid response format for ${role} description`
                                );
                                return {[role]: "No description available"};
                            }
                        })
                        .catch((error) => {
                            console.error(`Error fetching ${role} description:`, error);
                            return {[role]: "Error fetching description"};
                        })
                );

                // Fetch additional descriptions for each role
                const additionalPromises = roles.flatMap((role) => [
                    descriptionTickImportance(formData.cut_classification_window, role)
                        .then((response) => {
                            if (response) {
                                return {[`${role}_tickImportance`]: response.description};
                            } else {
                                console.error(
                                    `Invalid response format for ${role} tick importance`
                                );
                                return {
                                    [`${role}_tickImportance`]: "No description available",
                                };
                            }
                        })
                        .catch((error) => {
                            console.error(
                                `Error fetching ${role} tick importance description:`,
                                error
                            );
                            return {
                                [`${role}_tickImportance`]: "Error fetching description",
                            };
                        }),
                    descriptionTimeImportance(formData.cut_classification_window, role)
                        .then((response) => {
                            if (response) {
                                return {[`${role}_timeImportance`]: response.description};
                            } else {
                                console.error(
                                    `Invalid response format for ${role} time importance`
                                );
                                return {
                                    [`${role}_timeImportance`]: "No description available",
                                };
                            }
                        })
                        .catch((error) => {
                            console.error(
                                `Error fetching ${role} time importance description:`,
                                error
                            );
                            return {
                                [`${role}_timeImportance`]: "Error fetching description",
                            };
                        }),
                    descriptionLeadImportance(formData.cut_classification_window, role)
                        .then((response) => {
                            if (response) {
                                return {[`${role}_leadImportance`]: response.description};
                            } else {
                                console.error(
                                    `Invalid response format for ${role} lead importance`
                                );
                                return {
                                    [`${role}_leadImportance`]: "No description available",
                                };
                            }
                        })
                        .catch((error) => {
                            console.error(
                                `Error fetching ${role} lead importance description:`,
                                error
                            );
                            return {
                                [`${role}_leadImportance`]: "Error fetching description",
                            };
                        }),
                ]);

                // Combine all promises
                const promises = rolePromises.concat(additionalPromises);

                const descriptions = await Promise.all(promises);
                console.log("descriptions", descriptions);
                const explanationsObject = descriptions.reduce(
                    (acc, curr) => ({...acc, ...curr}),
                    {}
                );

                setAnalyzeData({
                    result1: imageUrl1,
                    explanations: explanationsObject,
                    allResponses: descriptions,
                });
                // setActiveTab("tab3"); // Navigate to the Analyze tab
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
            <div className="container">
                {/* <div className="row">
          <div className="col-6 "> */}
                <div className="border p-3">
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-gray">Insert ECG Data</h2>
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
                    {/* </div> */}
                    {/* </div> */}
                    {/* <div className="col-6 "> */}
                    {/* {result1 && (
              <div className="border p-3">
                <h2>ECG Plot:</h2>
                <img
                  src={result1}
                  width="500"
                  height="250"
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
            )} */}
                    {/* </div> */}
                </div>
            </div>
        </>
    );
};

export default InsertECG;
