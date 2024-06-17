import Papa from 'papaparse';
import { requestViewModelDatasets, requestViewPoisonedDatasets } from "../../api";

// Define the structure of the data model
interface DataModel {
    resultData: string[];
}

// Function to parse CSV data string using PapaParse
async function fetchCSVData(csvDataString: string): Promise<DataModel> {
    return new Promise<DataModel>((resolve, reject) => {
        Papa.parse<string>(csvDataString, {
            complete: (result) => {
                if (result.data.length === 0) {
                    resolve({ resultData: [] });
                } else if (Array.isArray(result.data)) {
                    resolve({ resultData: result.data as string[] });
                } else {
                    reject(new Error('Error parsing data'));
                }
            },
            header: true,
        });
    });
}

// Function to fetch the original dataset
async function fetchOriginalDataset(modelId: string): Promise<string> {
    try {
        return await requestViewModelDatasets(modelId, "train");
    } catch (error) {
        throw new Error('Error fetching original dataset');
    }
}

// Function to fetch the poisoned dataset
async function fetchPoisonedDataset(modelId: string, attackType?: string): Promise<string> {
    try {
        return await requestViewPoisonedDatasets(modelId, attackType || '');
    } catch (error) {
        throw new Error('Error fetching poisoned dataset');
    }
}

// Function to fetch datasets based on whether poisoned data is requested
async function fetchDataset(
    isPoisoned: boolean,
    modelId: string,
    attackType?: string
): Promise<{
    originalDataset: DataModel,
    poisonedDataset: DataModel,
    error: Error | null,
    loading: boolean
}> {
    // Initialize the dataset structures and loading state
    let originalDataset: DataModel = { resultData: [] };
    let poisonedDataset: DataModel = { resultData: [] };
    let error: Error | null = null;
    let loading: boolean = true;

    try {
        if (isPoisoned) {
            if (!attackType) {
                throw new Error('attackType must be provided when fetching poisoned data');
            }
            const csvPoisonedDataString = await fetchPoisonedDataset(modelId, attackType);
            poisonedDataset = await fetchCSVData(csvPoisonedDataString);
        } else {
            const csvNormalDataString = await fetchOriginalDataset(modelId);
            originalDataset = await fetchCSVData(csvNormalDataString);
        }
    } catch (err) {
        // Handle any errors that occur during fetching or parsing
        error = err instanceof Error ? err : new Error('An error occurred while fetching data');
    } finally {
        // Set loading to false once the operation is complete
        loading = false;
    }

    // Return the results of the fetch operation
    return { originalDataset, poisonedDataset, error, loading };
}

export default fetchDataset;
