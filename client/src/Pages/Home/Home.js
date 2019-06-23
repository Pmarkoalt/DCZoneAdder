import React, { Component } from 'react';
import './home.scss';




class Home extends Component{
  constructor(props) {
    super(props)
    this.state = {
      date: new Date()
    }
  }
  componentDidMount(){

  }

  render(){
    return(
      <div id="home">
        <h5>Home</h5>
      </div>
    )
  }
}

export default Home;