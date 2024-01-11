import { Element } from "../util/element-data";
import { Card, ListGroup } from "react-bootstrap";

type ElementCardParams = {
    item: Element,
    shadow?: boolean,
};

export function ElementCard({ item, shadow = undefined }: ElementCardParams) {
    return <Card className={`h-100 ${(shadow ?? false) ? "shadow" : ""}`}>
        <Card.Body>
            <Card.Title>{item.symbol}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{item.name}</Card.Subtitle>
            <Card.Text>
                {item.keywords.map((keyword, i) => <code key={i} className="code-pill">{keyword}</code>)}
            </Card.Text>
        </Card.Body>
        <ListGroup variant="flush">
            {item.overloads.map((overload, i) => {
                return <ListGroup.Item className="font-monospace" key={i}>{overload}</ListGroup.Item>;
            })}
        </ListGroup>
    </Card>;
}
