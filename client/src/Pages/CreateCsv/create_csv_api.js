import axios from "axios";

export function convertCsv(csv_array){
    return axios.post('http://localhost:5000/api/convertCsv', csv_array)
    .then((response)=> {
        return response.data;
    })
    .catch((err) => {
        console.log(err);
        return err;
    });
}