import React, { Component } from 'react';
import Dropzone from 'react-dropzone'
import './section_one.scss';



class FileDrop extends Component{
    constructor(props) {
      super(props)
      this.state = {
        files: [],
      }
      this.handleDrop = this.handleDrop.bind(this);
      this.createFileObject = this.createFileObject.bind(this);
    }
    componentDidMount(){
  
    }
    handleDrop(acceptedFiles) {
      const reader = new FileReader();
      for (let i=0; i < acceptedFiles.length; i++) {
        if (acceptedFiles[i].name.includes('.csv')) {
          reader.onloadend = (function(file, createFileObject) {
            return function(evt) {
              createFileObject(evt, file)
            };
          })(acceptedFiles[i], this.createFileObject);
          reader.readAsText(acceptedFiles[i]);
        }
      }
    }
    createFileObject(event,file) {
      this.props.createFile({
          data: event.target.result,
          name: file.name
      })
    }
    render(){
      return(
        <div id="dropzone-container">
          <Dropzone onDrop={acceptedFiles => this.handleDrop(acceptedFiles)}>
          {({getRootProps, getInputProps}) => (
            <section id="dropzone">
              <div id="dropzoneTextBox" {...getRootProps()}>
                <input {...getInputProps()} />
                <p id="dropzoneText">Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
          </Dropzone>
          <div id="file-list-container">
            <h3>Files:</h3>
            {this.props.files.map((file, index) => {
            return (
              <p key={index} className="file-name">{file.name}</p>
            )
            })}
          </div>
        </div>
      )
    }
  }
  
  export default FileDrop;