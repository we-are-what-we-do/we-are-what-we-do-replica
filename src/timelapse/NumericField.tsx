import { Theme, ThemeProvider, createTheme } from "@mui/material";
import TextField from "@mui/material/TextField/TextField";
import { CSSProperties } from "react";

type P = {
  state: string;
  setState: React.Dispatch<React.SetStateAction<string>>,
  label?: string;
  style?: CSSProperties;
  required?: boolean;
  fullWidth?: boolean;
};

// カスタムテーマを作成
const theme: Theme = createTheme({
  palette: {
    text: {
      primary: '#FFF' // 非フォーカス時のテキスト色
    }
  }
});


export function NumericField(props: P) {

  const onChangeHandle = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const result = Math.abs(Number(e.target.value)).toString();

    if (result === "NaN") {
      props.setState("");
    } else {
      props.setState(result);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <TextField
        fullWidth={props.fullWidth}
        required={props.required}
        value={props.state}
        onChange={onChangeHandle}
        label={props.label}
        style={props.style}
        inputProps={{
          inputMode: "numeric",
          pattern: "[0-9]*"
        }}
        sx={{
          '& .MuiInputLabel-root': {
            color: '#1976D2', // ラベルの色（デフォルトは青色）
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9e9e9e', // 非フォーカス時の枠線色
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#FFF', // ホバー時の枠線色
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976D2', // フォーカス時の枠線色
          },
        }}
      />
    </ThemeProvider>
  );
}