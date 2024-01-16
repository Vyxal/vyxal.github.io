import { Button, Modal } from "react-bootstrap";

// TODO: This is garbage! Fix it once React releases use()
export type IncompatibleInfo = {
    latestVersion: string,
    targetVersion: string,
} | undefined;

type IncompatibleDialogParams = {
    data: IncompatibleInfo,
};

export function IncompatibleDialog({ data }: IncompatibleDialogParams) {
    return <Modal show={data != undefined}>
        <Modal.Header>
            <Modal.Title>Incompatible permalink</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            This permalink was made with Vyxal {data?.targetVersion}, and 
            is not compatible with the latest version ({data?.latestVersion ?? ""}) of Vyxal.
        </Modal.Body>
        <Modal.Footer>
            <Button href={`https://vyxal.github.io/versions/v${data?.targetVersion ?? ""}#${location.hash.substring(1)}`} variant="primary">
                Go to archived version
            </Button>
        </Modal.Footer>
    </Modal>;
}