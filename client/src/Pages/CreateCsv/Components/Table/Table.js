import React, { Component } from 'react';
import { withStyles, mergeClasses } from '@material-ui/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    width: "100%",
    overflowX: "auto"
  },
  head: {
    backgroundColor: "#fff",
    position: "sticky",
    top: 0
  }
});

class VerifyTable extends Component{
  constructor(props) {
    super(props)
    this.state = {
      keys: []
    }
    this.titleCase = this.titleCase.bind(this);
  }
  componentWillMount() {
    const key_set = new Set();
    if (this.props.data) {
      this.props.data.map((event) => {
        const keys = Object.keys(event);
        keys.map(key => {
          if (!key_set.has(key)){
            key_set.add(key);
          }
        });
      });
    }
    const key_array = Array.from(key_set);
    this.setState({
      ...this.state,
      keys: key_array
    });
  }
  titleCase(str){
    str = str.toLowerCase().split(/[\s_]+/);
    let final = [ ];
    for(let  word of str){
      final.push(word.charAt(0).toUpperCase()+ word.slice(1));
    }
    return final.join(' ')
  }
  createRow(row, index) {
    return (
      <TableRow key={index}>
        <TableCell component="th" scope="row">
          {index}
        </TableCell>
        {this.state.keys.map((key, i) => {
          return (
            <TableCell key={i} align="right">{row[key] ? row[key] : ''}</TableCell>
          )
        })}
      </TableRow>
    )
  }

  render(props){
    const { classes } = this.props;
    return (
      <Paper id="table-container">
        <Table id="table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.head} key='0'>ID</TableCell>
              {this.state.keys.map((key, index) => {
                return (
                  <TableCell key={index + 1} className={classes.head} align="right">{this.titleCase(key)}</TableCell>
                )
              })}
            </TableRow>
          </TableHead>
          <TableBody>
              {this.props.data.map((row, index) => {
                return this.createRow(row, index);
              })}
          </TableBody>
        </Table>
      </Paper>
    );
  }
}
export default withStyles(styles)(VerifyTable);
