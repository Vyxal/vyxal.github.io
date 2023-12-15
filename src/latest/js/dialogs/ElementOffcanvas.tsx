import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ELEMENT_DATA, Element } from "../util";
import { Card, Col, ListGroup, Offcanvas, Row } from "react-bootstrap";
import { Form } from "react-bootstrap";
import Fuse from "fuse.js";

type ElementOffcanvasParams = {
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

const fuse = new Fuse<Element>([], {
    includeScore: true,
    threshold: 0.3,
    keys: [
        {
            "name": "symbol",
            "weight": 3
        },
        {
            "name": "name",
            "weight": 2
        },
        {
            "name": "keywords",
            "weight": 1
        },
    ],
});
ELEMENT_DATA.then((data) => {
    fuse.setCollection(data.elements);
});

export function ElementOffcanvas({ show, setShow }: ElementOffcanvasParams) {
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<Element[]>([]);

    useEffect(() => {
        if (query.length) {
            setResults(fuse.search(query).map((result) => result.item));
        } else {
            ELEMENT_DATA.then((data) => setResults(data.elements));
        }
    }, [query]);

    return <Offcanvas show={show} onHide={() => setShow(false)} style={{ width: "600px" }}>
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>Elements</Offcanvas.Title>
            <Form.Control type="search" placeholder="Search..." value={query} onChange={(event) => setQuery(event.currentTarget.value)} className="mx-3" />
        </Offcanvas.Header>
        <Offcanvas.Body>
            <Row xs={1} md={2} className="g-4 align-items-stretch">
                {results.length ? (
                    results.map((element, i) => {
                        return <Col key={i}>
                            <Card className="h-100">
                                <Card.Body>
                                    <Card.Title>{element.symbol}</Card.Title>
                                    <Card.Subtitle className="mb-2 text-muted">{element.name}</Card.Subtitle>
                                    <Card.Text>
                                        Literate keywords: {
                                            element.keywords.map((keyword, i) => <code key={i} className="code-pill">{keyword}</code>)
                                        }
                                    </Card.Text>
                                </Card.Body>
                                <ListGroup variant="flush">
                                    {element.overloads.map((overload, i) => {
                                        return <ListGroup.Item className="font-monospace" key={i}>{overload}</ListGroup.Item>;
                                    })}
                                </ListGroup>
                            </Card>
                        </Col>;
                    })
                ) : (
                    <Col>
                        <Card body>No results</Card>
                    </Col>
                )}
            </Row>
        </Offcanvas.Body>
    </Offcanvas>;
}