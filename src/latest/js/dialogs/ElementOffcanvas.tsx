import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { DescriptionEntry, Element } from "../util";
import { Offcanvas, Table } from "react-bootstrap";
import { Form } from "react-bootstrap";
import Fuse from "fuse.js";

type ElementOffcanvasParams = {
    show: boolean,
    setShow: Dispatch<SetStateAction<boolean>>,
};

const fuse = new Fuse<Element>([], {
    includeScore: true,
    threshold: 0.4,
    keys: ["token", "name", "keywords"],
});
const elements: Element[] = [];
fetch("https://vyxal.github.io/Vyxal/descriptions.json")
    .then((response) => response.json())
    .then((descriptions) => {
        for (const element of (Object.values(descriptions) as DescriptionEntry[][]).flat()) {
            elements.push({
                name: element.name,
                token: element.token,
                keywords: element.description.split(" "),
                overloads: element.overloads,
            });
        }
        fuse.setCollection(elements);
    });

export function ElementOffcanvas({ show, setShow }: ElementOffcanvasParams) {
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<Element[]>([]);

    useEffect(() => {
        if (query.length) {
            setResults(fuse.search(query).map((result) => result.item));
        } else {
            setResults(elements);
        }
    }, [query]);

    return <Offcanvas show={show} onHide={() => setShow(false)} className="w-100">
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>Elements</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <Form.Control type="email" placeholder="Search elements..." value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
            <hr />
            <Table bordered responsive="lg">
                <thead>
                    <tr>
                        <th>Glyph</th>
                        <th>Name</th>
                        <th>Literate keywords</th>
                        <th>Overloads</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((element) => {
                        return <tr>
                            <td>{element.token}</td>
                            <td>{element.name}</td>
                            <td className="font-monospace">{element.keywords.join(" ")}</td>
                            <td>{element.overloads}</td>
                        </tr>;
                    })}
                </tbody>
            </Table>
        </Offcanvas.Body>
    </Offcanvas>;
}