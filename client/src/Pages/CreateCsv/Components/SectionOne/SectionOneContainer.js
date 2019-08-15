import React, { Component, useCallback } from 'react';
import FileDrop from './FileDrop';
import ChipFilter from './ChipFilter';

import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';

import { convertCsv } from '../../create_csv_api';




class SectionOneContainer extends Component{
    constructor(props) {
      super(props)
      this.state = {
        files: [],
        chips: [],
        valid: false
      }
      this.createFile = this.createFile.bind(this);
      this.handleToggleChip = this.handleToggleChip.bind(this);
      this.handleDeleteChip = this.handleDeleteChip.bind(this);
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
    handleToggleChip(chips){
        this.setState({
          ...this.state,
          chips: chips,
          valid: true
        });
    }
    handleDeleteChip(chip) {
        const pre_array = [...this.state.chips];
        const currentIndex = this.state.chips.indexOf(chip);
        pre_array.splice(currentIndex, 1);
        this.setState({
          ...this.state.chips,
          chips: pre_array,
        });
    }

    render(){
        return(
            <div id="section-one">
              <FileDrop createFile={this.createFile} files={this.state.files} />
              <ChipFilter handleToggleChip={this.handleToggleChip} handleDeleteChip={this.handleDeleteChip} chips={this.state.chips}/>
              <div id="submit-file-container">
                {this.state.valid ? 
                  <Button className="section-one-button" variant="contained" color="primary" onClick={() => {this.props.submitCSV(this.state.files)}}>
                    Submit
                  </Button>
                  :
                  <Button className="section-one-button" variant="contained" disabled color="primary">
                    Submit
                  </Button>
                }
              </div>
            </div>
        )
    }
}

export default SectionOneContainer;