import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {CircularProgress, FormHelperText} from '@material-ui/core';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  centered: {
    display: 'flex',
    width: '100%',
    justifyContent: 'center',
    alignContent: 'center',
    margin: '10px 0',
  },
});

export default function BasicTable(props) {
  const classes = useStyles();

  const header = props.header || [];
  const rows = props.rows || [];

  return (
    <TableContainer component={Paper}>
      {props.loading ? (
        <div className={classes.centered}>
          <CircularProgress />
        </div>
      ) : (
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              {header.map((h) => {
                return <TableCell key={h}>{h}</TableCell>;
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <h3 className={classes.centered}>No results</h3>
            ) : (
              rows.map((row, index) => (
                <TableRow key={index}>
                  {header.map((h) => {
                    return (
                      <TableCell key={h} align="right">
                        {row[h]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}
