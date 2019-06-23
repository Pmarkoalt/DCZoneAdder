import React, { Component } from 'react';
import './list.scss';




class List extends Component{
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
      <div id="list">
        <h5>List</h5>
      </div>
    )
  }
}

export default List;