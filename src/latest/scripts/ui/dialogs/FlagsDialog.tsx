import { Button, FormSelect, InputGroup, Modal } from "react-bootstrap";
import { FormLabel } from "react-bootstrap";
import { Dispatch, SetStateAction, memo, useContext } from "react";
import { ElementDataContext } from "../../interpreter/element-data";
import { Updater } from "use-immer";
import { Flags, deserializeFlags, serializeFlags } from "../../interpreter/flags";

type FlagsDialogProps = {
    flags: Flags,
    setFlags: Updater<Flags>,
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

type BooleanSwitchProps = {
    parameter: string,
    flags: Flags,
    setFlags: Updater<Flags>,
};

function BooleanSwitch({ parameter, flags, setFlags }: BooleanSwitchProps) {
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

type ChoiceDropdownProps = {
    parameter: string,
    choices: Map<string, string>,
    flags: Flags,
    setFlags: Updater<Flags>,
};

function ChoiceDropdown({ parameter, choices, flags, setFlags }: ChoiceDropdownProps) {
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

export const FlagsDialog = memo(function({ flags, setFlags, show, setShow }: FlagsDialogProps) {
    const { flagDefs } = useContext(ElementDataContext)!;
    const flagSet = serializeFlags(flagDefs, flags);
    return <Modal show={show} onHide={() => setShow(false)} fullscreen="sm-down">
        <Modal.Header closeButton>
            <Modal.Title>Flags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className="input-group mb-3">
                <span className="input-group-text">-</span>
                <input
                    type="text"
                    className="form-control font-monospace"
                    value={flagSet.size > 0 ? [...flagSet.values()].join("") : ""}
                    onChange={(event) => {
                        setFlags(deserializeFlags(flagDefs, new Set(event.target.value)));
                    }}
                />
            </div>
            {
                [...flagDefs.values()].map((def) => {
                    switch (def.type) {
                        case "boolean": {
                            return <BooleanSwitch key={def.name} parameter={def.name} flags={flags} setFlags={setFlags} />;
                        }
                        case "choice": {
                            return <ChoiceDropdown key={def.name} parameter={def.name} choices={def.choices} flags={flags} setFlags={setFlags} />;
                        }
                    }
                })
            }
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" onClick={() => setShow(false)}>
                Close
            </Button>
        </Modal.Footer>
    </Modal>;
});