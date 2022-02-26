import React, {useState, useEffect, useCallback} from 'react';

// const API_URL = 'http://localhost:3333';
const API_URL = 'https://jbzyxeg9zx.us-east-1.awsapprunner.com';

async function getScraperMeta() {
  const resp = await fetch(`${API_URL}/foreclosures/queue`);
  return resp.json();
}

async function startScraper(year) {
  const resp = await fetch(`${API_URL}/foreclosures/start/${year}`, {method: 'POST'});
  return resp.json();
}

async function stopScraper() {
  const resp = await fetch(`${API_URL}/foreclosures/stop`, {method: 'POST'});
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

  const start = useCallback(
    async (year) => {
      await startScraper(year);
      setTimeout(() => {
        updateMeta();
      }, 1000);
    },
    [updateMeta],
  );
  const stop = useCallback(async () => {
    await stopScraper();
    setTimeout(() => {
      updateMeta();
    }, 1000);
  }, [updateMeta]);

  const isRunning = meta.status && meta.status.startsWith('RUNNING');

  return (
    <>
      <h3>Foreclosure Scraper</h3>
      <div>
        STATUS: <span>{meta.status || 'Loading...'}</span>
      </div>
      <div>
        <div>
          2020: <span>{meta['lastCaseNumberProcessed:20']}</span>
        </div>
        <div>
          2021: <span>{meta['lastCaseNumberProcessed:21']}</span>
        </div>
        <div>
          2022: <span>{meta['lastCaseNumberProcessed:22']}</span>
        </div>
      </div>
      <div className="buttons">
        <button onClick={() => start(20)} disabled={isRunning}>
          Start 2020
        </button>
        <button onClick={() => start(21)} disabled={isRunning}>
          Start 2021
        </button>
        <button onClick={() => start(22)} disabled={isRunning}>
          Start 2022
        </button>
        <button onClick={stop} disabled={!isRunning}>
          Stop
        </button>
      </div>
    </>
  );
};

export default Dashboard;
