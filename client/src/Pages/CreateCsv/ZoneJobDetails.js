import React, {useState, useEffect, useCallback} from 'react';
// import Table from './Table';

import Button from '@material-ui/core/Button';
import './Components/Table/section_two.scss';
import {downloadJobCSVFromSocket, getJob, getCompletedCount} from './utils';

const ZoneJobDetails = ({match}) => {
  const jobId = match.params.id;
  const [job, setJob] = useState({});
  const [completedCount, setCompletedCount] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const downloadCSV = useCallback(async (jobId, filename) => {
    setDownloading(true);
    await downloadJobCSVFromSocket(jobId, filename);
    setDownloading(false);
  }, []);

  useEffect(() => {
    if (!jobId) {
      return;
    }
    getJob(jobId).then(setJob);
  }, [jobId]);

  useEffect(() => {
    if (completedCount >= job.total_items) {
      getJob(jobId).then(setJob);
    }
  }, [completedCount, jobId, job.total_items])

  useEffect(() => {
    if (!jobId) {
      return;
    }
    const intervalId = setInterval(() => {
      getCompletedCount(jobId).then(setCompletedCount);
    }, 2000);
    return () => clearInterval(intervalId);
  }, [jobId]);

  console.log(job);

  return (
    <div id="section-two">
      <h2>{`Job ID: ${jobId}`} ({completedCount}/{job.total_items})</h2>
      {job.completed ? <h3>Job Complete!</h3> : <h3>Job Processing, Please Wait</h3> }
      {/* {job.completed && <Table data={job.results} keys={Object.keys(job.results[0])} />} */}
      {job.job_id && !job.completed &&
        <div className="progress-bar-container">
          <div className="progress-bar" style={{width: `${(job ? completedCount/job.total_items : 0) * 100}%`}}/>
        </div>
      }


      <div>
        <Button id="section-two-submit" variant="contained" color="primary" disabled={downloading} onClick={() => downloadCSV(jobId, job.export_file_name)}>
          Download
        </Button>
      </div>
    </div>
  )
};

export default ZoneJobDetails;