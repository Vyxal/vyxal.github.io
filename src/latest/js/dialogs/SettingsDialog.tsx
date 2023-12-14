import { Dispatch, SetStateAction, memo } from "react";
import { Button, FormLabel, FormText, Modal, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { Theme } from "../util";
import FormRange from "react-bootstrap/esm/FormRange";

type SettingsDialogParams = {
    theme: Theme,
    setTheme: Dispatch<SetStateAction<Theme>>,
    timeout: number,
    setTimeout: Dispatch<SetStateAction<number>>,
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

export const SettingsDialog = memo(function({ theme, setTheme, timeout, setTimeout, show, setShow }: SettingsDialogParams) {
    return <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="mb-3">
                <FormLabel htmlFor="theme">Theme</FormLabel>
                <ToggleButtonGroup className="d-block" name="theme" type="radio" value={Theme[theme]} onChange={(theme) => setTheme(Theme[theme as keyof typeof Theme])}>
                    {(Object.values(Theme).filter(value => typeof value === 'string') as string[]).map((theme, i) => <ToggleButton key={i} id={`theme-${i}`} value={theme}>{theme}</ToggleButton>
                    )}
                </ToggleButtonGroup>
                <FormText>this setting is saved locally</FormText>
            </div>
            <div>
                <FormLabel htmlFor="timeout">Timeout</FormLabel>
                <FormRange name="timeout" step="5" max="60" min="10" value={timeout} onChange={(event) => setTimeout(Number.parseInt(event.currentTarget.value))} />
                <FormText>{timeout} seconds</FormText>
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={() => setShow(false)}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>;
});