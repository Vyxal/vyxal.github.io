import { Button, FormSelect, Modal } from "react-bootstrap";
import { FormLabel } from "react-bootstrap";
import { ChangeFlagValue, ChangeFlags, END_PRINT_FLAGS, END_PRINT_MODES, END_PRINT_NAMES, InterpreterFlagSettings } from "../flagsReducer";
import { Dispatch, ReactNode, SetStateAction, memo } from "react";

export type FlagsDialogParams = {
    flags: InterpreterFlagSettings,
    setFlags: Dispatch<ChangeFlagValue | ChangeFlags>,
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

export const FlagsDialog = memo(function({ flags, setFlags, show, setShow }: FlagsDialogParams) {
    return <Modal show={show} onHide={() => setShow(false)} fullscreen="sm-down">
        <Modal.Header closeButton>
            <Modal.Title>Flags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="mb-3">
                <span className="form-control font-monospace">
                    {flags.flags.length > 0 ? `-${flags.flags.join("")}` : " "}
                </span>
            </div>
            <BooleanSwitch parameter="literate" flags={flags} setFlags={setFlags}>
                Literate mode
            </BooleanSwitch>
            <hr className="mt-1" />
            <BooleanSwitch parameter="presetStack" flags={flags} setFlags={setFlags}>
                Preset stack to <code>100</code>
            </BooleanSwitch>
            <BooleanSwitch parameter="startRangeAtZero" flags={flags} setFlags={setFlags}>
                Start ranges at <code>0</code>
            </BooleanSwitch>
            <BooleanSwitch parameter="offsetRangeByOne" flags={flags} setFlags={setFlags}>
                Offset ranges by <code>-1</code>
            </BooleanSwitch>
            <BooleanSwitch parameter="rangify" flags={flags} setFlags={setFlags}>
                Rangify, whatever that means
            </BooleanSwitch>
            <BooleanSwitch parameter="fullTrace" flags={flags} setFlags={setFlags}>
                Full traceback information
            </BooleanSwitch>
            <hr className="mt-1" />
            <div>
                <label htmlFor="end-print-mode">End print mode:</label>
                <FormSelect
                    name="end-print-mode"
                    className="d-inline ms-2 w-auto"
                    value={END_PRINT_FLAGS.get(flags.endPrintMode)}
                    onChange={(event) => setFlags({ type: "setting", setting: "endPrintMode", value: event.currentTarget.value })}
                >
                    {[...END_PRINT_MODES.keys()].map((flag) => {
                        return <option key={flag} value={flag}>{END_PRINT_NAMES.get(flag)}</option>;
                    })}
                </FormSelect>
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={() => setShow(false)}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>;
});
export type BooleanSwitchParams = {
    parameter: string,
    flags: InterpreterFlagSettings,
    setFlags: Dispatch<ChangeFlagValue | ChangeFlags>,
    children: ReactNode,
};

export function BooleanSwitch({ parameter, flags, setFlags, children }: BooleanSwitchParams) {
    return <div className="form-check form-switch">
        <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id={parameter + "Switch"}
            checked={flags[parameter]}
            onChange={(event) => {
                setFlags({
                    type: "setting",
                    setting: parameter,
                    value: event.currentTarget.checked
                } as ChangeFlagValue);
            }}
        />
        <FormLabel htmlFor={parameter + "Switch"}>
            {children}
        </FormLabel>
    </div>;
}
