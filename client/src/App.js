import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.scss';
import {CreateCsv, DocumentDetails, Home, ListComponent} from './Pages';
import {JobsList, JobDetails, CSVUpload} from './Pages/CSVJobs';
import {Footer, Header} from './Components';


class App extends Component {
  render() {
    const App = () => (
      <div id="app">
        <Header/>
        <Switch>
          <Route exact path='/' component={Home}/>
          <Route path='/jobs/:id' component={JobDetails} />
          <Route path='/jobs' component={JobsList} />
          <Route path='/create-job' component={CSVUpload}/>
          <Route path='/create' component={CreateCsv}/>
          <Route path='/list' component={ListComponent}/>
          <Route path='/details/:id' component={DocumentDetails}/>
          <Route path='/job/:id' component={CreateCsv}/>
        </Switch>
        <Footer/>
      </div>
    )
    return (
      <Switch>
        <App/>
      </Switch>
    );
  }
}

export default App;