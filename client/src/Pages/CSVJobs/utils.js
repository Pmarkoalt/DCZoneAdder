import axios from 'axios';
import io from 'socket.io-client';
import fileDownload from 'js-file-download';

export async function createCSVJob(jobType, data, meta, context) {
  const params = {
    type: jobType,
    data: data,
    meta: {
      export_file_name: meta.exportFileName,
      csv_export_fields: meta.csvExportFields,
    },
    context,
  };
  const resp = await axios.post('/api/csv-jobs', params);
  return resp.data;
}

export async function createJobFromSocket(socket, jobType, data, meta, context) {
  return new Promise((resolve, reject) => {
    try {
      const params = {
        type: jobType,
        data: data,
        meta: {
          export_file_name: meta.exportFileName,
          csv_export_fields: meta.csvExportFields,
        },
        context,
      };
      socket.emit('create-csv-job', params, (resp) => {
        socket.disconnect();
        if (resp.error) return reject(resp.error);
        return resolve(resp.data);
      });
    } catch (e) {
      console.log(e);
      socket.disconnect();
      reject(e.toString ? e.toString() : e);
    }
  });
}

export async function listJobs(_jobType) {
  const jobType = _jobType === 'All' ? undefined : _jobType;
  const resp = await axios.get('/api/csv-jobs', {
    params: {jobType},
  });
  return resp.data;
}

export async function getJob(id) {
  const resp = await axios.get(`/api/csv-jobs/${id}/`);
  return resp.data;
}

export async function getJobTaskResults(id, failed = false, {start = 0, limit = 10} = {}) {
  const resp = await axios.get(`/api/csv-jobs/${id}/${failed ? 'failed' : 'succeeded'}`, {
    params: {start, limit},
  });
  return resp.data;
}

export function deleteJob(id) {
  return axios.delete(`/api/csv-jobs/${id}/`);
}

export async function fetchOpenDataDCData(ssl, address) {
  const resp = await axios.get('/api/open-data/', {
    params: {ssl, address},
  });
  return resp.data;
}

export async function downloadJobCSV(id, filename = 'export.csv') {
  const resp = await axios.get(`/api/csv-jobs/${id}/download`);
  const _filename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  fileDownload(resp.data, _filename);
}

export async function downloadFilteredJobResultsCSV(id, filename = 'export.csv') {
  const resp = await axios.get(`/api/csv-jobs/${id}/download?useFilter=true`);
  const _filename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  fileDownload(resp.data, `${_filename.replace('.csv', '')} (filtered).csv`);
}

export async function downloadFailedJobCSV(id, filename = 'export.csv') {
  const resp = await axios.get(`/api/csv-jobs/${id}/failed/csv`);
  const _filename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  fileDownload(resp.data, `${_filename.replace('.csv', '')} (failed).csv`);
}

export async function downloadJobCSVFromSocket(id, filename = 'export.csv') {
  const socket = io.connect();
  return new Promise((resolve, reject) => {
    try {
      socket.emit('download-csv-job-result', id, (data) => {
        const _filename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
        fileDownload(data, _filename);
        resolve();
        socket.disconnect();
      });
    } catch (e) {
      socket.disconnect();
      reject(e);
    }
  });
}

export async function downloadLeadsZip(id, filename = 'export.csv') {
  const resp = await axios.get(`/api/csv-jobs/${id}/leads`, {responseType: 'arraybuffer'});
  const _filename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  fileDownload(resp.data, `${_filename.replace('.csv', '')} (leads).zip`);
}

export function formatDate(date) {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  date = new Date(date);
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const hour = date.getHours();
  const minutes = date.getMinutes();

  return `${day} ${monthNames[monthIndex]} ${year}, ${hour}:${minutes}`;
}

export const getJobTypeAvatarMeta = (jobType) => {
  const config = {
    zone: ['Z', 'lightcoral'],
    tpsc: ['S', 'lightskyblue'],
    belles: ['B', 'mediumaquamarine'],
    'open-data-dc': ['O', 'orchid'],
  };
  return config[jobType] || ['X', 'gray'];
};
