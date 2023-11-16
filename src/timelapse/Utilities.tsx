import { Button, FormControlLabel, FormGroup, Switch } from "@mui/material";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { NumericField } from "./NumericField";


export default function Utilities({props}: {props: {
    setUiVisible: React.Dispatch<React.SetStateAction<0 | 1 | 2>>;
    playbackSpeed: string;
    setPlaybackSpeed: React.Dispatch<React.SetStateAction<string>>;
    enableMovingTorus: boolean;
    setEnableMovingTorus: React.Dispatch<React.SetStateAction<boolean>>;
    backgroundImageVisible: boolean;
    setBackgroundImageVisible: React.Dispatch<React.SetStateAction<boolean>>;
}}){
const {
    setUiVisible,
    playbackSpeed,
    setPlaybackSpeed,
    enableMovingTorus,
    setEnableMovingTorus,
    backgroundImageVisible,
    setBackgroundImageVisible
} = props;

    return (
        <FormGroup className="utilities">
            <NumericField
                state={playbackSpeed}
                setState={setPlaybackSpeed}
                label={"再生速度"}
                style={{
                    overflow: "visible"
                }}
            />
            <FormControlLabel
                label="背景を表示する"
                control={
                    <Switch
                        checked={backgroundImageVisible}
                        onChange={() => setBackgroundImageVisible(prev => !prev)}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                }
            />
            <FormControlLabel
                label="リングのアニメーションを有効化"
                control={
                    <Switch
                        checked={enableMovingTorus}
                        onChange={() => setEnableMovingTorus(prev => !prev)}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />
                }
            />
            <Button
                variant="contained"
                startIcon={<VisibilityOffIcon/>}
                onClick={() => setUiVisible(0)}
            >   UI非表示
            </Button>
        </FormGroup>
    );
}