import React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {Tooltip} from '@material-ui/core';

function LinearProgressWithLabel(props) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      {props.tooltip ? (
        <Tooltip title={props.tooltip} style={{fontSize: '2em'}} placement="right-end">
          <Box minWidth={35}>
            <Typography variant="body2" color="textSecondary">{`${Math.round(props.value)}%`}</Typography>
          </Box>
        </Tooltip>
      ) : (
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(props.value)}%`}</Typography>
        </Box>
      )}
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
  tooltip: PropTypes.string,
};

export default LinearProgressWithLabel;
