import { toast } from 'react-toastify';
import { ERROR_MESSAGES, INFO_MESSAGES } from '../MessageMap';
// import { ConfirmationToast } from './ConfirmationToast';
import { ConfirmToast } from './ConfirmationToast'


export const showErrorToast = (errorCode: string) => {
  const message = ERROR_MESSAGES[errorCode];
  toast.error(message, {autoClose: false});
};

export const showInfoToast = (infoCode: string) => {
  const message = INFO_MESSAGES[infoCode];
  toast.info(message, {autoClose: false});
};

export const showConfirmToast = async () => {
  return new Promise<boolean>((resolve) => {
    toast(
      <ConfirmToast
        onYes={() => {
          toast.dismiss();
          // console.log("Yes was clicked");
          resolve(true);
        }}
        onNo={() => {
          toast.dismiss();
          // console.log("No was clicked");
          resolve(false);
        }}
      />,
      {
        autoClose: false, // トーストを自動的に閉じない
        className: "custom-confirm",
        onClose: () => {
          // TODO 本番環境ではコメントアウトを解除する
          // Toastが閉じられたときに実行したい処理をここに記述
          // resolve(false);
        }
      }
    );
  });
};