const initialState = {
  reports: [],
  currentReport: null,
  loading: false,
  error: null,
  reportStatus: {},
  generationProgress: {},
};

const reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GENERATE_PROJECT_REPORT_START":
      return {
        ...state,
        loading: true,
        error: null,
        generationProgress: {
          ...state.generationProgress,
          [`${action.payload.projectId}-${action.payload.format}`]: true,
        },
      };

    case "GENERATE_PROJECT_REPORT_SUCCESS":
      return {
        ...state,
        loading: false,
        reports: [...state.reports, action.payload.data],
        generationProgress: {
          ...state.generationProgress,
          [`${action.payload.projectId}-${action.payload.format}`]: false,
        },
        error: null,
      };

    case "GENERATE_PROJECT_REPORT_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        generationProgress: {},
      };

    case "GENERATE_BULK_REPORT_START":
      return {
        ...state,
        loading: true,
        error: null,
        generationProgress: {
          ...state.generationProgress,
          [`bulk-${action.payload.format}`]: true,
        },
      };

    case "GENERATE_BULK_REPORT_SUCCESS":
      return {
        ...state,
        loading: false,
        reports: [...state.reports, action.payload.data],
        generationProgress: {
          ...state.generationProgress,
          [`bulk-${action.payload.format}`]: false,
        },
        error: null,
      };

    case "GENERATE_BULK_REPORT_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
        generationProgress: {},
      };

    case "DOWNLOAD_REPORT_START":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "DOWNLOAD_REPORT_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
      };

    case "DOWNLOAD_REPORT_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case "GET_REPORT_STATUS_SUCCESS":
      return {
        ...state,
        reportStatus: {
          ...state.reportStatus,
          [action.payload.reportId]: action.payload.data,
        },
        error: null,
      };

    case "GET_REPORT_STATUS_FAILURE":
      return {
        ...state,
        error: action.payload,
      };

    case "RESET_REPORT_STATE":
      return {
        ...state,
        reports: [],
        currentReport: null,
        loading: false,
        error: null,
        reportStatus: {},
        generationProgress: {},
      };

    default:
      return state;
  }
};

export default reportReducer;