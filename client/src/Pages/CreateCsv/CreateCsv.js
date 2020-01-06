import React, { Component } from 'react';
import csvparse from 'csv-parse/lib/sync';


import CircularProgress from '@material-ui/core/CircularProgress';

import { processCsv, saveCsv, downloadCurrentCsv } from './create_csv_api';
import SectionOneContainer from './Components/SectionOne/SectionOneContainer';
import TableContainer from './Components/Table/TableContainer';

import './create_csv.scss';

class CreateCsv extends Component{
  constructor(props) {
    super(props)
    this.state = {
      date: new Date(),
      data: [],
      job_id: 0,
      zone_chips: [],
      use_chips: [],
      valid: false,
      loading: false,
      section: 1
    }
    this.submitCSV = this.submitCSV.bind(this);
    this.processCSV = this.processCSV.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
    this.saveCSV = this.saveCSV.bind(this);
    this.changeSection = this.changeSection.bind(this);
  }
  componentDidMount(){
  }

  submitCSV(files, zone_chips, use_chips) {
    this.setState({
      ...this.state,
      loading: true
    });
    let newData = [];
    files.forEach(file => {
      const parsed = csvparse(file.data, {columns: true});
      newData = [
        ...newData,
        ...parsed
      ];
    });
    this.setState({
      ...this.state,
      zone_chips: zone_chips,
      use_chips: use_chips,
      data: newData,
      section: 2,
      loading: false
    });
  }
  processCSV() {
    this.setState({
      ...this.state,
      loading: true
    });
    const zone_array = this.state.zone_chips.map(item => item.value);
    const use_array = this.state.use_chips.map(item => item.value);
    processCsv(this.state.data, {zones: zone_array, use: use_array})
    .then((response) => {
      console.log(response);
      this.setState({
        ...this.state,
        // data: response,
        section: 3,
        loading: false
      });
    })
    .catch((err) => {
      console.log('add error notification');
    })
  }
  downloadCSV() {
    downloadCurrentCsv(this.state.data)
    .then((response) => {

    });
  }
  saveCSV() {
    saveCsv(this.state.csv)
    .then(response => {

    })
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
        {this.state.section === 3 && !this.state.loading ? <TableContainer data={this.state.data} finalTable={true} saveCSV={this.saveCSV} downloadCSV={this.downloadCSV} /> : ''}
      </div>
    )
  }
}

export default CreateCsv;