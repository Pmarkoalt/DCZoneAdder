import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.scss';
import {CreateCsv, DocumentDetails, Home, List } from './Pages';
import {Footer, Header} from './Components';


class App extends Component {
  render() {
    const App = () => (
      <div id="app">
        <Header/>
        <Switch>
          <Route exact path='/' component={Home}/>
          <Route path='/create' component={CreateCsv}/>
          <Route path='/list' component={List}/>
          <Route path='/details/:id' component={DocumentDetails}/>
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