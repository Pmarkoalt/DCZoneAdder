import React, {useState, useCallback, useEffect} from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const OpenDataContextFields = ({onUpdate}) => {
  const [searchZillow, setSearchZillow] = useState(false);
  useEffect(() => {
    onUpdate({
      searchZillow,
    });
  }, [searchZillow, onUpdate]);
  return (
    <div id="chip-section-container">
      <FormControlLabel
        labelPlacement="start"
        label="Search Zillow API?"
        control={<Checkbox onChange={(event) => setSearchZillow(event.target.checked)} checked={searchZillow} />}
      />
    </div>
  );
};

export default OpenDataContextFields;
