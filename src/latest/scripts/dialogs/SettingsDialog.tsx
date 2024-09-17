import { Dispatch, SetStateAction, memo, useEffect, useRef } from "react";
import { Button, FormCheck, FormLabel, FormText, Modal, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import { Settings, Theme, isTheSeason } from "../util/settings";
import FormRange from "react-bootstrap/esm/FormRange";
import { Updater } from "use-immer";

type SettingsDialogProps = {
    settings: Settings,
    setSettings: Updater<Settings>,
    timeout: number | null,
    setTimeout: Dispatch<SetStateAction<number | null>>,
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

export const SettingsDialog = memo(function({ settings, setSettings, timeout, setTimeout, show, setShow }: SettingsDialogProps) {
    const eggProgress = useRef(0);
    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if ("snow"[eggProgress.current] == event.key.toLowerCase() && settings.snowing != "always") {
                eggProgress.current++;
                if (eggProgress.current == 4) {
                    eggProgress.current = 0;
                    setSettings((settings) => {
                        settings.snowing = "always";
                    });
                }
            } else {
                eggProgress.current = 0;
            }
        };
        document.addEventListener("keydown", listener);
        return () => document.removeEventListener("keydown", listener);
    }, [eggProgress, settings]);

    return <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="mb-3">
                <FormLabel htmlFor="theme">Theme</FormLabel>
                <ToggleButtonGroup
                    className="d-block"
                    name="theme"
                    type="radio"
                    value={Theme[settings.theme]}
                    onChange={(theme) => setSettings((settings) => {
                        settings.theme = Theme[theme as keyof typeof Theme];
                    })}
                >
                    {(Object.values(Theme).filter(value => typeof value === "string") as string[])
                        .map((theme, i) => <ToggleButton key={i} id={`theme-${i}`} value={theme}>{theme}</ToggleButton>)
                    }
                </ToggleButtonGroup>
            </div>
            <div className="mb-3">
                <FormCheck
                    type="switch"
                    name="literate-by-default"
                    checked={settings.literateByDefault}
                    onChange={(event) => setSettings((settings) => {
                        settings.literateByDefault = event.target.checked;
                    })}
                    label="Default to literate mode in a new editor"
                />
            </div>
            <div className="mb-3">
                <FormCheck
                    type="switch"
                    name="bracket-matching"
                    checked={settings.highlightBrackets != "no"}
                    onChange={(event) => setSettings((settings) => {
                        settings.highlightBrackets = event.target.checked ? "yes" : "no";
                    })}
                    label="Highlight matching brackets"
                />
            </div>
            <div className="mb-3">
                <FormCheck
                    type="switch"
                    name="bracket-matching-eof"
                    disabled={settings.highlightBrackets == "no"}
                    checked={settings.highlightBrackets == "yes-eof"}
                    onChange={(event) => setSettings((settings) => {
                        settings.highlightBrackets = event.target.checked ? "yes-eof" : "yes";
                    })}
                    label="Show indicator when brackets are closed by EOF"
                />
            </div>
            <div className="mb-3">
                <FormLabel htmlFor="timeout">
                    <i className="bi bi-link-45deg"></i> Timeout
                    <FormCheck type="switch"  className="d-inline-block ms-2" name="timeout-enabled" checked={timeout != null} onChange={(event) => setTimeout(event.target.checked ? 10 : null)} />
                </FormLabel>
                <FormRange name="timeout" step="5" max="60" min="10" disabled={timeout == null} value={timeout != null ? timeout : 10} onChange={(event) => setTimeout(Number.parseInt(event.target.value))} />
                <FormText>{timeout != null ? `${timeout} seconds` : "infinite"}</FormText>
            </div>
            {(isTheSeason() || settings.snowing == "always") && (
                <FormCheck
                    type="switch"
                    name="seasonal-mode"
                    checked={settings.snowing != "no"}
                    onChange={(event) => setSettings((settings) => {
                        settings.snowing = event.target.checked ? "yes" : "no";
                    })}
                    label={<><i className="bi bi-snow"></i> Seasonal decorations</>}
                />
            )}
            <hr />
            <FormText>settings with <i className="bi bi-link-45deg"></i> are saved in the permalink</FormText>
        </Modal.Body>
        <Modal.Footer>
            {/* @ts-expect-error VERSION gets replaced by Webpack */}
            <span className="me-auto form-text font-monospace">{VERSION}</span>
            <Button variant="primary" onClick={() => setShow(false)}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>;
});