import axios from "axios";
import fileDownload from 'js-file-download';

export function downloadCsvById(job_id, fileName = `processed-properties-${job_id}.csv`){
    return axios.get(`/api/downloadCsvById/${job_id}`)
    .then((response)=> {
        fileDownload(response.data, fileName)
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

export function deleteJob(jobId) {
    return axios.delete(`/api/jobs/${jobId}`)
    .then((response) => {
        return response.data;
    })
}

// function createDate() {
//     var d = new Date(),
//         month = '' + (d.getMonth() + 1),
//         day = '' + d.getDate(),
//         year = d.getFullYear(),
//         hour = d.getHours(),
//         min = d.getMinutes();


//     if (month.length < 2) 
//         month = '0' + month;
//     if (day.length < 2) 
//         day = '0' + day;

//     return [year, month, day, hour, min].join('-');
// }