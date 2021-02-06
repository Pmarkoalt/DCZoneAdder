import React, {useEffect, useState, useCallback} from 'react';
import styled from 'styled-components';
import {Table} from '../../Components/table/';
import {fetchOpenDataDCData} from './utils.js';

const ODDCRequestForm = () => {
  const [ssl, setSSL] = useState();
  const [address, setAddress] = useState();
  const [data, setData] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const fetchODDCDate = useCallback(() => {
    setData(undefined);
    setLoading(true);
    fetchOpenDataDCData(ssl, address)
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  }, [ssl, address]);

  return (
    <div>
      <input type="text" placeholder="SSL" onChange={(e) => setSSL(e.target.value)} />
      <input type="text" placeholder="Address" onChange={(e) => setAddress(e.target.value)} />
      <button disabled={!ssl && !address} onClick={fetchODDCDate}>
        Fetch OpenDataDC Data
      </button>
      {loading && <div>LOADING</div>}
      {data && <Table header={Object.keys(data)} rows={[data]} />}
    </div>
  );
};
export default ODDCRequestForm;
