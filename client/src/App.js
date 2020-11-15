import React, {Component} from 'react';
import {Route, Switch} from 'react-router-dom';
import './App.scss';
import {CreateJob, CreateCsv, DocumentDetails, Home, ListComponent, ZoneJobDetails} from './Pages';
import {JobsList, JobDetails, CSVUpload} from './Pages/CSVJobs';
import {Footer, Header} from './Components';

class App extends Component {
  render() {
    const App = () => (
      <div id="app">
        <Header />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/jobs" component={JobsList} />
          <Route path="/jobs/create" component={CreateJob} />
          <Route path="/jobs/:id" component={JobDetails} />
          {/* <Route path="/create-job" component={CSVUpload} />
          <Route path="/list" component={ListComponent} />
          <Route path="/details/:id" component={DocumentDetails} />
          <Route path="/job/:id" component={ZoneJobDetails} /> */}
        </Switch>
        <Footer />
      </div>
    );
    return (
      <Switch>
        <App />
      </Switch>
    );
  }
}

export default App;
