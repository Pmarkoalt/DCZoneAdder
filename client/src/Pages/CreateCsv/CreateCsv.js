import React, { Component, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import Dropzone from 'react-dropzone'

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import { convertCsv } from './create_csv_api';
import SectionOneContainer from './Components/SectionOne/SectionOneContainer';
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
    .then((data) => {
      this.setState({
        ...this.state,
        data,
        section: 2,
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

  sectionTwo() {
    return (
      <div id="section-two">
        Section Two
      </div>
    )
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
        {this.state.loading ? <CircularProgress /> : ''}
        {this.state.section === 1 && !this.state.loading ? <SectionOneContainer submitCSV={this.submitCSV} /> : ''}
        {this.state.section === 2 && !this.state.loading ? this.sectionTwo() : ''}
        {this.state.section === 3 && !this.state.loading ? this.sectionThree() : ''}
      </div>
    )
  }
}

export default CreateCsv;