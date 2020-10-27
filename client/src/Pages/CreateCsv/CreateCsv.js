import React, { Component } from 'react';
import csvparse from 'csv-parse/lib/sync';
import io from "socket.io-client";



import CircularProgress from '@material-ui/core/CircularProgress';

import { processCsv, downloadCurrentCsv, fetchCurrentJob } from './create_csv_api';
import SectionOneContainer from './Components/SectionOne/SectionOneContainer';
import SectionTwoContainer from './Components/SectionTwo/SectionTwoContainer';

import './create_csv.scss';
import { zillowFields } from './Components/SectionTwo/export_fields';
import {createJobFromSocket} from './utils';

class CreateCsv extends Component{
  constructor(props) {
    super(props)
    this.state = {
      endpoint: process.env.SOCKET_IO_URL || `${window.location.origin}:3001`,
      date: new Date(),
      data: [],
      keys: [],
      job_id: 0,
      zone_chips: [],
      use_chips: [],
      valid: false,
      loading: false,
      job_complete: false,
      search_zillow: true,
      section: 1,
      exportFileName: undefined,
      csvExportFields: [],
    }
    this.submitCSV = this.submitCSV.bind(this);
    this.processCSV = this.processCSV.bind(this);
    this.downloadCSV = this.downloadCSV.bind(this);
    this.changeSection = this.changeSection.bind(this);
    this.changeZillow = this.changeZillow.bind(this);
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

  submitCSV(files, zone_chips, use_chips, exportFileName, csvExportFields) {
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
      loading: false,
      exportFileName,
      csvExportFields
    });
  }
  processCSV() {
    this.setState({
      ...this.state,
      loading: true
    });
    const zone_array = this.state.zone_chips.map(item => item.value);
    const use_array = this.state.use_chips.map(item => item.value);
    createJobFromSocket(
      this.state.data,
      zone_array,
      use_array,
      this.state.search_zillow,
      this.state.exportFileName,
      this.state.csvExportFields
    ).then((jobId) => {
      window.location.href = `/job/${jobId}`;
    })
    .catch((err) => {
      console.log('add error notification');
    })
  }
  downloadCSV() {
    downloadCurrentCsv(this.state.data, this.state.exportFileName)
    .then((response) => {

    });
  }
  changeSection(section_number) {
    this.setState({
      ...this.state,
      section: section_number
    });
  }
  changeZillow() {
    let fields = this.state.csvExportFields || [];
    if (this.state.search_zillow) {
      fields = fields.filter(x => !zillowFields.includes(x));
    }
    this.setState({
      ...this.state,
      csvExportFields: fields,
      search_zillow: !this.state.search_zillow
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
      </div>
    )
  }
}

export default CreateCsv;