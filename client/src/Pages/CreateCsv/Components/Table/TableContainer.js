import React, { Component, useCallback } from 'react';
import Table from './Table';

import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';

import { convertCsv } from '../../create_csv_api';
import './section_two.scss';




class TableContainer extends Component{
    constructor(props) {
      super(props)
      this.state = {   
      }
    }
    componentDidMount(){
    }
    render(){
        return(
            <div id="section-two">
              <h2>Please Verify This Data is Correct and Then Submit</h2>
              <Table data={this.props.data} />

              {this.props.finalTable ? 
                <div>
                  <Button id="section-two-download" variant="contained" color="secondary" onClick={() => {this.props.downloadCSV()}}>
                    Download
                  </Button>
                  <Button id="section-two-submit" variant="contained" color="primary" onClick={() => {this.props.saveCSV()}}>
                    Save
                  </Button>
                </div>
                :
                <div>
                  <Button id="section-two-submit" variant="contained" color="primary" onClick={() => {this.props.processCSV()}}>
                    Submit
                  </Button>
                </div>
              }
            </div>
        )
    }
}

export default TableContainer;