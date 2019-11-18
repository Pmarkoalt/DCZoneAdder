import React, { Component } from 'react';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Select from 'react-select';


import zones from '../../zones.json';
import uses from '../../uses_selector.json';


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
      this.selected_zone = {};
      this.selected_use = {};
      this.handleChange = this.handleChange.bind(this);
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
    handleChange(selectedOption, type){
      if (type === 'zone') {
        this.setState({
          ...this.state,
          selected_zone: selectedOption
        })
      } else if (type === 'use') {
        this.setState({
          ...this.state,
          selected_use: selectedOption
        })
      }
    };
    handleToggle(type) {
      const { zone_chips, use_chips } = this.props;
      // Default to Zone
      let currentIndex = zone_chips.indexOf(this.state.selected_zone);
      let newChips = zone_chips;
      let selected = this.state.selected_zone;
      // Change value if type use
      if (type === 'use') {
        currentIndex = use_chips.indexOf(this.state.selected_use);
        newChips = use_chips;
        selected = this.state.selected_use
      }
      if (currentIndex === -1) {
        newChips.push(selected);
      } else {
        newChips.splice(currentIndex, 1);
      }
      this.props.handleToggleChip(newChips, type);
    }
    render(){
        return(
          <div id="chip-section-container">
            <div className="chip-section">
              <label className="label">Zones:</label>
              <div id="chip-container">
                {this.props.zone_chips ? this.props.zone_chips.map((chip, i) => {
                  return (
                    <Chip
                      key={i}
                      variant="outlined"
                      size="small"
                      label={chip.label}
                      onDelete={() => {this.props.handleDeleteChip(chip, 'zone')}}
                      className="chip"
                      color="primary"
                    /> 
                  )
                }) : ''}
              </div>
              <Select
                className="select"
                isSearchable="true"
                onChange={(event) => this.handleChange(event, 'zone')}
                placeholder="Type to filter..."
                options={zones}
              />
              <Button className="section-one-button" 
                variant="contained" 
                color="secondary" 
                onClick={() => {this.handleToggle('zone')}}>
                    Add Zone
              </Button>
            </div>
            <div className="chip-section">
              <label className="label">Uses: </label>
              <div id="chip-container">
                {this.props.use_chips ? this.props.use_chips.map((chip, i) => {
                  return (
                    <Chip
                      key={i}
                      variant="outlined"
                      size="small"
                      label={chip.label}
                      onDelete={() => {this.props.handleDeleteChip(chip, 'use')}}
                      className="chip"
                      color="primary"
                    /> 
                  )
                }) : ''}
              </div>
              <Select
                className="select"
                isSearchable="true"
                onChange={(event) => this.handleChange(event, 'use')}
                placeholder="Type to filter..."
                options={uses}
              />
              <Button className="section-one-button" 
                variant="contained" 
                color="secondary" 
                onClick={() => {this.handleToggle('use')}}>
                    Add Use
              </Button>
            </div>
          </div>
        )
    }
}
export default ChipFilter;