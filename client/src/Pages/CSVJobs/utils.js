import axios from 'axios';
import fileDownload from 'js-file-download';

export async function createCSVJob(csv_array, exportFileName) {
    const params = {
        csv_array,
        export_file_name: exportFileName,
        type: "tpsc"
    }
    const resp = await axios.post('/api/csv-jobs', params)
    const {job_id: jobId} = resp.data;
    return jobId;
}

export async function listJobs() {
    const resp = await axios.get('/api/csv-jobs');
    return resp.data;
}

export async function getJob(id) {
    const resp = await axios.get(`/api/csv-jobs/${id}/`);
    return resp.data;
}

export function deleteJob(id) {
    return axios.delete(`/api/csv-jobs/${id}/`);
}

export async function downloadJobCSV(id, filename="export.csv") {
    const response = await axios.get(`/api/csv-jobs/${id}/download`)
    const _filename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    fileDownload(response.data, _filename);
}

export function formatDate(date) {
    const monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    date = new Date(date);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minutes = date.getMinutes();
  
    return `${day} ${monthNames[monthIndex]} ${year}, ${hour}:${minutes}`;
}