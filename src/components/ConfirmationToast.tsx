import React from 'react';
import { INFO_MESSAGES } from '../MessageMap';

interface ConfirmToastProps {
  onYes: () => void;
  onNo: () => void;
}

const messageI004 = INFO_MESSAGES.I004;
const messageI004y = INFO_MESSAGES.I004y;
const messageI004n = INFO_MESSAGES.I004n;

export const ConfirmToast: React.FC<ConfirmToastProps> = ({ onYes, onNo }) => {
  return(
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px', marginBottom: '30px' }}>
      <p style={{ marginBottom: '30px' }}>{messageI004}</p>
      <button style={{ marginBottom: '30px' }} onClick={onYes}>{messageI004y}</button>
      <button onClick={onNo}>{messageI004n}</button>
    </div>
  );
};

export default ConfirmToast;