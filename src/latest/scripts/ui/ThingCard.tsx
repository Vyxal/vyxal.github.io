import { Badge, Card, ListGroup } from "react-bootstrap";
import type { SyntaxThing } from "../interpreter/element-data";

const variants: { [key in SyntaxThing["type"]]: string } = {
    element: "",
    modifier: "primary",
    syntax: "ourple",
};

type ThingCardProps = {
    thing: SyntaxThing,
    shadow?: boolean,
    onClick?: () => unknown,
};

export function ThingCard({ thing, shadow, onClick }: ThingCardProps) {
    return <Card border={variants[thing.type]} className={`h-100 position-relative ${(shadow ?? false) ? "shadow" : ""} ${(onClick !== undefined ? "clickable" : "")}`} onClick={onClick}>
        {(thing.type == "element" && thing.vectorises) && <Badge bg="primary" className="position-absolute top-0 end-0 m-2">vectorizes</Badge>}
        <Card.Body>
            <Card.Title>{thing.symbol}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{thing.name}</Card.Subtitle>
            {(thing.type != "syntax" && thing.keywords.length > 0) && (
                <Card.Text>
                    {thing.keywords.map((keyword, i) => <code key={i} className="code-pill">{keyword}</code>)}
                </Card.Text>
            )}
            {thing.type != "element" && <Card.Text>{thing.description}</Card.Text>}
        </Card.Body>
        {(thing.type == "syntax" || thing.overloads.length > 0) && 
            <ListGroup variant="flush">
                {thing.type != "syntax" ? (
                    thing.overloads.map((overload, i) => {
                        return <ListGroup.Item className="font-monospace" key={i}>{overload}</ListGroup.Item>;
                    })
                ) : <ListGroup.Item className="font-monospace">{thing.usage}</ListGroup.Item>}
            </ListGroup>
        }
    </Card>;
}