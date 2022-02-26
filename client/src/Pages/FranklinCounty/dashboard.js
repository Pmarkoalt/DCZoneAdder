import React from 'react';
import styled from 'styled-components';
import ForeclosureControls from './foreclosure';
import ProbateControls from './probate';

const Container = styled.div`
  padding-left: 1.5em;
  padding-bottom: 1.5em;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  .controls {
    display: flex;
    gap: 1rem;
  }

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

const Dashboard = () => {
  return (
    <Container>
      <h1>Franklin County Dashboard</h1>
      <div className="controls">
        <div className="group">
          <ForeclosureControls />
        </div>
        <div className="group">
          <ProbateControls />
        </div>
      </div>
    </Container>
  );
};

export default Dashboard;
