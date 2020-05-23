import React, {useState, useEffect} from 'react';
import Table from '../Table/Table';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ExportFieldSelect from './ExportFieldSelect';
import {baseFields, zillowFields} from './export_fields';


export default ({data, jobName, searchZillow, processCSV, setZillowFlag, selectedFields, handleAddExportField, handleRemoveExportField}) => {
  const [exportFieldList, setExportFieldList] = useState([...baseFields, ...zillowFields]);
  useEffect(() => {
    if (searchZillow) {
      setExportFieldList([...baseFields, ...zillowFields]);
    } else {
      setExportFieldList([...baseFields]);
    }
  }, [searchZillow]);
  return (
    <div id="section-two">
      {jobName && <h2>{jobName}</h2>}
      <h4>Please Verify This Data is Correct and Then Submit</h4>
      <Table data={data} />
      <ExportFieldSelect fields={exportFieldList} selectedFields={selectedFields} onSelect={handleAddExportField} onRemove={handleRemoveExportField} />
      <div className="section-actions">
        <div id="section-two-zillow">
          <FormControlLabel
            value="start"
            control={
              <Checkbox
                checked={searchZillow}
                onChange={setZillowFlag}
              />
            }
            label="Search Zillow API?"
            labelPlacement="start"
          />
        </div>
        <Button id="section-two-submit" variant="contained" color="primary" onClick={processCSV}>
          Submit
        </Button>
      </div>
    </div>
  )
}