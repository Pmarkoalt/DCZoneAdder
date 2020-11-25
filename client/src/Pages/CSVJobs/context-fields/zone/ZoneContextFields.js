import React, {useState, useCallback, useEffect} from 'react';
import Chip from '@material-ui/core/Chip';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from 'react-select';
import zonesList from './zones.json';
import usesList from './uses_selector.json';

const ZoneContextFields = ({onUpdate}) => {
  const [selectedZone, setSelectedZone] = useState();
  const [zones, setZones] = useState([]);
  const [selectedUse, setSelectedUse] = useState();
  const [uses, setUses] = useState([]);
  const [searchZillow, setSearchZillow] = useState(false);
  useEffect(() => {
    onUpdate({
      zones: zones.map((z) => z.value),
      uses: uses.map((u) => u.value),
      searchZillow,
    });
  }, [zones, uses, searchZillow, onUpdate]);
  return (
    <div id="chip-section-container">
      <FormControlLabel
        labelPlacement="start"
        label="Search Zillow API?"
        control={<Checkbox onChange={(event) => setSearchZillow(event.target.checked)} checked={searchZillow} />}
      />
      <div className="chip-section">
        <label className="label">Zones:</label>
        <div id="chip-container">
          {zones
            ? zones.map((chip, i) => {
                return (
                  <Chip
                    key={chip.label}
                    variant="outlined"
                    size="small"
                    label={chip.label}
                    onDelete={() => {
                      setZones((zones) => zones.filter((z) => z.value !== chip.value));
                    }}
                    className="chip"
                    color="primary"
                  />
                );
              })
            : ''}
        </div>
        <Select
          className="select"
          isSearchable="true"
          onChange={(zone) => setSelectedZone(zone)}
          placeholder="Type to filter..."
          options={zonesList}
        />
        <Button
          className="section-one-button"
          variant="contained"
          color="secondary"
          disabled={!selectedZone}
          onClick={() => {
            setZones((zones) => [...zones, selectedZone]);
            setSelectedZone(undefined);
          }}>
          Add Zone
        </Button>
      </div>
      <div className="chip-section">
        <label className="label">Uses: </label>
        <div id="chip-container">
          {uses
            ? uses.map((chip, i) => {
                return (
                  <Chip
                    key={chip.label}
                    variant="outlined"
                    size="small"
                    label={chip.label}
                    onDelete={() => {
                      setUses((uses) => uses.filter((u) => u.value !== chip.value));
                    }}
                    className="chip"
                    color="primary"
                  />
                );
              })
            : ''}
        </div>
        <Select
          className="select"
          isSearchable="true"
          onChange={(use) => setSelectedUse(use)}
          placeholder="Type to filter..."
          options={usesList}
        />
        <Button
          className="section-one-button"
          variant="contained"
          color="secondary"
          disabled={!selectedUse}
          onClick={() => {
            setUses((uses) => [...uses, selectedUse]);
            setSelectedUse(undefined);
          }}>
          Add Use
        </Button>
      </div>
    </div>
  );
};

export default ZoneContextFields;
