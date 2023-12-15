import { Dispatch, SetStateAction } from "react";
import { Button, Container, InputGroup, Nav, Navbar, Spinner } from "react-bootstrap";

import { InterpreterFlagSettings } from "./flagsReducer";
import { VyRunnerState } from "./util";

import logo from "../assets/logo.png";

type HeaderArgs = {
    state: VyRunnerState,
    onRunClicked: () => unknown,
    flags: InterpreterFlagSettings,
    setShowFlagsDialog: Dispatch<SetStateAction<boolean>>,
    setShowSettingsDialog: Dispatch<SetStateAction<boolean>>,
    setShowShareDialog: Dispatch<SetStateAction<boolean>>,
    setShowElementOffcanvas: Dispatch<SetStateAction<boolean>>,
};

export default function Header({ state, onRunClicked, flags, setShowFlagsDialog, setShowSettingsDialog, setShowShareDialog, setShowElementOffcanvas }: HeaderArgs) {
    return (
        <Navbar className="bg-body-tertiary flex-wrap">
            <Container>
                <Navbar.Brand>
                    <img src={logo} width="32" height="32" className="rounded me-2" alt="Vyxal woogle" /> Vyxal 3
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Nav className="me-auto me-md-0">
                    <InputGroup className="me-md-3 me-2">
                        {
                            flags.flags.length > 0 ? (
                                <span className="form-control font-monospace">-{flags.flags.join("")}</span>
                            ) : null
                        }
                        <Button variant="outline-secondary" onClick={() => setShowFlagsDialog(true)} title="Flags">
                            <i className="bi bi-flag-fill"></i>
                        </Button>
                    </InputGroup>
                    <Button variant="outline-secondary me-md-3 me-2" onClick={() => setShowShareDialog(true)}>
                        <i className="bi bi-share"></i>
                    </Button>
                    <Button variant="outline-secondary me-md-3 me-2" onClick={() => setShowSettingsDialog(true)} title="Settings">
                        <i className="bi bi-gear"></i>
                    </Button>
                    <Button variant="outline-secondary me-md-3 me-2" onClick={() => setShowElementOffcanvas(true)} title="Elements">
                        <i className="bi bi-table"></i>
                    </Button>
                </Nav>
                <Nav className="me-md-auto me-0 justify-self-end">
                    <Button
                        variant={{ "idle": "primary", "starting": "warning", "running": "danger" }[state]}
                        onClick={onRunClicked}
                        className="d-flex align-items-center"
                        disabled={state == "starting"}
                    >
                        {
                            state != "idle" ? (
                                <Spinner as="span" animation="border" role="status" className="spinner-border-sm me-2">
                                    <span className="visually-hidden">Running program</span>
                                </Spinner>
                            ) : (
                                <i className="bi bi-play-fill"></i>
                            )
                        }
                        {{ "idle": "Run", "starting": "Starting", "running": "Stop" }[state]}
                    </Button>
                </Nav>
            </Container>
        </Navbar>
    );
}