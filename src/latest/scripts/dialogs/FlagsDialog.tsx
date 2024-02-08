import { Button, FormSelect, InputGroup, Modal } from "react-bootstrap";
import { FormLabel } from "react-bootstrap";
import { Dispatch, SetStateAction, memo, useContext } from "react";
import { ElementDataContext } from "../util/element-data";
import { Updater } from "use-immer";
import { Flags, serializeFlags } from "../flags";

export type FlagsDialogParams = {
    flags: Flags,
    setFlags: Updater<Flags>,
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

export const FlagsDialog = memo(function({ flags, setFlags, show, setShow }: FlagsDialogParams) {
    const { flagDefs } = useContext(ElementDataContext)!;
    const flagSet = serializeFlags(flagDefs, flags);
    return <Modal show={show} onHide={() => setShow(false)} fullscreen="sm-down">
        <Modal.Header closeButton>
            <Modal.Title>Flags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="mb-3">
                <span className="form-control font-monospace">
                    {flagSet.size > 0 ? `-${[...flagSet.values()].join("")}` : " "}
                </span>
            </div>
            {
                [...flagDefs.values()].map((def) => {
                    switch (def.type) {
                        case "boolean": {
                            return <BooleanSwitch parameter={def.name} flags={flags} setFlags={setFlags} />;
                        }
                        case "choice": {
                            return <ChoiceDropdown parameter={def.name} choices={def.choices} flags={flags} setFlags={setFlags} />;
                        }
                    }
                })
            }
            {/* <BooleanSwitch parameter="literate" flags={flags} setFlags={setFlags}>
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
            <BooleanSwitch parameter="limitPrint" flags={flags} setFlags={setFlags}>
                Limit printing
            </BooleanSwitch>
            <BooleanSwitch parameter="dontEvalInputs" flags={flags} setFlags={setFlags}>
                Don't evaluate inputs
            </BooleanSwitch>
            <InputGroup className="mb-3">
                <InputGroup.Text>
                    <label htmlFor="default-arity">Default arity:</label>
                </InputGroup.Text>
                <FormSelect
                    name="default-arity"
                    className="d-inline w-auto"
                    value={flags.defaultArity}
                    onChange={(event) => setFlags({ type: "setting", setting: "defaultArity", value: Number.parseInt(event.currentTarget.value) })}
                >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                </FormSelect>
            </InputGroup>
            <InputGroup className="flex-nowrap">
                <InputGroup.Text>
                    <label htmlFor="end-print-mode">End print mode:</label>
                </InputGroup.Text>
                <FormSelect
                    name="end-print-mode"
                    className="d-inline w-auto"
                    value={END_PRINT_FLAGS.get(flags.endPrintMode)}
                    onChange={(event) => setFlags({ type: "setting", setting: "endPrintMode", value: event.currentTarget.value })}
                >
                    {[...END_PRINT_MODES.keys()].map((flag) => {
                        return <option key={flag} value={flag}>{END_PRINT_NAMES.get(flag)}</option>;
                    })}
                </FormSelect>
            </InputGroup> */}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={() => setShow(false)}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>;
});

type BooleanSwitchParams = {
    parameter: string,
    flags: Flags,
    setFlags: Updater<Flags>,
};

function BooleanSwitch({ parameter, flags, setFlags }: BooleanSwitchParams) {
    return <div className="form-check form-switch">
        <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id={parameter + "Switch"}
            checked={flags.get(parameter) == true}
            onChange={(event) => {
                setFlags((flags) => {
                    flags.set(parameter, event.target.checked);
                });
            }}
        />
        <FormLabel htmlFor={parameter + "Switch"}>
            {parameter}
        </FormLabel>
    </div>;
}

type ChoiceDropdownParams = {
    parameter: string,
    choices: Map<string, string>,
    flags: Flags,
    setFlags: Updater<Flags>,
};

function ChoiceDropdown({ parameter, choices, flags, setFlags }: ChoiceDropdownParams) {
    return <InputGroup className="flex-nowrap mb-3">
        <InputGroup.Text>
            <label htmlFor={parameter}>{parameter}:</label>
        </InputGroup.Text>
        <FormSelect
            name={parameter}
            className="d-inline w-auto"
            value={flags.get(parameter) as string}
            onChange={(event) => {
                setFlags((flags) => {
                    flags.set(parameter, event.target.value);
                });
            }}
        >
            {[...choices.entries()].map(([flag, choice]) => {
                return <option key={flag} value={choice}>{choice}</option>;
            })}
        </FormSelect>
    </InputGroup>;
}