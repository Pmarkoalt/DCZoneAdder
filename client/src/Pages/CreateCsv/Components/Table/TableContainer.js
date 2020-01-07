import React, { Component } from 'react';
import Table from './Table';

import Button from '@material-ui/core/Button';

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
              <h2>{this.props.finalTable ? `Processed Data Job ID: ${this.props.job_id}` : 'Please Verify This Data is Correct and Then Submit'}</h2>
              {this.props.finalTable && !this.props.job_complete ? <h3>Job Processing, Please Wait</h3> : <span></span> }
              {this.props.finalTable && this.props.job_complete ? <h3>Job Complete!</h3> : <span></span> }
              <Table data={this.props.data} keys={this.props.keys} />

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