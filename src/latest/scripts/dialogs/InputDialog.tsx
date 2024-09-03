import { Dispatch, memo, SetStateAction } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";

export type Input = {
    id: number,
    value: string,
};

export type InputDialogParams = {
    inputs: Input[],
    setInputs: Dispatch<SetStateAction<Input[]>>,
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

export const InputDialog = memo(function({ inputs, setInputs, show, setShow }: InputDialogParams) {
    return <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Inputs</Modal.Title>
        </Modal.Header>
        <Modal.Body className="vstack">
            {inputs.map((input) => {
                return <InputGroup className="mb-2 p-1" key={input.id}>
                    <Form.Control placeholder="Input" value={input.value} onChange={(event) => setInputs(inputs.map((item) => item.id == input.id ? { id: item.id, value: event.currentTarget.value } : item))} />
                    <Button variant="outline-danger" title="Delete input" onClick={() => setInputs(inputs.filter((item) => item.id != input.id))}>
                        <i className="bi bi-trash2"></i>
                    </Button>
                </InputGroup>;
            })}
            <Button variant="outline-primary" onClick={() => setInputs([...inputs, { id: Math.random(), value: "" }])} className="m-1">
                <i className="bi bi-plus-circle"></i> Add input
            </Button>
        </Modal.Body>
    </Modal>;
});