import React, { Component } from 'react';
import './create_csv.scss';




class CreateCsv extends Component{
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
      <div id="create-csv">
        <h5>Create CSV</h5>
      </div>
    )
  }
}

export default CreateCsv;