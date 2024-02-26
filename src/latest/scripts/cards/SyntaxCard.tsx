import { Card, ListGroup } from "react-bootstrap";
import { SyntaxFeature } from "../util/element-data";

type SyntaxCardParams = {
    item: SyntaxFeature,
};

export function SyntaxCard({ item }: SyntaxCardParams) {
    return <Card border="ourple" className="h-100">
        <Card.Body>
            <Card.Title>{item.symbol}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">{item.name}</Card.Subtitle>
            <Card.Text>{item.description}</Card.Text>
        </Card.Body>
        <ListGroup variant="flush">
            <ListGroup.Item className="font-monospace">{item.usage}</ListGroup.Item>
        </ListGroup>
    </Card>;
}