import React, {useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding-left: 1.5em;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  h3 {
    margin-top: 0;
  }

  span {
    font-weight: bold;
  }

  .group {
    padding: 10px;
    display: inline-block;
    width: fit-content;
    border: 1px solid black;
  }

  .buttons {
    margin-top: 10px;
    display: flex;
    gap: 20px;
  }
`;

// const API_URL = 'http://localhost:3333';
const API_URL = 'https://jbzyxeg9zx.us-east-1.awsapprunner.com';

async function getScraperStatus() {
  const resp = await fetch(`${API_URL}/api/queue`);
  return resp.json();
}

async function startScraper() {
  const resp = await fetch(`${API_URL}/api/start`, {method: 'POST'});
  return resp.json();
}

async function stopScraper() {
  const resp = await fetch(`${API_URL}/api/stop`, {method: 'POST'});
  return resp.json();
}

const Dashboard = () => {
  const [isRunning, setIsRunning] = useState(false);

  const updateStatus = useCallback(() => {
    getScraperStatus().then(({running}) => {
      setIsRunning(running);
    });
  }, []);

  useEffect(() => {
    updateStatus();
  }, [updateStatus]);

  const start = useCallback(async () => {
    (await startScraper()) && updateStatus();
  }, [updateStatus]);
  const stop = useCallback(async () => {
    (await stopScraper()) && updateStatus();
  }, [updateStatus]);

  return (
    <Container>
      <h1>Franklin County Dashboard</h1>
      <div className="group">
        <h3>Foreclosure Scraper</h3>
        <div>
          STATUS: <span>{isRunning ? 'Running' : 'Idle'}</span>
        </div>
        <div className="buttons">
          <button onClick={start} disabled={isRunning}>
            Start
          </button>
          <button onClick={stop} disabled={!isRunning}>
            Stop
          </button>
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
