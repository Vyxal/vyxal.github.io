import { Dispatch, SetStateAction, Suspense, lazy, useEffect, useState } from "react";
import { Modal, Nav, Spinner } from "react-bootstrap";

import CGCCTemplate from "../../templates/cgcc.handlebars.md";
import CMCTemplate from "../../templates/cmc.handlebars.md";
import { CopyButton } from "../CopyButton";

type ShareDialogParams = {
    bytecount: string,
    code: string,
    flags: string,
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

type Template = {
    bytecount: string,
    flags?: string,
    code: string,
    link: string,
};

function ShareDialogBody() {
    return import(/* webpackPrefetch: true */ "handlebars").then((Handlebars) => {
        const cgcc = Handlebars.compile<Template>(CGCCTemplate);
        const cmc = Handlebars.compile<Template>(CMCTemplate);
        return function({ bytecount, code, flags }: ShareDialogParams) {
            const [key, setKey] = useState("link");
            const [content, setContent] = useState("");

            useEffect(() => {
                switch (key) {
                    case "link": {
                        setContent(`[Vyxal It Online!](${window.location.toString()})`);
                        break;
                    }
                    case "cgcc": {
                        setContent(cgcc({
                            bytecount: bytecount,
                            code: code,
                            link: window.location.toString(),
                            flags: flags.length ? flags : undefined,
                        }));
                        break;
                    }
                    case "cmc": {
                        setContent(cmc({
                            bytecount: bytecount,
                            code: code,
                            link: window.location.toString(),
                            flags: flags.length ? flags : undefined,
                        }));
                        break;
                    }
                }
            }, [key]);

            return <>
                <Modal.Body>
                    <Nav variant="tabs" className="align-items-end" defaultActiveKey={key} onSelect={(k) => setKey(k!)}>
                        <Nav.Item>
                            <Nav.Link eventKey="link">Link</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="cgcc">CGCC answer</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link eventKey="cmc">CMC response</Nav.Link>
                        </Nav.Item>
                        <CopyButton className="ms-auto my-1" title="Copy text" generate={() => content} />
                    </Nav>
                    <pre className="bg-dark-subtle p-2 text-wrap">
                        <code>
                            {content}
                        </code>
                    </pre>
                </Modal.Body>
            </>;
        };
    });
}

const ShareDialogLazyBody = lazy(() => ShareDialogBody().then((component) => ({ default: component })));

export default function ShareDialog({ bytecount, code, flags, show, setShow }: ShareDialogParams) {
    return <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Share</Modal.Title>
        </Modal.Header>
        <Suspense
            fallback={
                <div className="d-flex justify-content-center py-4 m-2">
                    <Spinner animation="border" className="" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            }
        >
            <ShareDialogLazyBody bytecount={bytecount} code={code} flags={flags} show={show} setShow={setShow} />
        </Suspense>
    </Modal>;
}