import axios from "axios";
import fileDownload from 'js-file-download';

export function processCsv(csv_array, filter){
    const params = {
        csv_array,
        filter
    }
    return axios.post('/api/processCsv', params)
    .then((response)=> {
        return response.data;
    })
    .catch((err) => {
        console.log(err);
        return [{id: 0, error: "Unknown Error Occured on backend. Please contact System Admin"}];
    });
}

export function saveCsv(csv_array){
    return axios.post('/api/saveCsv', csv_array)
    .then((response)=> {
        return 'success';
    })
    .catch((err) => {
        console.log(err);
        return err;
    });
}

export function downloadCurrentCsv(csv_array){
    return axios.post('/api/downloadCsv', csv_array)
    .then((response)=> {
        const date = createDate();
        fileDownload(response.data, `processed-properties-${date}.csv`)
        return {success: true, message: 'File download initialized'};
    })
    .catch((err) => {
        console.log(err);
        return {success: false, message: err};
    });
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