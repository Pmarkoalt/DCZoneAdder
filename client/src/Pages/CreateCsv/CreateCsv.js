import React, { Component, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import Dropzone from 'react-dropzone'

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { convertCsv, processCsv } from './create_csv_api';
import SectionOneContainer from './Components/SectionOne/SectionOneContainer';
import TableContainer from './Components/Table/TableContainer';

import './create_csv.scss';

const styles = { border: '1px solid black', width: 600, color: 'black', padding: 20 };



class CreateCsv extends Component{
  constructor(props) {
    super(props)
    this.state = {
      date: new Date(),
      data: [],
      valid: false,
      loading: false,
      section: 1
    }
    this.submitCSV = this.submitCSV.bind(this);
    this.processCSV = this.processCSV.bind(this);

    this.changeSection = this.changeSection.bind(this);
  }
  componentDidMount(){
  }

  submitCSV(files) {
    this.setState({
      ...this.state,
      loading: true
    });
    convertCsv(files)
    .then((response) => {
      this.setState({
        ...this.state,
        data: response.data,
        section: 2,
        loading: false
      });
    });
  }
  processCSV() {
    this.setState({
      ...this.state,
      loading: true
    });
    processCsv(this.state.data)
    .then((response) => {
      this.setState({
        ...this.state,
        data: response.data,
        section: 3,
        loading: false
      });
    });
  }
  changeSection(section_number) {
    this.setState({
      ...this.state,
      section: section_number
    });
  }

  sectionThree() {
    return (
      <div id="section-three">
        Section Three
      </div>
    )
  }

  render(){
    const handleDelete = index => () => {this.handleDeleteChip(index)};
    return(
      <div id="create-csv">
        {this.state.loading ? 
        <div>
          <h4>Processing...</h4>
          <CircularProgress /> 
        </div>
        : ''}
        {this.state.section === 1 && !this.state.loading ? <SectionOneContainer submitCSV={this.submitCSV} /> : ''}
        {this.state.section === 2 && !this.state.loading ? <TableContainer data={this.state.data} processCSV={this.processCSV}  /> : ''}
        {this.state.section === 3 && !this.state.loading ? <TableContainer data={this.state.data} finalTable={true} /> : ''}
      </div>
    )
  }
}

export default CreateCsv;