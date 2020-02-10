import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';

import './list.scss';

import { downloadCsvById, findAllJobs } from './list_api';

class ListComponent extends Component{
  constructor(props) {
    super(props)
    this.state = {
      date: new Date(),
      jobs: [],
      loaded: false
    }
  }
  componentDidMount() {
    findAllJobs()
    .then(data => {
      this.setState({
        ...this.state,
        jobs: data.jobs
      });
    })
  }

  downloadCsv(job_id, fileName) {
    const _fileName = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
    downloadCsvById(job_id, _fileName)
    .then(response => {
      console.log(response);
    })
  }

  formatDate(date) {
    const monthNames = [
      "January", "February", "March",
      "April", "May", "June", "July",
      "August", "September", "October",
      "November", "December"
    ];
    date = new Date(date);
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minutes = date.getMinutes();
  
    return `${day} ${monthNames[monthIndex]} ${year}, ${hour}:${minutes}`;
  }

  job(item) {
    return(
      <ListItem 
        className="card" 
        button 
        component="a"
        key={item._id}
        href={`/job/${item.job_id}`}
      >
        <ListItemText
          primary={item.export_file_name || `Job ID: ${item.job_id}`}
          secondary={this.formatDate(item.date_modifed)}
        />
        <ListItemSecondaryAction>
          <IconButton disabled edge="end" aria-label="comments">
            <DeleteIcon />
          </IconButton>
          <IconButton 
            edge="end" 
            aria-label="comments"
            onClick={() => this.downloadCsv(item.job_id, item.export_file_name)}
          >
            <GetAppIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }

  render() {
    return(
      <div id="list">
        <List>
          {this.state.jobs && this.state.jobs.length ? 
            
            this.state.jobs.map(item => {
              return this.job(item);
            })
          :
          <ListItem button key="Loading">
            <ListItemText
              primary="Loading"
            />
          </ListItem>
          }
        </List>
      </div>
    )
  }
}

export default ListComponent;