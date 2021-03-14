import {useState, useEffect} from 'react';
import axios from 'axios';

const validatePassword = async (password) => {
  try {
    await axios.post('/api/auth', {password});
    return true;
  } catch (e) {
    return false;
  }
};

export default () => {
  const [validated, setValidated] = useState(false);
  useEffect(() => {
    let password = sessionStorage.getItem('app.password');
    while (!password) {
      password = prompt('Credentials:');
    }
    (async () => {
      if (await validatePassword(password)) {
        sessionStorage.setItem('app.password', password);
        setValidated(true);
      } else {
        alert('auth failed');
        sessionStorage.removeItem('app.password');
      }
    })();
  }, []);
  return validated;
};
