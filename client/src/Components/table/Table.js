import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import Paper from '@material-ui/core/Paper';
import {CircularProgress, TableFooter} from '@material-ui/core';
import TablePaginationActions from './Pagination';

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
  // const [page, setPage] = useState(0);
  // const [rowsPerPage, setRowsPerPage] = useState(25);

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
                return (
                  <TableCell key={h} style={{fontWeight: 'bold'}}>
                    {h}
                  </TableCell>
                );
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
          {/* <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                // colSpan={3}
                count={props.count}
                rowsPerPage={rowsPerPage}
                ActionsComponent={TablePaginationActions}
                page={page}
                onChangePage={(e, page) => setPage(page)}
                onChangeRowsPerPage={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}></TablePagination>
            </TableRow>
          </TableFooter> */}
        </Table>
      )}
    </TableContainer>
  );
}
