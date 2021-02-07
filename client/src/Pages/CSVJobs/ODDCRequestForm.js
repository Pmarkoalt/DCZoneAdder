import React, {useState, useCallback} from 'react';
import styled from 'styled-components';
import {Table} from '../../Components/table/';
import {fetchOpenDataDCData} from './utils.js';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 3em;
`;

const Form = styled.form`
  min-height: 300px;
  min-width: 600px;
  max-width: 90%;
  border: 1px tomato black;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 2px 2px 5px gray;
`;

const InputFields = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  max-width: 600px;
  margin: 10px;

  * + * {
    margin-left: 10px;
  }
`;

const ODDCRequestForm = () => {
  const [ssl, setSSL] = useState();
  const [address, setAddress] = useState();
  const [data, setData] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);
  const fetchODDCData = useCallback(
    (event) => {
      event.preventDefault();
      if ((!ssl || ssl.trim() === '') && (!address || address.trim() === '')) return;
      setError(undefined);
      setData(undefined);
      setLoading(true);
      fetchOpenDataDCData(ssl, address)
        .then((data) => setData(data))
        .catch((error) => setError(error))
        .finally(() => setLoading(false));
    },
    [ssl, address],
  );

  return (
    <PageContainer>
      <Form onSubmit={fetchODDCData}>
        <InputFields>
          <input type="text" placeholder="SSL" onChange={(e) => setSSL(e.target.value)} />
          <input type="text" placeholder="Address" onChange={(e) => setAddress(e.target.value)} />
          <input type="submit" value="Fetch OpenDataDC Data" disabled={(!ssl && !address) || loading} />
        </InputFields>
        {loading && <div>LOADING</div>}
        {error && <div>{JSON.stringify(error)}</div>}
        {data && <Table header={Object.keys(data)} rows={[data]} />}
      </Form>
    </PageContainer>
  );
};
export default ODDCRequestForm;
