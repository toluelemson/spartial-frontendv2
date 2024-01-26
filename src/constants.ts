export const LOCAL_HOST = "127.0.0.1";
export const LOCAL_PORT = 31057;
export const SERVER_HOST = "193.40.154.143";
export const SERVER_PORT = 8000;
export const LOCAL_URL = `http://${LOCAL_HOST}:${LOCAL_PORT}`;
export const SERVER_URL =  `http://${SERVER_HOST}:${SERVER_PORT}`;


// BuildACPage.tsx
export const AI_MODEL_TYPES = ['Neural Network', 'XGBoost', 'LightGBM']
export const FEATURE_OPTIONS =  ['Raw']
export const AD_OUTPUT_LABELS = ["Normal traffic", "Malware traffic"];
export const AD_OUTPUT_LABELS_SHORT = ["Normal", "Malware"];
export const AD_OUTPUT_LABELS_XAI = ["", "Malware"];
export const AC_OUTPUT_LABELS = ["Web", "Interactive", "Video"];

export const HEADER_ACCURACY_STATS = ["precision", "recall", "f1score", "support"];

export const CRITERIA_LIST = [
  "Build Configuration",
  "Model Performance",
  "Confusion Matrix",
];