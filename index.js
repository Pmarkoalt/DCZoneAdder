const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const csv = require('csvtojson');
const { Parser } = require('json2csv');




const app = express();

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// Set up CORS
app.use(cors());

app.post('/api/processCsv', (req, res) => {
    return res.json({data:req.body});
});

app.post('/api/downloadCsv', (req, res) => {
    const keys = Object.keys(req.body);
    const json2csvParser = new Parser({keys});
    const csv = json2csvParser.parse(req.body);
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    res.set('Content-Type', 'text/csv');
    return res.status(200).send(csv);
});

app.post('/api/downloadCsv/:id', (req, res) => {
    return res.json({message: 'Download'});
});

app.post('/api/saveCsv', (req, res) => {
    return res.json({message: 'Save Complete'});
});


// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log('App is listening on port ' + port);