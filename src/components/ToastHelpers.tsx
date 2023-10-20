import { toast } from 'react-toastify';
import { ERROR_MESSAGES, INFO_MESSAGES } from '../MessageMap';
// import { ConfirmationToast } from './ConfirmationToast';
import { ConfirmToast } from './ConfirmationToast'

export const showErrorToast = (errorCode: string) => {
  const message = ERROR_MESSAGES[errorCode];
  toast.error(message, {autoClose: false, theme: "colored"});
};

export const showWarnToast = (infoCode: string) => {
  const message = INFO_MESSAGES[infoCode];
  toast.warn(message, {autoClose: false, theme: "colored"});
};

export const showInfoToast = (infoCode: string) => {
  const message = INFO_MESSAGES[infoCode];
  toast.info(message, {autoClose: false, theme: "colored"});
};

export const showSuccessToast = (infoCode: string) => {
  const message = INFO_MESSAGES[infoCode];
  toast.success(message, {autoClose: false, theme: "colored"});
};

export const showConfirmToast = async () => {
  // const dispatch = useDispatch<AppDispatch>();
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

export const showTestToast = (messages: string[], isInPin: boolean) => {
  const elm: JSX.Element = (
    <div>
      {messages.map(message => (
        <>
          {message}
          <br/>
        </>
      ))}
    </div>
  );

  const config: object = {autoClose: false};

  if(isInPin){
    toast.info(elm, config);
  }else{
    toast.error(elm, config);
  }
};