import reportService from "../services/reportService";

// Generate project report
export const generateProjectReport = (projectId, format) => async (dispatch) => {
  try {
    dispatch({
      type: "GENERATE_PROJECT_REPORT_START",
      payload: { projectId, format },
    });

    const data = await reportService.generateProjectReport(projectId, format);
    
    dispatch({
      type: "GENERATE_PROJECT_REPORT_SUCCESS",
      payload: { data, projectId, format },
    });
    
    return { success: true, data };
  } catch (error) {
    dispatch({
      type: "GENERATE_PROJECT_REPORT_FAILURE",
      payload: error?.response?.data?.message || "Generate project report failed",
    });
    return { success: false, error: error?.response?.data?.message };
  }
};

// Generate bulk reports
export const generateBulkReport = (format, projectIds = null) => async (dispatch) => {
  try {
    dispatch({
      type: "GENERATE_BULK_REPORT_START",
      payload: { format, projectIds },
    });

    const data = await reportService.generateBulkReport(format, projectIds);
    
    dispatch({
      type: "GENERATE_BULK_REPORT_SUCCESS",
      payload: { data, format, projectIds },
    });
    
    return { success: true, data };
  } catch (error) {
    dispatch({
      type: "GENERATE_BULK_REPORT_FAILURE",
      payload: error?.response?.data?.message || "Generate bulk report failed",
    });
    return { success: false, error: error?.response?.data?.message };
  }
};

// Download report
export const downloadReport = (reportId) => async (dispatch) => {
  try {
    dispatch({
      type: "DOWNLOAD_REPORT_START",
      payload: { reportId },
    });

    const blob = await reportService.downloadReport(reportId);
    
    dispatch({
      type: "DOWNLOAD_REPORT_SUCCESS",
      payload: { reportId },
    });
    
    return { success: true, blob };
  } catch (error) {
    dispatch({
      type: "DOWNLOAD_REPORT_FAILURE",
      payload: error?.response?.data?.message || "Download report failed",
    });
    return { success: false, error: error?.response?.data?.message };
  }
};

// Get report status
export const getReportStatus = (reportId) => async (dispatch) => {
  try {
    const data = await reportService.getReportStatus(reportId);
    
    dispatch({
      type: "GET_REPORT_STATUS_SUCCESS",
      payload: { data, reportId },
    });
    
    return { success: true, data };
  } catch (error) {
    dispatch({
      type: "GET_REPORT_STATUS_FAILURE",
      payload: error?.response?.data?.message || "Get report status failed",
    });
    return { success: false, error: error?.response?.data?.message };
  }
};

// Reset report state
export const resetReportState = () => async (dispatch) => {
  dispatch({
    type: "RESET_REPORT_STATE",
  });
};