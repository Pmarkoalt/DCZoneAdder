import axios from "axios";
import fileDownload from 'js-file-download';

export function processCsv(csv_array, exportFileName){
    const params = {
        csv_array,
        export_file_name: exportFileName,
    }
    return axios.post('/api/process-tpsc-csv', params)
        .then((response)=> {
            let filename = exportFileName || "export.csv";
            filename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
            fileDownload(response.data, filename);
            return response;
        })
}

export function downloadCurrentCsv(csv_array, filename=`processed-properties-${createDate()}.csv`){
    return axios.post('/api/downloadPropertyCsv', csv_array)
    .then((response)=> {
        const _filename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
        fileDownload(response.data, _filename);
        return {success: true, message: 'File download initialized'};
    })
    .catch((err) => {
        console.log(err);
        return {success: false, message: err};
    });
}

export function fetchCurrentJob(job_id) {
    return axios.get(`/api/addressByJobId/${job_id}`)
    .then((response) => {
        return response.data;
    })
}

export function downloadSelectedCsv(index){
    return axios.get(`/api/downloadCsv/${index}`)
    .then((response)=> {
        return response.data;
    })
    .catch((err) => {
        console.log(err);
        return err;
    });
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