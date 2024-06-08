import React, { ChangeEvent, FormEvent, useState } from "react";

interface FileUploadProps {
    onFileUpload: (files: File[] | File) => void;
    onFileSubmit: (formData: FormData) => Promise<string | any>;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, onFileSubmit }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (selectedFiles.length === 0) {
            setError('Please select files to upload.');
            return;
        }


        setError(null);

        try {
            await Promise.all(
                selectedFiles.map(async (file: File) => {
                    const formData = new FormData();
                    formData.append('file', file);
                    return onFileSubmit(formData);
                })
            );
        } catch (error: any) {
            setError('Error processing your request. Please try again.');
            console.error(error);
        } finally {

        }
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const filesArray = Array.from(event.target.files);
            setSelectedFiles(filesArray);
            onFileUpload(filesArray);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label htmlFor="fileUpload" className="form-label">Upload Files</label>
                   {error && <div className="alert alert-danger mt-3" role="alert">{error}</div>}
                <input type="file" className="form-control" id="fileUpload" onChange={handleFileChange} multiple />
            </div>

        </form>
    );
};

export default FileUpload;
