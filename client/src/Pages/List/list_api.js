import axios from "axios";
import fileDownload from 'js-file-download';

export function downloadCsvById(job_id){
    return axios.get(`/api/downloadCsvById/${job_id}`)
    .then((response)=> {
        fileDownload(response.data, `processed-properties-${job_id}.csv`)
        return {success: true, message: 'File download initialized'};
    })
    .catch((err) => {
        console.log(err);
        return {success: false, message: err};
    });
}

export function findAllJobs(){
    return axios.get('/api/findAllJobs')
    .then((response) => {
        return response.data;
    })
    .catch((err) => {
        console.log(err);
        return {message: err};
    });
}

export function deleteCsvByid(job_id) {
    return axios.get(`/api/addressByJobId/${job_id}`)
    .then((response) => {
        return response.data;
    })
}

function createDate() {
    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        min = d.getMinutes();


    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day, hour, min].join('-');
}