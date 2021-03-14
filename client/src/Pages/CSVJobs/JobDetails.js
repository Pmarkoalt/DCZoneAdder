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
} from './utils';
import {Avatar} from '@material-ui/core';

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
  const [downloading, setDownloading] = useState(false);
  const [downloadingFilteredResults, setDownloadingFilteredResults] = useState(false);
  const [downloadingFailedTasks, setDownloadingFailedTasks] = useState(false);
  const [socket, setSocket] = useState();
  const [abbreviation, color] = getJobTypeAvatarMeta(job ? job.type : undefined);

  useEffect(() => {
    const s = io.connect();
    setSocket(s);
  }, []);

  const downloadCSV = useCallback(async (jobId, filename) => {
    setDownloading(true);
    await downloadJobCSV(jobId, filename);
    setDownloading(false);
  }, []);
  const downloadFilteredResultsCSV = useCallback(async (jobId, filename) => {
    setDownloadingFilteredResults(true);
    await downloadFilteredJobResultsCSV(jobId, filename);
    setDownloadingFilteredResults(false);
  }, []);
  const downloadFailedTasksCSV = useCallback(async (jobId, filename) => {
    setDownloadingFailedTasks(true);
    await downloadFailedJobCSV(jobId, filename);
    setDownloadingFailedTasks(false);
  }, []);

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
        </div>
        <div className="task-comp-time">
          {job.completed && <div>Total job duration: {msToTime(job.time_to_complete)}</div>}
          <div>
            Avg task duration:{' '}
            {job.average_task_completion_time ? `${Math.round(job.average_task_completion_time)}ms` : '--'}
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
            Download Filtered Results
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
