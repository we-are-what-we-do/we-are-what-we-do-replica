import React from 'react';
import { INFO_MESSAGES } from '../MessageMap';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

interface ConfirmToastProps {
  onYes: () => void;
  onNo: () => void;
}

const messageI004 = INFO_MESSAGES.I004;
const messageI004y = INFO_MESSAGES.I004y;
const messageI004n = INFO_MESSAGES.I004n;

export const ConfirmToast: React.FC<ConfirmToastProps> = ({ onYes, onNo }) => {
  return(
    <Grid container
      spacing={3}
      direction="column"
      alignItems="center"
    >
      <Grid item xs={12}>
        <div className="message">{messageI004}</div>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          onClick={onYes}
          style={{width: "10rem"}}
        >
          {messageI004y}
        </Button>
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="outlined"
          onClick={onNo}
          style={{width: "10rem", backgroundColor: "white"}}
        >
          {messageI004n}
        </Button>
      </Grid>
    </Grid>
  );
};

export default ConfirmToast;