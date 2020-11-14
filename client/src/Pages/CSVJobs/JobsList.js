import React, {Component} from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';

import './list.scss';

import {listJobs, deleteJob, formatDate, downloadJobCSVFromSocket} from './utils.js';

class ListComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(),
      jobs: [],
      loaded: false,
      downloading: {},
    };
  }
  componentDidMount() {
    listJobs().then((jobs) => {
      this.setState({
        ...this.state,
        jobs: jobs,
      });
    });
  }

  async deleteJob(jobId, name) {
    const shouldDelete = window.confirm(`Are you sure you want to delete Job: ${name ? name : jobId}`);
    if (!shouldDelete) {
      return;
    }
    await deleteJob(jobId);
    const jobs = await listJobs();
    this.setState({
      ...this.state,
      jobs,
    });
  }

  async downloadCsv(jobId, fileName) {
    this.setState({
      downloading: {
        ...this.state.downloading,
        [jobId]: true,
      },
    });
    await downloadJobCSVFromSocket(jobId, fileName);
    this.setState({
      downloading: {
        ...this.state.downloading,
        [jobId]: false,
      },
    });
  }

  job(item) {
    return (
      <ListItem className="card" button component="a" key={item._id} href={`/jobs/${item.id}`}>
        <ListItemText
          primary={item.export_file_name || `Job ID: ${item.id}`}
          secondary={formatDate(item.created_timestamp)}
        />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="delete" onClick={() => this.deleteJob(item.id, item.export_file_name)}>
            <DeleteIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="comments"
            disabled={this.state.downloading[item.id]}
            onClick={() => this.downloadCsv(item.id, item.export_file_name)}>
            <GetAppIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }

  render() {
    return (
      <div id="list">
        <List>
          {this.state.jobs && this.state.jobs.length ? (
            this.state.jobs.map((item) => {
              return this.job(item);
            })
          ) : (
            <ListItem button key="Loading">
              <ListItemText primary="Loading" />
            </ListItem>
          )}
        </List>
      </div>
    );
  }
}

export default ListComponent;
