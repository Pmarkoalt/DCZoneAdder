import React, { Component } from 'react';
import './document_details.scss';




class DocumentDetails extends Component{
  constructor(props) {
    super(props)
    this.state = {
      date: new Date()
    }
  }
  componentDidMount(){
    const { match: { params } } = this.props;
    this.setState({
      ...this.state,
      params
    });
    console.log(params);
  }

  render(){
    return(
      <div id="document-details">
        <h5>Document Details {this.state.params ? this.state.params.id : 'Not a valid URLs'}</h5>
      </div>
    )
  }
}

export default DocumentDetails;