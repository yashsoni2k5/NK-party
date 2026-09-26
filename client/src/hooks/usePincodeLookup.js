import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../api';

// Memory cache to prevent duplicate requests for the exact same PIN code
const pincodeCache = new Map();

export function usePincodeLookup(pincode, onLocationFound) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [warningMsg, setWarningMsg] = useState('');
  const [postOffices, setPostOffices] = useState([]);
  const [selectedPostOffice, setSelectedPostOffice] = useState('');

  const lastSearchedPin = useRef('');

  useEffect(() => {
    const cleanPin = String(pincode || '').trim();

    // Reset error & warning states if PIN is incomplete or invalid
    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      setErrorMsg('');
      setWarningMsg('');
      setPostOffices([]);
      setSelectedPostOffice('');
      setLoading(false);
      lastSearchedPin.current = '';
      return;
    }

    // Prevent duplicate API call if already searched for this PIN
    if (cleanPin === lastSearchedPin.current) {
      return;
    }

    const fetchPincodeDetails = async () => {
      setErrorMsg('');
      setWarningMsg('');
      setLoading(true);
      lastSearchedPin.current = cleanPin;

      // Check cache first
      if (pincodeCache.has(cleanPin)) {
        const cachedData = pincodeCache.get(cleanPin);
        handleSuccess(cachedData);
        setLoading(false);
        return;
      }

      try {
        let rawData = null;

        // Try direct Indian Postal PIN API first
        try {
          const directRes = await axios.get(`https://api.postalpincode.in/pincode/${cleanPin}`, {
            timeout: 5000
          });
          rawData = directRes.data;
        } catch (directErr) {
          // Fallback to backend proxy route
          const backendRes = await api.get(`/address/pincode/${cleanPin}`);
          rawData = backendRes.data;
        }

        if (
          Array.isArray(rawData) &&
          rawData[0] &&
          rawData[0].Status === 'Success' &&
          Array.isArray(rawData[0].PostOffice) &&
          rawData[0].PostOffice.length > 0
        ) {
          pincodeCache.set(cleanPin, rawData[0].PostOffice);
          handleSuccess(rawData[0].PostOffice);
        } else {
          setErrorMsg('Please enter a valid PIN code.');
        }
      } catch (err) {
        console.warn('Pincode Lookup Error:', err);
        setWarningMsg('Unable to verify PIN code right now. You can enter your address manually.');
      } finally {
        setLoading(false);
      }
    };

    const handleSuccess = (poList) => {
      setPostOffices(poList);
      if (poList.length > 0) {
        const primary = poList[0];
        const city = primary.District || primary.Circle || primary.Block || '';
        const state = primary.State || '';

        onLocationFound({
          city,
          state,
          postOfficeList: poList
        });
      }
    };

    // Debounce slightly by 300ms
    const timer = setTimeout(() => {
      fetchPincodeDetails();
    }, 300);

    return () => clearTimeout(timer);
  }, [pincode]);

  const handleSelectLocality = (poName) => {
    setSelectedPostOffice(poName);
    const found = postOffices.find(po => po.Name === poName);
    if (found) {
      const city = found.District || found.Circle || found.Block || '';
      const state = found.State || '';
      onLocationFound({
        city,
        state,
        area: found.Name,
        postOfficeList: postOffices
      });
    }
  };

  return {
    loading,
    errorMsg,
    warningMsg,
    postOffices,
    selectedPostOffice,
    handleSelectLocality
  };
}
