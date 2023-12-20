import {AC_OUTPUT_LABELS, AD_OUTPUT_LABELS, AD_OUTPUT_LABELS_XAI} from "../../constants";
export const ConvertTimeStamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toUTCString();
};

export const isACApp = (app : string) => app === 'ac';
export const isACModel = (modelId : string) => modelId && modelId.startsWith('ac-');
export const getLabelsListApp = (app: string) => {
  return isACApp(app) ? AC_OUTPUT_LABELS : AD_OUTPUT_LABELS;
}
export const getLabelsListAppXAI = (app: string) => {
  return isACApp(app) ? AC_OUTPUT_LABELS : AD_OUTPUT_LABELS_XAI;
}
export const getLabelsListXAI = (modelId: string) => {
  return isACModel(modelId) ? AC_OUTPUT_LABELS : AD_OUTPUT_LABELS_XAI;
}