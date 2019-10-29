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
        <img src="https://media.licdn.com/dms/image/C4E0BAQGPYWUaPJdSyw/company-logo_400_400/0?e=1580342400&v=beta&t=Ku19r9TbkMi2Pk36fCHZwoYfZnXH0Q_VrzflY6uGzn4" alt="Logo" />
      </div>
    )
  }
}

export default Home;