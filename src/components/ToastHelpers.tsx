import { toast } from 'react-toastify';
import { ERROR_MESSAGES, INFO_MESSAGES } from '../MessageMap';
// import { ConfirmationToast } from './ConfirmationToast';
import { ConfirmToast } from './ConfirmationToast'


export const showErrorToast = (errorCode: string) => {
  const message = ERROR_MESSAGES[errorCode];
  toast.error(message);
};

export const showInfoToast = (infoCode: string) => {
  const message = INFO_MESSAGES[infoCode];
  toast.info(message);
};

export const showConfirmToast = async () => {
  return new Promise<boolean>((resolve) => {
    toast(
      <ConfirmToast
        onYes={() => {
          toast.dismiss();
          console.log("Yes was clicked");
          resolve(true);
        }}
        onNo={() => {
          toast.dismiss();
          console.log("No was clicked");
          resolve(false);
        }}
        onDismiss={() => {
          console.log("Nothing was clicked");
          resolve(false);
        }}
      />,
      {
        autoClose: false, // トーストを自動的に閉じない
      }
    );
  });
};