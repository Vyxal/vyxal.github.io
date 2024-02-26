import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { ELEMENT_DATA, ElementDataContext, elementFuse, modifierFuse, syntaxFuse } from "../util/element-data";
import { Card, Col, Nav, Offcanvas, Row, Tab } from "react-bootstrap";
import { Form } from "react-bootstrap";
import { ModifierCard } from "../cards/ModifierCard";
import { ElementCard } from "../cards/ElementCard";
import Fuse from "fuse.js";
import { SyntaxCard } from "../cards/SyntaxCard";

type CardSearchResultsParams<T> = {
    card: ({ item }: { item: T }) => JSX.Element,
    fuse: Fuse<T>,
    defaults: T[],
};

function CardSearch<T>({ card, fuse, defaults }: CardSearchResultsParams<T>) {
    const [query, setQuery] = useState("");

    const results = query.length ? fuse.search(query).map((result) => result.item) : defaults;

    return <>
        <Form.Control type="search" placeholder="Search..." value={query} onChange={(event) => setQuery(event.currentTarget.value)} className="" />
        <Row xs={1} md={2} className="g-4 mt-0 overflow-y-scroll align-items-stretch">
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
    const elementData = useContext(ElementDataContext)!;
    const [tab, setTab] = useState("elements");
    const [codepage, setCodepage] = useState<string[]>([]);

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
                        <Nav.Link eventKey="syntax">Syntax</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="codepage">Codepage</Nav.Link>
                    </Nav.Item>
                </Nav>
            </Offcanvas.Header>
            <Tab.Content className="offcanvas-body overflow-y-hidden">
                <Tab.Pane eventKey="elements" className="element-offcanvas-tab-pane">
                    <CardSearch card={ElementCard} fuse={elementFuse} defaults={elementData.elements} />
                </Tab.Pane>
                <Tab.Pane eventKey="modifiers" className="element-offcanvas-tab-pane">
                    <CardSearch card={ModifierCard} fuse={modifierFuse} defaults={elementData.modifiers} />
                </Tab.Pane>
                <Tab.Pane eventKey="syntax" className="element-offcanvas-tab-pane">
                    <CardSearch card={SyntaxCard} fuse={syntaxFuse} defaults={elementData.syntax} />
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
                            }, []).map((row, index) => (
                                <tr key={index}>
                                    {
                                        row.map((glyph) => <td key={glyph}>{glyph}</td>)
                                    }
                                </tr>
                            ))
                        }
                    </table>
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    </Offcanvas>;
}