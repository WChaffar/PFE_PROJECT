import axios from "axios";
import { base_url, getConfig } from "../config/axiosConfig";

// Generate project report
const generateProjectReport = async (projectId, format) => {
  return axios
    .get(base_url + `reports/project/${projectId}?format=${format}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

// Generate bulk projects report
const generateBulkReport = async (format, projectIds = null) => {
  const params = projectIds ? { projectIds: projectIds.join(',') } : {};
  return axios
    .get(base_url + `reports/bulk?format=${format}`, {
      ...getConfig(),
      params
    })
    .then((response) => {
      return response.data;
    });
};

// Download report file
const downloadReport = async (reportId) => {
  return axios
    .get(base_url + `project/report/download/${reportId}`, {
      ...getConfig(),
      responseType: 'blob'
    })
    .then((response) => {
      return response.data;
    });
};

// Get report generation status
const getReportStatus = async (reportId) => {
  return axios
    .get(base_url + `project/report/status/${reportId}`, getConfig())
    .then((response) => {
      return response.data;
    });
};

const ReportService = {
  generateProjectReport,
  generateBulkReport,
  downloadReport,
  getReportStatus,
};

export default ReportService;