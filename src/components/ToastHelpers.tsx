import { toast } from 'react-toastify';
import { ERROR_MESSAGES, INFO_MESSAGES } from '../MessageMap';
// import { ConfirmationToast } from './ConfirmationToast';
import { ConfirmToast } from './ConfirmationToast'

export const showErrorToast = (errorCode: string) => {
  const message = ERROR_MESSAGES[errorCode];
  toast.error(message, {autoClose: false, theme: "colored"});
};

export const showWarnToast = (infoCode: string) => {
  const message: string[] = [...INFO_MESSAGES[infoCode]];
  toast.warn(message, {autoClose: false, theme: "colored"});
};

export const showInfoToast = (infoCode: string) => {
  const messages: string[] = [...INFO_MESSAGES[infoCode]];
  const messagesElements: JSX.Element[] = new Array;
  messages.forEach((value, index) => {
    const newElement: JSX.Element = <div>{value}</div>;
    messagesElements.push(newElement);
  })
  toast.info(
    <>{messagesElements}</>,
    {autoClose: false, theme: "colored"});
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
        closeOnClick: false,
        closeButton:  false,
        draggable:    false,
        autoClose:    false, 
        className:    "custom-confirm"
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