import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ELEMENT_DATA, Element, Modifier, elementFuse, modifierFuse } from "../util/element-data";
import { Card, Col, Collapse, Nav, Offcanvas, Row, Tab } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { ModifierCard } from "../cards/ModifierCard";
import { ElementCard } from "../cards/ElementCard";

type CardSearchResultsParams<T> = {
    card: ({ item }: { item: T }) => JSX.Element,
    results: T[],
};

function CardSearch<T>({ card, results }: CardSearchResultsParams<T>) {
    return <>
        <Row xs={1} md={2} className="g-4 align-items-stretch">
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
        </Row>
    </>;
}

type ElementOffcanvasParams = {
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

export function ElementOffcanvas({ show, setShow }: ElementOffcanvasParams) {
    const [query, setQuery] = useState("");
    const [elementResults, setElementResults] = useState<Element[]>([]);
    const [modifierResults, setModifierResults] = useState<Modifier[]>([]);
    const [tab, setTab] = useState("elements");
    const [showSearch, setShowSearch] = useState(true);
    const [codepage, setCodepage] = useState<string[]>([]);

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
        setShowSearch(tab != "codepage");
    }, [query, tab]);

    useEffect(() => {
        ELEMENT_DATA.then((data) => setCodepage(data.codepageRaw));
    }, []);

    return <Offcanvas show={show} onHide={() => setShow(false)} style={{ width: "600px" }}>
        <Tab.Container activeKey={tab} onSelect={(tab) => setTab(tab!)}>
            <Offcanvas.Header closeButton>
                <Nav variant="pills" className="flex-nowrap me-3">
                    <Nav.Item>
                        <Nav.Link eventKey="elements">Elements</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="modifiers">Modifiers</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="codepage">Codepage</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Offcanvas.Header>
            <div className="border-bottom">
                <Collapse in={showSearch}>
                    <div>
                        <div className="m-3">
                            <Form.Control type="search" placeholder="Search..." value={query} onChange={(event) => setQuery(event.currentTarget.value)} className="" />
                        </div>
                    </div>
                </Collapse>
            </div>
            <Offcanvas.Body>
                <Tab.Content>
                    <Tab.Pane eventKey="elements">
                        <CardSearch card={ElementCard} results={elementResults} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="modifiers">
                        <CardSearch card={ModifierCard} results={modifierResults} />
                    </Tab.Pane>
                    <Tab.Pane eventKey="codepage">
                        <table className="table">
                            {
                                // https://stackoverflow.com/a/37826698/14743122
                                codepage.reduce<string[][]>((resultArray, item, index) => {
                                    const chunkIndex = Math.floor(index / 16);

                                    if (!resultArray[chunkIndex]) {
                                        resultArray[chunkIndex] = []; // start a new chunk
                                    }

                                    resultArray[chunkIndex].push(item);

                                    return resultArray;
                                }, []).map((row) => (
                                    <tr>
                                        {
                                            row.map((glyph) => <td key={glyph}>{glyph}</td>)
                                        }
                                    </tr>
                                ))
                            }
                        </table>
                    </Tab.Pane>
                </Tab.Content>
            </Offcanvas.Body>
        </Tab.Container>
    </Offcanvas>;
}