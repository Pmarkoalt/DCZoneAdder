import React, { useState, useCallback } from 'react';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Select from 'react-select';

export default ({selectedFields=[], onRemove, onSelect, fields=[]}) => {
  const [selection, setSelection] = useState();
  const handleSelect = useCallback(() => {
    if (selection) {
      onSelect(selection.value);
      setSelection(undefined);
    }
  }, [selection, onSelect, setSelection]);
  return (
    <div id="export-field-container">
      <label className="label">Custom Fields:</label>
      <span>
        Select a custom subset of fields and the order that you
        would like them to appear in the CSV export. Selecting no
        fields will return all available fields from the API.
      </span>
      <div className="export-field-form">
        <div className="top-row">
          <div className="export-field-chip-display">
            {selectedFields.map((field) => {
              return (
                <Chip
                  key={field}
                  variant="outlined"
                  size="small"
                  label={field}
                  onDelete={() => onRemove(field)}
                  className="chip"
                  color="primary"
                /> 
              )
            })}
          </div>
          <label className="preset-label">Presets:</label>
          <Select
            className="select"
            isSearchable="true"
            placeholder="Type to filter..."
            options={[]}
          />
        </div>
        <div className="export-field-controls">
          <Select
            className="select"
            isSearchable="true"
            onChange={setSelection}
            placeholder="Type to search for fields..."
            options={fields.filter(x => !selectedFields.includes(x)).map(x => ({label: x, value: x}))}
          />
          <Button className="section-one-button" 
            variant="contained" 
            color="secondary" 
            disabled={!selection}
            onClick={handleSelect}>
                Add Field
          </Button>
        </div>
      </div>
    </div>
  );
}

