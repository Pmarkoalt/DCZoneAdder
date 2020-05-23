import React, { Component } from 'react';
import FileDrop from './FileDrop';
import Button from '@material-ui/core/Button';

import './section_one.scss';




class SectionOneContainer extends Component{
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
      this.submitCSV = this.submitCSV.bind(this);
      this.closeError = this.closeError.bind(this);
    }

    closeError() {
      this.setState({error: null});
    }

    submitCSV(data, filename) {
      this.closeError();
      this.setState({valid: false});
      this.props.submitCSV(data, filename)
        .then(() => {
          this.inputRef.current.value = "";
        })
        .catch((e) => {
          this.setState({error: e.response.data});
        })
        .finally(() => {
          this.setState({files: []});
        });
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
              <h2>Please provide a CSV File</h2>
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
                <Button className="section-one-button" variant="contained" disabled={!this.state.valid} color="primary" onClick={() => {this.submitCSV(this.state.files, this.state.exportFileName)}}>
                  Continue
                </Button>
              </div>
            </div>
        )
    }
}

export default SectionOneContainer;