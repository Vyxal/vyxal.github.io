const LEGACY = new Set(["3.0.0", "3.1.0", "3.2.0", "3.3.0", "3.4.0", "3.4.1", "3.4.2", "3.4.3", "3.4.4", "3.4.5"]);

function makeVersionLink(version: string, type?: "legacy" | "latest" | "normal") {
    const a = document.createElement("div");
    a.classList.add("list-group-item");
    a.classList.add("d-flex");
    let body = `<span class="me-auto"><span class="me-2">${version}</span>`;
    if (type == "latest") {
        body += `<span class="badge text-bg-primary">latest</span></span> <a href="/latest.html">online interpreter</a>`;
    } else {
        if (type == "legacy") {
            body += `<span class="badge text-bg-warning">legacy</span></span>`;
        } else {
            body += "</span>";
        }
        body += `<a href="https://github.com/Vyxal/Vyxal/releases/tag/v${version}">GitHub release</a>`;
        body += `<span class="text-secondary mx-2">&bullet;</span> <a href="/versions/v${version}/">online interpreter</a>`;
    }
    a.innerHTML = body;
    return a;
}

const [{ version: latest }, { versions }] = await Promise.all([
    fetch("https://vyxal.github.io/Vyxal/theseus.json").then((r) => r.json()),
    fetch("https://raw.githubusercontent.com/Vyxal/versions/main/versions.json").then((r) => r.json()),
]) as [{ version: string }, { versions: string[] }];

const versionList = document.getElementById("version-list")!;
document.getElementById("versions-loading")!.remove();
for (const version of versions.concat([latest]).reverse()) {
    versionList.appendChild(makeVersionLink(version, version == latest ? "latest" : LEGACY.has(version) ? "legacy" : "normal"));
}

export {};