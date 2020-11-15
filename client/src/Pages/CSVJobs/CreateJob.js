import React, {useState, useCallback, useEffect} from 'react';
import csvparse from 'csv-parse/lib/sync';
import FileDrop from './FileDrop';
import Button from '@material-ui/core/Button';
import {createCSVJob} from './utils';
import ExportFieldSelect from '../../Components/ExportFieldSelect';
import {getExportFieldList} from '../../Components/ExportFieldSelect/export_fields';
import {getContextFieldsComponent} from './context-fields';

import './styles.scss';

const CreateJob = ({jobType = 'zone'}) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState();
  const [valid, setValid] = useState(false);
  const [context, setContext] = useState({});
  const [meta, setMeta] = useState({exportFileName: undefined, csvExportFields: []});
  const setExportFileName = useCallback((event) => {
    const name = event.target ? event.target.value : null;
    if (name) {
      setMeta((m) => ({...m, exportFileName: name}));
    }
  }, []);
  const addCSVExportField = useCallback((field) => {
    setMeta((m) => {
      const fields = [...m.csvExportFields, field];
      return {
        ...m,
        csvExportFields: fields,
      };
    });
  }, []);
  const removeCSVExportField = useCallback((field) => {
    setMeta((m) => {
      const fields = m.csvExportFields.filter((f) => f !== field);
      return {
        ...m,
        csvExportFields: fields,
      };
    });
  }, []);
  const ContextFieldsComponent = getContextFieldsComponent(jobType);
  useEffect(() => {
    setValid(files && files.length > 0);
  }, [files]);
  console.log({context, meta});
  return (
    <div id="section-one">
      <h2>Please provide a CSV File To Create a new Job</h2>
      <FileDrop createFile={(newFile) => setFiles((f) => [...f, newFile])} files={files} />
      {error && (
        <div>
          <span className="csv-upload-error">{error}</span>
          <span className="csv-upload-error-clear" onClick={() => setError(undefined)}>
            Clear
          </span>
        </div>
      )}
      {ContextFieldsComponent && <ContextFieldsComponent onUpdate={setContext} />}
      <ExportFieldSelect
        fields={getExportFieldList(jobType, context)}
        selectedFields={meta.csvExportFields}
        onSelect={addCSVExportField}
        onRemove={removeCSVExportField}
      />
      <div id="submit-file-container">
        <label className="export-filename">
          <span>CSV Export Filename:</span>
          <input type="text" onChange={setExportFileName} />
        </label>
        <Button
          className="section-one-button"
          variant="contained"
          disabled={!valid}
          color="primary"
          onClick={async () => {
            const data = files.reduce((acc, file) => {
              const parsed = csvparse(file.data, {columns: true});
              return [...acc, ...parsed];
            }, []);
            const job = await createCSVJob(jobType, data, meta, context);
            console.log(job);
            if (job) {
              window.location.href = `/jobs/${job.id}`;
            } else {
              setError('Failed to create job, please try again.');
            }
          }}>
          Upload
        </Button>
      </div>
    </div>
  );
};

export default CreateJob;
