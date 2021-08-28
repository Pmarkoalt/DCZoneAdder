import React, {useState, useCallback, useEffect} from 'react';
import csvparse from 'csv-parse/lib/sync';
import FileDrop from './FileDrop';
import Button from '@material-ui/core/Button';
import {filterEntitiesTask} from './utils';
import {Tabs} from '../../Components/tabs';

import './styles.scss';

const validateCSV = (csvData) => {
  if (!csvData.length) return;
  const hasOwnerName = 'Owner Name' in csvData[0];
  const hasOwnerName1 = 'Owner Name 1' in csvData[0];
  if (!hasOwnerName && !hasOwnerName1) {
    return "CSV file(s) must include the field 'Owner Name' or 'Owner Name 1'";
  }
};

const CreateJob = () => {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadText, setUploadText] = useState();
  const [error, setError] = useState();
  const [valid, setValid] = useState(false);
  const [meta, setMeta] = useState({exportFileName: undefined, csvExportFields: []});
  const setExportFileName = useCallback((event) => {
    const name = event.target ? event.target.value : null;
    if (name) {
      setMeta((m) => ({...m, exportFileName: name}));
    }
  }, []);
  useEffect(() => {
    setValid((files && files.length > 0) || (uploadText && uploadText.trim().length));
  }, [files, uploadText]);
  return (
    <div id="section-one">
      <h2>Please provide a CSV File To Process</h2>
      <Tabs
        style={{width: '100%'}}
        tabs={[
          {
            label: 'File Upload',
            component: <FileDrop createFile={(newFile) => setFiles((f) => [...f, newFile])} files={files} />,
          },
          {
            label: 'Copy/Paste',
            component: (
              <textarea
                style={{resize: 'none', width: '100%', minHeight: '300px'}}
                onChange={(event) => setUploadText(event.target.value)}
              />
            ),
          },
        ]}
      />
      {error && (
        <div className="csv-upload-error-container">
          <span className="csv-upload-error">{error}</span>
          <span className="csv-upload-error-clear" onClick={() => setError(undefined)}>
            Clear
          </span>
        </div>
      )}
      <div id="submit-file-container">
        <label className="export-filename">
          <span>CSV Export Filename:</span>
          <input type="text" onChange={setExportFileName} />
        </label>
        <Button
          className="section-one-button"
          variant="contained"
          disabled={Boolean(!valid || uploading || error)}
          color="primary"
          onClick={async () => {
            try {
              setError(undefined);
              setUploading(true);
              let data;
              if (files && files.length > 0) {
                data = files.reduce((acc, file) => {
                  const sanitizedData = file.data.replaceAll('="', '"');
                  const parsed = csvparse(sanitizedData, {columns: true});
                  return [...acc, ...parsed];
                }, []);
                const validationError = validateCSV(data);
                if (validationError) {
                  setError(validationError);
                  setFiles([]);
                  setUploading(false);
                  return;
                }
              } else if (uploadText && uploadText.trim().length) {
                data = uploadText
                  .split('\n')
                  .filter((x) => x && x.trim().length)
                  .map((address) => ({Address: address.trim()}));
              } else {
                // need at least a file or manual text input
                setUploading(false);
                return;
              }
              try {
                await filterEntitiesTask(data, meta.exportFileName);
              } catch (e) {
                setError('Failed to run task, please try again.');
              }
            } catch (e) {
              console.log(e);
              setError(`Error processing file: ${e}`);
            } finally {
              setUploading(false);
            }
          }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </div>
    </div>
  );
};

export default CreateJob;
