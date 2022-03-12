import React from 'react';
import {Link} from 'react-router-dom';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

function Header(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  return (
    <div id="header">
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" id="menuButton" color="inherit" aria-label="Menu" onClick={handleClick}>
            <MenuIcon />
          </IconButton>
          <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
            <Link to="/">
              <MenuItem onClick={handleClose}>Home</MenuItem>
            </Link>
            <Link to="/jobs">
              <MenuItem onClick={handleClose}>View Job List</MenuItem>
            </Link>
            <Link to="/jobs/create/zone">
              <MenuItem onClick={handleClose}>Create New Zone CSV</MenuItem>
            </Link>
            <Link to="/jobs/create/belles">
              <MenuItem onClick={handleClose}>Create New Belles Link CSV</MenuItem>
            </Link>
            <Link to="/jobs/create/open-data-dc">
              <MenuItem onClick={handleClose}>Create New Open Data DC CSV</MenuItem>
            </Link>
            <Link to="/jobs/create/open-data-fc">
              <MenuItem onClick={handleClose}>Create New Franklin County Open Data CSV</MenuItem>
            </Link>
            <Link to="/open-data">
              <MenuItem onClick={handleClose}>Make Single OpenDataDC Request</MenuItem>
            </Link>
            <Link to="/entity-filter">
              <MenuItem onClick={handleClose}>Group Records Into Individuals & Entities</MenuItem>
            </Link>
            <Link to="/franklin-county">
              <MenuItem onClick={handleClose}>Franklin County</MenuItem>
            </Link>
          </Menu>
          <Typography variant="h6" id="title">
            DC Zone Builder
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Header;
