import React, { Component } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';

import './list.scss';

import { findAllJobs, deleteJob } from './list_api';
import {downloadJobCSVFromSocket} from "../CreateCsv/utils";

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

  async deleteJob(jobId, name) {
    const shouldDelete = window.confirm(`Are you sure you want to delete Job: ${name ? name : jobId}`);
    if (!shouldDelete) {
      return;
    }
    const meta = await deleteJob(jobId);
    console.log(meta);
    const data = await findAllJobs()
    this.setState({
      ...this.state,
      jobs: data.jobs
    });
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
          <IconButton edge="end" aria-label="delete" onClick={() => this.deleteJob(item.job_id, item.export_file_name)}>
            <DeleteIcon />
          </IconButton>
          <IconButton 
            edge="end" 
            aria-label="comments"
            disabled={this.state.downloading}
            onClick={async () => {
              this.setState({downloading: true})
              await downloadJobCSVFromSocket(item.job_id, item.export_file_name)
              this.setState({downloading: false})
            }}
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