import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import {Table} from '../../Components/table';
import {LinearProgressWithLabel} from '../../Components/progress';
import {Tabs} from '../../Components/tabs';

import Button from '@material-ui/core/Button';
// import './section_two.scss';
import {downloadJobCSV, getJob, getJobTaskResults} from './utils';

const DetailsContainer = styled.div`
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
  }
`;

const TaskTable = ({job, error}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getJobTaskResults(job.id, Boolean(error)).then((tasks) => {
      setTasks(tasks);
      setLoading(false);
    });
  }, [job.id, error]);
  const key = error ? 'data' : 'result';
  const header = tasks[0] ? Object.keys(tasks[0][key] || {}) : [];
  const rows = tasks.map((t) => t[key]);
  return <Table header={header} rows={rows} loading={loading} />;
};

function msToTime(duration) {
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
  const [socket, setSocket] = useState();

  useEffect(() => {
    const s = io.connect();
    setSocket(s);
  }, []);

  const downloadCSV = useCallback(async (jobId, filename) => {
    setDownloading(true);
    await downloadJobCSV(jobId, filename);
    setDownloading(false);
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

  console.log(job);
  return (
    <DetailsContainer>
      <div className="top-row">
        <div>
          <h2>
            {`Job ID: ${jobId}`} {job.completed ? '' : `(${data}/${job.total_tasks})`}
          </h2>
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
            disabled={downloading}
            onClick={() => downloadCSV(jobId, job.export_file_name)}>
            Download
          </Button>
        </div>
      </div>
      <LinearProgressWithLabel value={completion} tooltip={tooltip} />
      <div>
        {job && job.completed && (
          <Tabs
            tabs={[
              {
                label: 'Success',
                component: <TaskTable job={job} />,
              },
              {
                label: 'Error',
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
