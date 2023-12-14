import { Dispatch, ReactNode, SetStateAction, Suspense, lazy, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";

import CGCCTemplate from "../../templates/cgcc.handlebars.md";
import CMCTemplate from "../../templates/cmc.handlebars.md";

type CopyButtonParams = {
    generate: () => string,
    children: ReactNode,
};

function CopyButton({ generate, children }: CopyButtonParams) {
    const [state, setState] = useState<"label" | "copied" | "error">("label");

    let body: string | ReactNode;
    let variant: string;
    switch (state) {
        case "label":
            body = children;
            variant = "primary";
            break;
        case "copied":
            body = "Copied!";
            variant = "success";
            break;
        case "error":
            body = "Failed to copy";
            variant = "danger";
            break;
    }

    function copy() {
        if (state != "label") return;
        // @ts-expect-error Apparently "clipboard-write" isn't a permission TS knows
        navigator.permissions.query({ name: "clipboard-write" }).then((perm) => {
            if (perm.state != "granted") {
                console.error("Clipboard write permission not granted, is this a secure context?");
                setState("error");
                return;
            }
            return navigator.clipboard.writeText(generate()).then(
                () => setState("copied"),
                () => setState("error"),
            );
        }).finally(() => window.setTimeout(() => setState("label"), 1000));
    }

    return <Button variant={variant} onClick={copy} className="d-block m-2">
        {body}
    </Button>;
}

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
        return function ({ bytecount, code, flags }: ShareDialogParams) {
            function generateCGCC() {
                return cgcc({
                    bytecount: bytecount,
                    code: code,
                    link: window.location.toString(),
                    flags: flags.length ? flags : undefined,
                });
            }
            function generateCMC() {
                return cmc({
                    bytecount: bytecount,
                    code: code,
                    link: window.location.toString(),
                    flags: flags.length ? flags : undefined,
                });
            }
            function generateLink() {
                return `[Vyxal It Online!](${window.location.toString()})`;
            }

            return <>
                <Modal.Body>
                    <CopyButton generate={generateCGCC}>
                        Copy CGCC answer
                    </CopyButton>
                    <CopyButton generate={generateCMC}>
                        Copy CMC response
                    </CopyButton>
                    <CopyButton generate={generateLink}>
                        Copy short link
                    </CopyButton>
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