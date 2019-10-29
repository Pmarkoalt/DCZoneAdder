import React, { Component } from 'react';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';


import zones from '../../zones';

import './section_one.scss';
const modalStyle = {
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
};


class ChipFilter extends Component{
    constructor(props) {
      super(props)
      this.state = {
        open: false,
      }
      this.handleClose = this.handleClose.bind(this);
      this.handleOpen = this.handleOpen.bind(this);
      this.handleToggle = this.handleToggle.bind(this);
    }

    handleClose() {
      this.setState({
        ...this.state,
        open: false
      })
    }
    handleOpen() {
      this.setState({
        ...this.state,
        open: true
      })
    }
    handleToggle(value) {
      const { chips } = this.props;
      const currentIndex = chips.indexOf(value);
      const newChips = chips;
      if (currentIndex === -1) {
        newChips.push(value);
      } else {
        newChips.splice(currentIndex, 1);
      }
      this.props.handleToggleChip(newChips);
    }
    ZoneList() {
      return zones.map((value, index) => {
        return (
          <ListItem key={index} dense button onClick={() => {this.handleToggle(value)}}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={this.props.chips.indexOf(value) !== -1}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText id={index} primary={value} />
          </ListItem>
        )
      })
    }

    render(){
        return(
          <div id="chip-section">
            <label>Zones:</label>
            <div id="chip-container">
              {this.props.chips ? this.props.chips.map((chip, i) => {
                return (
                  <Chip
                    key={i}
                    variant="outlined"
                    size="small"
                    label={chip}
                    onDelete={() => {this.props.handleDeleteChip(chip)}}
                    className="chip"
                    color="primary"
                  /> 
                )
              }) : ''}
            </div>
            <Button className="section-one-button" variant="contained" color="secondary" onClick={() => {this.handleOpen()}}>
                  Add Filters
            </Button>
            <Modal
              aria-labelledby="simple-modal-title"
              aria-describedby="simple-modal-description"
              open={this.state.open}
              onClose={() => {this.handleClose()}}
            >
              <div style={modalStyle} id="modal-div">
                <h2 id="simple-modal-title">Add Zone Filters</h2>
                <List>
                  {this.ZoneList()}
                </List>
              </div>
           </Modal>
          </div>            
        )
    }
}
export default ChipFilter;