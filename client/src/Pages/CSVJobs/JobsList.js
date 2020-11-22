import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import {LinearProgressWithLabel} from '../../Components/progress';

import './list.scss';

import {listJobs, deleteJob, formatDate, downloadJobCSV} from './utils.js';
import {Avatar, CircularProgress} from '@material-ui/core';

const JobTypeSelect = styled(FormControl)`
  width: 200px;
  position: absolute;
  top: 80px;
  right: 10px;
`;

const getJobTypeAvatarMeta = (jobType) => {
  const config = {
    zone: ['Z', 'lightcoral'],
    tpsc: ['T', 'lightskyblue'],
  };
  return config[jobType];
};

const Job = ({job, disableDownload, disableDelete, onDownload, onDelete}) => {
  const [abbreviation, color] = getJobTypeAvatarMeta(job.type);
  return (
    <div className="list-row">
      <Avatar variant="square" style={{backgroundColor: color, marginRight: '10px'}}>
        {abbreviation}
      </Avatar>
      <ListItem className="card" button component="a" key={job._id} href={`/jobs/${job.id}`}>
        <div className="list-top-row">
          <ListItemText
            primary={job.export_file_name || `Job ID: ${job.id}`}
            secondary={formatDate(job.created_timestamp)}
          />
          <ListItemText primary={`Success: ${job.task_success_count}`} secondary={`Failed: ${job.task_error_count}`} />
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              aria-label="delete"
              disabled={disableDelete}
              onClick={(event) => {
                event.preventDefault();
                onDelete(job.id, job.export_file_name);
              }}>
              <DeleteIcon />
            </IconButton>
            <IconButton
              edge="end"
              aria-label="comments"
              disabled={disableDownload}
              onClick={(event) => {
                event.preventDefault();
                onDownload(job.id, job.export_file_name);
              }}>
              {disableDownload ? <CircularProgress /> : <GetAppIcon />}
            </IconButton>
          </ListItemSecondaryAction>
        </div>
        <div className="progress">
          <LinearProgressWithLabel
            value={(100 * job.task_completed_count) / job.total_tasks}
            tooltip={`${job.task_completed_count} / ${job.total_tasks}`}
          />
        </div>
      </ListItem>
    </div>
  );
};

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState({});
  const [deleting, setDeleting] = useState({});
  const [jobType, setJobType] = useState('All');

  useEffect(() => {
    setLoading(true);
    const _jobType = jobType === 'All' ? undefined : jobType;
    listJobs(_jobType).then((jobs) => {
      setLoading(false);
      setJobs(jobs);
    });
  }, [jobType]);

  return (
    <>
      <JobTypeSelect variant="filled">
        <InputLabel id="demo-simple-select-filled-label">Job Type</InputLabel>
        <Select
          labelId="demo-simple-select-filled-label"
          id="demo-simple-select-filled"
          value={jobType}
          onChange={(event) => setJobType(event.target.value)}>
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="zone">Zone</MenuItem>
          <MenuItem value="tpsc">TSPC</MenuItem>
        </Select>
      </JobTypeSelect>
      <div id="list">
        <List style={{width: '600px'}}>
          {!loading ? (
            jobs.length === 0 ? (
              <h3>No Results</h3>
            ) : (
              jobs.map((item) => {
                return (
                  <Job
                    job={item}
                    key={item.id}
                    disableDownload={Boolean(downloading[item.id])}
                    disableDelete={Boolean(deleting[item.id])}
                    onDelete={async (jobId, name) => {
                      const shouldDelete = window.confirm(
                        `Are you sure you want to delete Job: ${name ? name : jobId}`,
                      );
                      if (!shouldDelete) {
                        return;
                      }
                      setDeleting((d) => ({...d, [jobId]: true}));
                      await deleteJob(jobId);
                      const jobs = await listJobs(jobType);
                      setDeleting((d) => ({...d, [jobId]: false}));
                      setJobs(jobs);
                    }}
                    onDownload={async (jobId, filename) => {
                      setDownloading((d) => ({...d, [jobId]: true}));
                      await downloadJobCSV(jobId, filename);
                      setDownloading((d) => ({...d, [jobId]: false}));
                    }}
                  />
                );
              })
            )
          ) : (
            <ListItem button key="Loading">
              <CircularProgress />
            </ListItem>
          )}
        </List>
      </div>
    </>
  );
};
export default JobList;
