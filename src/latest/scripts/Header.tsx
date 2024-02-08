import { Dispatch, SetStateAction } from "react";
import { Button, ButtonGroup, Container, Dropdown, InputGroup, Nav, Navbar, Spinner } from "react-bootstrap";

import { VyRunnerState } from "./util/misc";

import logo from "../assets/logo-64.png";

type ShowDialogButtonArgs = {
    shower: (boolean) => unknown,
    title: string,
    icon: string,
};

function ShowDialogButton({ shower, title, icon }: ShowDialogButtonArgs) {
    return (
        <Button variant="outline-secondary me-md-3 me-2" onClick={() => shower(true)} title={title}>
            <i className={`bi ${icon}`}></i>
        </Button>
    );
}

type HeaderArgs = {
    state: VyRunnerState,
    onRunClicked: () => unknown,
    flags: Set<string>,
    setShowFlagsDialog: Dispatch<SetStateAction<boolean>>,
    setShowSettingsDialog: Dispatch<SetStateAction<boolean>>,
    setShowShareDialog: Dispatch<SetStateAction<boolean>>,
    setShowElementOffcanvas: Dispatch<SetStateAction<boolean>>,
};

export default function Header({ state, onRunClicked, flags, setShowFlagsDialog, setShowSettingsDialog, setShowShareDialog, setShowElementOffcanvas }: HeaderArgs) {
    return (
        <Navbar className="bg-body-tertiary flex-wrap">
            <Container className="justify-content-start">
                <Navbar.Brand>
                    <img src={logo} width="32" height="32" className="rounded me-2" alt="Vyxal woogle" />
                    <span className="d-none d-sm-inline">Vyxal 3</span>
                </Navbar.Brand>
                <Nav className="me-auto me-md-0 d-none d-sm-flex">
                    <InputGroup className="me-md-3 me-2">
                        {
                            flags.size > 0 ? (
                                <span className="form-control font-monospace">-{[...flags].join("")}</span>
                            ) : null
                        }
                        <Button variant="outline-secondary" onClick={() => setShowFlagsDialog(true)} title="Flags">
                            <i className="bi bi-flag-fill"></i>
                        </Button>
                    </InputGroup>
                    <ShowDialogButton shower={setShowShareDialog} icon="bi-share" title="Share code" />
                    <ShowDialogButton shower={setShowSettingsDialog} icon="bi-gear" title="Settings" />
                    <ShowDialogButton shower={setShowElementOffcanvas} icon="bi-journal-code" title="Elements and documentation" />
                </Nav>
                <div className="d-sm-none me-auto">
                    <InputGroup>
                        {
                            flags.size > 0 ? (
                                <span className="form-control font-monospace">-{[...flags].join("")}</span>
                            ) : null
                        }
                        <Dropdown as={ButtonGroup}>
                            <Button variant="outline-secondary" onClick={() => setShowFlagsDialog(true)} title="Flags">
                                <i className="bi bi-flag-fill"></i>
                            </Button>
                            <Dropdown.Toggle split id="toggle-mober-menu" variant="outline-secondary" />
                            <Dropdown.Menu>
                                <Dropdown.Item as="button" onClick={() => setShowShareDialog(true)}>
                                    Share code
                                </Dropdown.Item>
                                <Dropdown.Item as="button" onClick={() => setShowSettingsDialog(true)}>
                                    Settings
                                </Dropdown.Item>
                                <Dropdown.Item as="button" onClick={() => setShowElementOffcanvas(true)}>
                                    Elements and documentation
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </InputGroup>
                </div>
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