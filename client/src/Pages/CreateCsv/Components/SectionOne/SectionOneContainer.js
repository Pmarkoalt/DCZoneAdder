import React, { Component } from 'react';
import FileDrop from './FileDrop';
import ChipFilter from './ChipFilter';

import Button from '@material-ui/core/Button';

import './section_one.scss';




class SectionOneContainer extends Component{
    constructor(props) {
      super(props)
      this.state = {
        files: [],
        zone_chips: [],
        use_chips: [],
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
    handleToggleChip(chips, type){
      console.log(chips, type);
      if (type === 'zone') {
        this.setState({
          ...this.state,
          zone_chips: chips,
        });
      } else if (type === 'use') {
        this.setState({
          ...this.state,
          use_chips: chips,
        });
      }
    }
    handleDeleteChip(chip, type) {
        console.log(chip, type);
        if (type === 'zone') {
          const pre_array = [...this.state.zone_chips];
          const currentIndex = this.state.zone_chips.indexOf(chip);
          pre_array.splice(currentIndex, 1);
          this.setState({
            ...this.state.chips,
            zone_chips: pre_array,
          });
        } else if (type === 'use') {
          const pre_array = [...this.state.use_chips];
          const currentIndex = this.state.use_chips.indexOf(chip);
          pre_array.splice(currentIndex, 1);
          this.setState({
            ...this.state.chips,
            use_chips: pre_array,
          });
        }

    }

    render(){
        return(
            <div id="section-one">
              <h2>Please Ensure your csv data either includes a 'Address' or 'Street' value</h2>
              <FileDrop createFile={this.createFile} files={this.state.files} />
              <ChipFilter handleToggleChip={this.handleToggleChip} handleDeleteChip={this.handleDeleteChip} zone_chips={this.state.zone_chips} use_chips={this.state.use_chips}/>
              <div id="submit-file-container">
                {this.state.valid ? 
                  <Button className="section-one-button" variant="contained" color="primary" onClick={() => {this.props.submitCSV(this.state.files, this.state.zone_chips, this.state.use_chips)}}>
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