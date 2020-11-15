import React, {useState, useEffect, useCallback} from 'react';
import io from 'socket.io-client';
import Table from './Table';

import Button from '@material-ui/core/Button';
import './section_two.scss';
import {downloadJobCSV, getJob} from './utils';

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

  return (
    <div id="section-two">
      <h2>
        {`Job ID: ${jobId}`} ({data}/{job.total_tasks})
      </h2>
      {job.completed ? <h3>Job Complete!</h3> : <h3>Job Processing, Please Wait</h3>}
      {/* {job.completed && <Table data={job.tasks.map((t) => t.data)} keys={Object.keys(job.tasks[0].data)} />} */}
      {job.id && !job.completed && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{width: `${(job ? data / job.total_tasks : 0) * 100}%`}} />
        </div>
      )}

      <div>
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
  );
};

export default JobDetails;
