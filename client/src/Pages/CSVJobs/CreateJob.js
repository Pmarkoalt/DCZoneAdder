import React, {useState, useCallback, useEffect} from 'react';
import csvparse from 'csv-parse/lib/sync';
import FileDrop from './FileDrop';
import Button from '@material-ui/core/Button';
import {createJobFromSocket} from './utils';
import io from 'socket.io-client';
import ExportFieldSelect from '../../Components/ExportFieldSelect';
import {getExportFieldList} from '../../Components/ExportFieldSelect/export_fields';
import {getContextFieldsComponent} from './context-fields';
import {Tabs} from '../../Components/tabs/';

import './styles.scss';
import {useParams} from 'react-router-dom';

const CreateJob = () => {
  const {jobType} = useParams();
  const [uploading, setUploading] = useState(false);
  const [socket, setSocket] = useState(() => {});
  useEffect(() => {
    const s = io.connect();
    setSocket(s);
    return () => s.close();
  }, []);
  const [files, setFiles] = useState([]);
  const [uploadText, setUploadText] = useState();
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
    setValid((files && files.length > 0) || (uploadText && uploadText.trim().length));
  }, [files, uploadText]);
  return (
    <div id="section-one">
      <h2>Please provide a CSV File To Create a new Job</h2>
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
          disabled={Boolean(!valid || uploading || error)}
          color="primary"
          onClick={async () => {
            try {
              setError(undefined);
              setUploading(true);
              let data;
              if (files && files.length > 0) {
                data = files.reduce((acc, file) => {
                  const parsed = csvparse(file.data, {columns: true});
                  return [...acc, ...parsed];
                }, []);
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
              const job = await createJobFromSocket(socket, jobType, data, meta, context);
              console.log(job);
              if (job) {
                window.location.href = `/jobs/${job.id}`;
              } else {
                setError('Failed to create job, please try again.');
              }
            } catch (e) {
              console.log(e);
              setError(`Error creating job: ${e}`);
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
