import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

function Header(props){
  return(
    <div id="header">
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" id="menuButton" color="inherit" aria-label="Menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" id="title">
            DC Zone Adder
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default Header