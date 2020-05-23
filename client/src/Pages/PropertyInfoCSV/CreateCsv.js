import React, { Component } from 'react';
import csvparse from 'csv-parse/lib/sync';
import io from "socket.io-client";



import CircularProgress from '@material-ui/core/CircularProgress';

import { processCsv, downloadCurrentCsv, fetchCurrentJob } from './create_csv_api';
import SectionOneContainer from './Components/SectionOne/SectionOneContainer';
import SectionTwoContainer from './Components/SectionTwo/SectionTwoContainer';
import TableContainer from './Components/Table/TableContainer';

import './create_csv.scss';

class CreateCsv extends Component{
  constructor(props) {
    super(props)
    this.state = {
      endpoint: process.env.SOCKET_IO_URL || `${window.location.origin}:3001`,
      date: new Date(),
      data: [],
      job_id: 0,
      valid: false,
      loading: false,
      job_complete: false,
      section: 1,
      exportFileName: undefined,
      csvExportFields: [],
    }
    this.submitCSV = this.submitCSV.bind(this);
    this.processCSV = this.processCSV.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
    this.changeSection = this.changeSection.bind(this);
    this.handleAddExportField = this.handleAddExportField.bind(this);
    this.handleRemoveExportField = this.handleRemoveExportField.bind(this);
  }
  componentDidMount(){
    const socket = io.connect();
    if (this.props.match.params.id) {
      this.setState({
        ...this.state,
        loading: true
      });
      fetchCurrentJob(this.props.match.params.id)
      .then(data => {
        this.setState({
          ...this.state,
          job_id: data.job_id,
          section: 3,
          data: data.addresses,
          job_complete: data.job_complete,
          loading: false,
          exportFileName: data.export_file_name,
          csvExportFields: data.csv_export_fields || [],
        });
      })
    }
    socket.on("csv_update", data => {
      if (data.job_id === this.state.job_id) {
        this.setState({
          ...this.state,
          data: data.addresses,
          job_complete: data.job_complete,
          keys: data.keys
        });
      }
    });
  }

  submitCSV(files, exportFileName) {
    this.setState({
      ...this.state,
      loading: true
    });
    const data = files.reduce(
      (acc, file) => acc.concat(csvparse(file.data.replace(/=/g, ""), {columns: true})), []
    );
    this.setState({
      ...this.state,
      data,
      // section: 2,
      loading: false,
      exportFileName,
    });
    return processCsv(data, exportFileName);
  }
  processCSV() {
    this.setState({
      ...this.state,
      loading: true
    });
    processCsv(
      this.state.data,
      this.state.exportFileName,
      this.state.csvExportFields
    ).then((response) => {
      this.setState({
        ...this.state,
        job_id: response.data.job_id,
        data: [],
        section: 3,
        loading: false
      });
    })
    .catch((err) => {
      console.log('add error notification');
    })
  }
  downloadCSV() {
    downloadCurrentCsv(this.state.data, this.state.exportFileName);
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
  handleAddExportField(field) {
    const fields = this.state.csvExportFields || [];
    this.setState({csvExportFields: [...fields, field]});
  }
  handleRemoveExportField(field) {
    const newList = this.state.csvExportFields.filter(f => f !== field);
    this.setState({csvExportFields: newList});
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
        {this.state.section === 2 && !this.state.loading ? <SectionTwoContainer jobName={this.state.exportFileName} data={this.state.data} searchZillow={this.state.search_zillow} setZillowFlag={this.changeZillow} processCSV={this.processCSV} selectedFields={this.state.csvExportFields} handleAddExportField={this.handleAddExportField} handleRemoveExportField={this.handleRemoveExportField} /> : ''}
        {this.state.section === 3 && !this.state.loading ? <TableContainer data={this.state.data} keys={this.state.keys} job_id={this.state.job_id} job_complete={this.state.job_complete} finalTable={true} downloadCSV={this.downloadCSV} /> : ''}
      </div>
    )
  }
}

export default CreateCsv;