import React, { Component } from 'react';
import csvparse from 'csv-parse/lib/sync';
import FileDrop from './FileDrop';
import Button from '@material-ui/core/Button';
import {createCSVJob} from './utils';

import './styles.scss';

class CSVUpload extends Component{
    constructor(props) {
      super(props)
      this.state = {
        files: [],
        valid: false,
        exportFileName: undefined,
      }
      this.error = null;
      this.inputRef = React.createRef();
      this.createFile = this.createFile.bind(this);
      this.handleExportFileNameChange = this.handleExportFileNameChange.bind(this);
      this.createCSVJob = this.createCSVJob.bind(this);
      this.closeError = this.closeError.bind(this);
    }

    closeError() {
      this.setState({error: null});
    }

    async createCSVJob(files, filename) {
      this.closeError();
      this.setState({valid: false});
      let data = [];
      files.forEach(file => {
        const parsed = csvparse(file.data.replace(/=/g,""), {columns: true});
        data = [
          ...data,
          ...parsed
        ];
      });
      try {
        const jobId = await createCSVJob(data, filename)
        window.location.href = `/jobs/${jobId}/`;
      } catch(e) {
          const error = e.response ? e.response.data : "Error";
          this.setState({error});
      }
      this.setState({files: []});
    }

    createFile(newFile) {
        this.setState({
          ...this.state,
          files: [
            ...this.state.files,
            newFile
          ],
          valid: true
        });
    }

    handleExportFileNameChange(event) {
      this.setState({exportFileName: event.target.value});
    }

    render(){
        return(
            <div id="section-one">
              <h2>Please provide a CSV File To Create a new Job</h2>
              <FileDrop createFile={this.createFile} files={this.state.files} />
              {this.state.error && 
                <div>
                  <span className="csv-upload-error">{this.state.error}</span>
                  <span className="csv-upload-error-clear" onClick={this.closeError}>Clear</span>
                </div>
              }
              <div id="submit-file-container">
                <label className="export-filename">
                  <span>CSV Export Filename:</span>
                  <input type="text" ref={this.inputRef} onChange={this.handleExportFileNameChange} />
                </label>
                <Button className="section-one-button" variant="contained" disabled={!this.state.valid} color="primary" onClick={() => {this.createCSVJob(this.state.files, this.state.exportFileName)}}>
                  Upload
                </Button>
              </div>
            </div>
        )
    }
}

export default CSVUpload;