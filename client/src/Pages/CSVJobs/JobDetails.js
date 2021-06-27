import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import {Table} from '../../Components/table';
import {LinearProgressWithLabel} from '../../Components/progress';
import {Tabs} from '../../Components/tabs';

import Button from '@material-ui/core/Button';
// import './section_two.scss';
import {
  getJobTypeAvatarMeta,
  downloadJobCSV,
  getJob,
  getJobTaskResults,
  downloadFailedJobCSV,
  downloadFilteredJobResultsCSV,
  downloadProspectsZip,
} from './utils';
import {Avatar, FormControl, InputLabel, Select, MenuItem, TextField} from '@material-ui/core';

const PIP_TYPE = {
  ODDC: 'OD', // open data dc
  ROD: 'ROD', // recorder of deeds
  DCSC: 'DCSC', // dc superior court
};

const DetailsContainer = styled.div`
  padding-top: 1em;
  margin: auto;
  width: 80%;
  max-width: 1000px;
  min-width: 300px;
  display: flex;
  justify-content: center;
  flex-direction: column;

  & > * + * {
    margin-top: 10px;
  }

  .top-row {
    h2 {
      margin: 0;
    }
    display: flex;
    width: 100%;
    justify-content: space-between;
  }

  .task-comp-time {
    align-self: center;
    font-size: 1.2em;
  }

  .download {
    align-self: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;

    * + * {
      margin-top: 10px;
    }
  }
`;

const TaskTable = ({job, error}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getJobTaskResults(job.id, Boolean(error), {limit: 100, start: 0}).then((tasks) => {
      setTasks(tasks);
      setLoading(false);
    });
  }, [job.id, error]);
  const key = error ? 'data' : 'result';
  const header = tasks[0] ? Object.keys(tasks[0][key] || {}) : [];
  const rows = tasks.map((t) => t[key]);
  const count = error ? job.task_error_count : job.task_success_count;
  return <Table header={header} rows={rows} loading={loading} count={count} />;
};

function msToTime(duration) {
  if (!duration) {
    return '--';
  }
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
}

const JobDetails = ({match}) => {
  const jobId = match.params.id;
  const [job, setJob] = useState({});
  const [data, setData] = useState(0);
  const [pipType, setPipType] = useState(PIP_TYPE.ODDC);
  const [pipContext, setPipContext] = useState({taxRatio: '0.6'});
  const [isPipValid, setIsPipValid] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadingFilteredResults, setDownloadingFilteredResults] = useState(false);
  const [downloadingFailedTasks, setDownloadingFailedTasks] = useState(false);
  const [downloadingProspects, setDownloadingProspects] = useState(false);
  const [socket, setSocket] = useState();
  const [abbreviation, color] = getJobTypeAvatarMeta(job ? job.type : undefined);

  useEffect(() => {
    if (pipType === PIP_TYPE.ODDC) {
      const taxRatio = pipContext.taxRatio;
      const validTaxRatio = taxRatio !== undefined && taxRatio.trim().length > 0 && !isNaN(+taxRatio);
      setIsPipValid(validTaxRatio);
    } else {
      setIsPipValid(true);
    }
  }, [pipType, pipContext]);

  useEffect(() => {
    const s = io.connect();
    setSocket(s);
  }, []);

  const downloadCSV = useCallback(async (jobId, filename) => {
    try {
      setDownloading(true);
      await downloadJobCSV(jobId, filename);
    } catch (e) {
      alert('An error occurred, please try again.');
    } finally {
      setDownloading(false);
    }
  }, []);
  const downloadFilteredResultsCSV = useCallback(async (jobId, filename) => {
    try {
      setDownloadingFilteredResults(true);
      const hasResults = await downloadFilteredJobResultsCSV(jobId, filename);
      if (!hasResults) {
        alert('There are no results that match the filter.');
      }
    } catch (e) {
      alert('An error occurred, please try again.');
    } finally {
      setDownloadingFilteredResults(false);
    }
  }, []);
  const downloadFailedTasksCSV = useCallback(async (jobId, filename) => {
    setDownloadingFailedTasks(true);
    await downloadFailedJobCSV(jobId, filename);
    setDownloadingFailedTasks(false);
  }, []);
  const downloadProspectsZipCB = useCallback(
    async (jobId, filename) => {
      try {
        setDownloadingProspects(true);
        await downloadProspectsZip(jobId, pipType, pipContext, filename);
      } catch (e) {
        alert('Someone went wrong, please try again. If this is happening consistently, there is a bug.');
      } finally {
        setDownloadingProspects(false);
      }
    },
    [pipType, pipContext],
  );

  useEffect(() => {
    if (!jobId) {
      return;
    }
    getJob(jobId).then((j) => {
      setJob(j);
      setData(j.task_success_count + j.task_error_count);
    });
  }, [jobId]);

  useEffect(() => {
    if (data >= job.total_tasks) {
      getJob(jobId).then(setJob);
    }
  }, [data, jobId, job.total_tasks]);

  useEffect(() => {
    if (!jobId || !socket) {
      return;
    }
    socket.on(`job-task-complete-${jobId}`, () => {
      setData((d) => d + 1);
    });
  }, [jobId, socket]);

  const completion = (job ? data / job.total_tasks : 0) * 100;
  const tooltip = job ? `${data} / ${job.total_tasks}` : '-/-';

  return (
    <DetailsContainer>
      <div className="top-row">
        <div>
          <div style={{display: 'flex'}}>
            <Avatar variant="square" style={{backgroundColor: color, marginRight: '10px'}}>
              {abbreviation}
            </Avatar>
            <h2>
              {`Job ID: ${jobId}`} {job.completed ? '' : `(${data}/${job.total_tasks})`}
            </h2>
          </div>
          {job.completed ? (
            <h3>Job Complete! {job.total_tasks} tasks processed. </h3>
          ) : (
            <h3>Job Processing, Please Wait</h3>
          )}
          <div className="task-comp-time">
            {job.completed && <div>Total job duration: {msToTime(job.time_to_complete)}</div>}
            <div>
              Avg task duration:{' '}
              {job.average_task_completion_time ? `${Math.round(job.average_task_completion_time)}ms` : '--'}
            </div>
          </div>
        </div>
        <div className="download">
          <Button
            id="section-two-submit"
            variant="contained"
            color="primary"
            disabled={downloading || job.task_success_count === 0}
            onClick={() => downloadCSV(jobId, job.export_file_name)}>
            Download Successful Items
          </Button>
          <Button
            id="filterd-results-download"
            variant="contained"
            disabled={downloadingFilteredResults || job.task_success_count === 0}
            onClick={() => downloadFilteredResultsCSV(jobId, job.export_file_name)}>
            Download Zoning Opp Filter
          </Button>
          <Button
            id="failed-task-download"
            variant="contained"
            color="secondary"
            disabled={downloadingFailedTasks || job.task_error_count === 0}
            onClick={() => downloadFailedTasksCSV(jobId, job.export_file_name)}>
            Download Failed Items
          </Button>
        </div>
        <div>
          <FormControl variant="outlined" style={{width: '100%'}}>
            <InputLabel id="prospect-filter-label">Prospect Indentification Process</InputLabel>
            <Select
              labelId="prospect-filter-label"
              id="prospect-filter-select"
              value={pipType}
              onChange={(event) => {
                setPipType(event.target.value);
              }}
              label="Prospect Identification Process">
              <MenuItem value={PIP_TYPE.ROD}>Recorder of Deeds</MenuItem>
              <MenuItem value={PIP_TYPE.DCSC}>Landlord & Tenant</MenuItem>
              <MenuItem value={PIP_TYPE.ODDC}>Open Data DC</MenuItem>
            </Select>
            {pipType === PIP_TYPE.ODDC ? (
              <TextField
                style={{marginTop: '0.5em'}}
                labelId="tax-ratio-label"
                id="tax-ratio-input"
                variant="filled"
                value={pipContext.taxRatio}
                onChange={(event) => {
                  setPipContext((ctx) => ({...ctx, taxRatio: event.target.value}));
                }}
                label="Tax Ratio Threshold"
              />
            ) : null}
            <Button
              id="prospects-download"
              variant="contained"
              color="primary"
              style={{marginTop: '0.5em'}}
              disabled={!isPipValid || downloadingProspects || job.task_success_count === 0}
              onClick={() => {
                downloadProspectsZipCB(jobId, job.export_file_name);
              }}>
              {downloadingProspects ? 'Processing...' : 'Download Prospects'}
            </Button>
          </FormControl>
        </div>
      </div>
      <LinearProgressWithLabel value={completion} tooltip={tooltip} />
      <div>
        {job && job.completed && (
          <Tabs
            tabs={[
              // {
              //   label: 'Success',
              //   component: <TaskTable job={job} />,
              // },
              {
                label: `Failed Items (${job.task_error_count})`,
                component: <TaskTable job={job} error />,
              },
            ]}
          />
        )}
      </div>
    </DetailsContainer>
  );
};

export default JobDetails;
