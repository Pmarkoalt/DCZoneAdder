import React, {useState, useEffect, useCallback} from 'react';

// const API_URL = 'http://localhost:3333';
const API_URL = 'https://jbzyxeg9zx.us-east-1.awsapprunner.com';

async function getScraperMeta() {
  const resp = await fetch(`${API_URL}/probate/queue`);
  return resp.json();
}

async function startScraper() {
  const resp = await fetch(`${API_URL}/probate/start/`, {method: 'POST'});
  return resp.json();
}

async function stopScraper() {
  const resp = await fetch(`${API_URL}/probate/stop`, {method: 'POST'});
  return resp.json();
}

const Dashboard = () => {
  const [meta, setMeta] = useState({});

  const updateMeta = useCallback(() => {
    getScraperMeta().then((m) => {
      setMeta(m);
    });
  }, []);

  useEffect(() => {
    updateMeta();
    const intervalId = setInterval(() => {
      updateMeta();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [updateMeta]);

  const start = useCallback(async () => {
    await startScraper();
    setTimeout(() => {
      updateMeta();
    }, 1000);
  }, [updateMeta]);
  const stop = useCallback(async () => {
    await stopScraper();
    setTimeout(() => {
      updateMeta();
    }, 1000);
  }, [updateMeta]);

  const isRunning = meta.status && meta.status.startsWith('RUNNING');

  return (
    <>
      <h3>Probate Scraper</h3>
      <div>
        STATUS: <span>{meta.status || 'Loading...'}</span>
      </div>
      <div>
        <div>
          Last Case Number Processed: <span>{meta['lastCaseNumberProcessed']}</span>
        </div>
      </div>
      <div className="buttons">
        <button onClick={() => start()} disabled={isRunning}>
          Start
        </button>
        <button onClick={stop} disabled={!isRunning}>
          Stop
        </button>
      </div>
    </>
  );
};

export default Dashboard;
