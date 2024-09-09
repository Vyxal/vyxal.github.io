// https://raw.githubusercontent.com/Vyxal/versions/main/versions.json

const [{ version: latest }, { versions }] = await Promise.all([
    fetch("https://vyxal.github.io/Vyxal/theseus.json").then((r) => r.json()),
    fetch("https://raw.githubusercontent.com/Vyxal/versions/main/versions.json").then((r) => r.json()),
]) as [{ version: string }, { versions: string[] }];

const versionList = document.getElementById("version-list")!;
document.getElementById("versions-loading")!.remove();
for (const version of versions.concat([latest]).reverse()) {
    const a = document.createElement("a");
    a.classList.add("list-group-item");
    a.classList.add("list-group-item-action");
    if (version == latest) {
        a.href = "/latest.html";
        a.innerHTML = `${version} <span class="badge text-bg-warning">latest</span>`;
    } else {
        a.href = `/versions/v${version}`;
        a.innerText = version;
    }
    versionList.appendChild(a);
}

export {};