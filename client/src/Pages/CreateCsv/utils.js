import axios from 'axios';
import io from "socket.io-client";
import fileDownload from 'js-file-download';

export async function downloadJobCSVFromSocket(id, filename="export.csv") {
    const socket = io.connect();
    return new Promise((resolve, reject) => {
        try {
            socket.emit("download-zone-job-result", id, (data) => {
                const _filename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
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

export async function getJob(jobId) {
    const response = await axios.get(`/api/jobs/${jobId}`);
    return response.data;
}

export async function getCompletedCount(jobId) {
    const response = await axios.get(`/api/jobs/${jobId}/completed`);
    return response.data.count;
}