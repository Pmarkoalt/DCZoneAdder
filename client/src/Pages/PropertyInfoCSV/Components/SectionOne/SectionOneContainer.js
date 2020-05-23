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
      this.createFile = this.createFile.bind(this);
      this.handleExportFileNameChange = this.handleExportFileNameChange.bind(this);
    }
    componentDidMount(){
  
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
              <div id="submit-file-container">
                <label className="export-filename">
                  <span>CSV Export Filename:</span>
                  <input type="text" onChange={this.handleExportFileNameChange} />
                </label>
                <Button className="section-one-button" variant="contained" disabled={!this.state.valid} color="primary" onClick={() => {this.props.submitCSV(this.state.files, this.state.exportFileName)}}>
                  Continue
                </Button>
              </div>
            </div>
        )
    }
}

export default SectionOneContainer;