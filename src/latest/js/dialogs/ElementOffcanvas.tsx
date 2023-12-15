import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ELEMENT_DATA, Element, Modifier } from "../util";
import { Card, Col, Nav, Offcanvas, Row, Tab } from "react-bootstrap";
import { Form } from "react-bootstrap";
import Fuse from "fuse.js";
import { ElementCard, ModifierCard } from "../Cards";

type CardSearchResultsParams<T> = {
    card: ({ item }: { item: T }) => JSX.Element,
    results: T[],
};

function CardSearchResults<T>({ card, results }: CardSearchResultsParams<T>) {
    return <Row xs={1} md={2} className="g-4 align-items-stretch">
        {results.length ? (
            results.map((item, i) => {
                return <Col key={i}>
                    {card({ item })}
                </Col>;
            })
        ) : (
            <Col>
                <Card body>No results</Card>
            </Col>
        )}
    </Row>;
}

const elementFuse = new Fuse<Element>([], {
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
const modifierFuse = new Fuse<Modifier>([], {
    includeScore: true,
    threshold: 0.3,
    keys: [
        {
            "name": "name",
            "weight": 2
        },
        {
            "name": "keywords",
            "weight": 1
        },
    ]
});
ELEMENT_DATA.then((data) => {
    elementFuse.setCollection(data.elements);
    modifierFuse.setCollection(data.modifiers);
});

type ElementOffcanvasParams = {
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

export function ElementOffcanvas({ show, setShow }: ElementOffcanvasParams) {
    const [query, setQuery] = useState("");
    const [elementResults, setElementResults] = useState<Element[]>([]);
    const [modifierResults, setModifierResults] = useState<Modifier[]>([]);
    const [tab, setTab] = useState("elements");

    useEffect(() => {
        switch (tab) {
            case "elements":
                if (query.length) {
                    setElementResults(elementFuse.search(query).map((result) => result.item));
                } else {
                    ELEMENT_DATA.then((data) => setElementResults(data.elements));
                }
                break;
            case "modifiers":
                if (query.length) {
                    setModifierResults(modifierFuse.search(query).map((result) => result.item));
                } else {
                    ELEMENT_DATA.then((data) => setModifierResults(data.modifiers));
                }
                break;
        }
    }, [query, tab]);

    return <Offcanvas show={show} onHide={() => setShow(false)} style={{ width: "600px" }}>
        <Tab.Container activeKey={tab} onSelect={(tab) => setTab(tab!)}>
            <Offcanvas.Header closeButton className="border-bottom">
                <Form.Control type="search" placeholder="Search..." value={query} onChange={(event) => setQuery(event.currentTarget.value)} className="me-3" />
                <Nav variant="pills" className="flex-nowrap me-3">
                    <Nav.Item>
                        <Nav.Link eventKey="elements">Elements</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="modifiers">Modifiers</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Tab.Content>
                    <Tab.Pane eventKey="elements">
                        <CardSearchResults card={ElementCard} results={elementResults} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="modifiers">
                        <CardSearchResults card={ModifierCard} results={modifierResults} />
                    </Tab.Pane>
                </Tab.Content>
            </Offcanvas.Body>
        </Tab.Container>
    </Offcanvas>;
}