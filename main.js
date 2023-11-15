import { aliases } from "./sugars.js"
import { other_aliases } from "./keywords.js"
import { incomptabile } from "./incompatible_versions.js";

var Vyxal = null;
var HelpText = null;
var codepage = ""

async function importOr(localPath, remotePath) {
    let response = await import(localPath).catch(() => import(remotePath));
    return response;
}

importOr("./vyxal.js", "https://vyxal.github.io/Vyxal/vyxal.js").then(
    response => {
        Vyxal = response.Vyxal;
        codepage = Vyxal.getCodepage();

        fetchOr("/ShortDictionary.txt", "https://vyxal.github.io/Vyxal/ShortDictionary.txt").then(
            (text) => {
                shortDict = text
                Vyxal.setShortDict(shortDict)


            })
        fetchOr("/LongDictionary.txt", "https://vyxal.github.io/Vyxal/LongDictionary.txt").then(
            (text) => {
                longDict = text
                Vyxal.setLongDict(longDict)
            }
        )
    }
);


importOr("./helpText.js", "https://vyxal.github.io/Vyxal/helpText.js").then(
    response => {
        HelpText = response.HelpText;
    }
);

const $ = x => document.getElementById(x)

const search = window
const glyphQuery = String.fromCharCode(0o162, 105, 0o143, 107)
// this.prevQuery = ""

let worker;


var selectedBox = 'code' //whether 'header', 'code', or 'footer' are selected

async function fetchOr(localPath, remotePath) {
    let response = await fetch(localPath)
    if (!response.ok) {
        let inner = await fetch(remotePath)
        if (!inner.ok) {
            throw new Error("Failed to fetch")
        }
        return inner.text();
    }
    return response.text();
}

let shortDict = null;
let longDict = null;

function resizeCodeBox(id) {
    // Resize the code box with the given id
    var element = document.getElementById(id);
    element.style.height = ""
    element.style.height = element.scrollHeight + 4 + "px"
}

function updateCount() {
    var byte_box = document.getElementById("code-count")

    var code = e_code.getValue()
    if (flag.value.includes('l')) {
        code = Vyxal.getSBCSified(code)
    }
    if ([...code].every(x => (codepage + ' ' + '\n').includes(x))) {
        byte_box.innerText = `Code: ${code.length} ${flag.value.includes('l') ? 'literate ' : ''
            }byte` + "s".repeat(code.length != 1)
    } else {
        var x = new Blob([code]).size
        byte_box.innerText = `Code: ${x} ${flag.value.includes('l') ? 'literate ' : ''
            }byte${"s".repeat(x != 1)} ` + ' (UTF-8)'
    }
}

function encode(obj) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
}

function decode(str) {
    if (str) {
        return JSON.parse(decodeURIComponent(escape(atob(str))));
    } else {
        return [];
    }
}

function generateURL() {
    var flags = document.getElementById("flag").value
    var code = e_code.doc.getValue()
    var inputs = document.getElementById("inputs").value
    var header = e_header.doc.getValue()
    var footer = e_footer.doc.getValue()
    var version = "3.0.0" // Vyxal.getVersion()

    var url = [flags, header, code, footer, inputs, version];
    return window.location.href + "#" + encode(url)
}

// onclick event listener for sharing buttons
function shareOptions(shareType) {
    var code = e_code.doc.getValue()
    const url = generateURL()
    const flags = document.getElementById("flag").value
    let flagAppendage = ","
    const flagsThatMatter = flags.replace(/[5bBTAP…aṠ]/g, "");
    if (flagsThatMatter) {
        flagAppendage = " `" + flagsThatMatter + "`,"
    }
    let output = ""
    const utfable = [...code].every(x => (codepage + ' ' + '\n').includes(x))
    var len = utfable ? code.length : new Blob([code]).size
    switch (shareType) {
        case "permalink":
            output = url
            break
        case "cmc":
            output = `[Vyxal 3, ${len} byte${"s".repeat(code.length != 1)}${utfable ? '' : ' (UTF-8)'}: \`${code.replaceAll("\`", "\\\`")}\`](${url})`
            break
        case "post-template":
            if (flags.includes("l")) {
                flagAppendage = ""
                code = Vyxal.getSBCSified(code)
                len = code.length
            }
            output = `# [Vyxal 3](https://github.com/Vyxal/Vyxal/tree/version-3)${flagAppendage} ${len} byte${"s".repeat(len != 1)}${utfable ? '' : ' (UTF-8)'}
\`\`\`
${code}
\`\`\`
[Try it Online!${flags.includes("l") ? " (link is to literate version)" : ""}](${url})`;
            break
        case "markdown":
            output = `[Try it Online!](${url})`
            break
    }
    const outputBox = document.getElementById("output")
    outputBox.value = output
    copyToClipboard("output")
    resizeCodeBox("output")
    expandBoxes()
}

function decodeURL() {
    var [flags, header, code, footer, inputs, version] = decode(window.location.hash.substring(1));

    if (version !== undefined && true) { //incomptabile(version, "3.0.0")) {
        window.location.href = `https://vyxal.github.io/versions/v${version}/#${window.location.hash.substring(1)}`
    }

    var flag_box = document.getElementById("flag")
    var inputs_box = document.getElementById("inputs")

    var queryIsNonEmpty = code || flags || inputs || header || footer
    var allBoxesAreEmpty = !(flag_box.value
        || e_header.getValue() || e_code.getValue()
        || e_footer.getValue() || inputs_box.value)

    if (queryIsNonEmpty && allBoxesAreEmpty) {
        flag_box.value = flags
        e_code.doc.setValue(code)
        inputs_box.value = inputs
        e_header.doc.setValue(header)
        e_footer.doc.setValue(footer)
        e_header.refresh()
        e_footer.refresh()
        run_button.click()
    } else {
        expandBoxes()
    }
}

function expandBoxes() {
    ["flag", "inputs", "output", "debug"].forEach(function (n) {
        var boxToExpand = document.getElementById(n + "-detail")
        var actualBox = document.getElementById(n)

        if (actualBox.value) {
            boxToExpand.open = true

        } else {
            boxToExpand.open = false
        }

        resizeCodeBox(n)

    })

    if (e_header.getValue()) {
        document.getElementById("header-detail").open = true
        e_header.refresh()
    }

    if (e_footer.getValue()) {
        document.getElementById("footer-detail").open = true
        e_footer.refresh()
    }
}


// event listener for copy button
function copyToClipboard(arg) {
    var el = document.getElementById(arg)
    // navigator.clipboard.writeText(el)
    el.select()
    document.execCommand("copy")
}

function cancelWorker(why) {
    let runButton = $('run_button');
    const extra = document.getElementById("debug")
    worker.terminate()
    runButton.innerHTML = '<i class="fas fa-play-circle"></i>';
    extra.value = why
    resizeCodeBox("output")
    resizeCodeBox("debug")
    expandBoxes()
    worker = null
    return;
}

window.initCodeMirror = initCodeMirror
window.decodeURL = decodeURL
window.shareOptions = shareOptions
window.updateCount = updateCount
window.resizeCodeBox = resizeCodeBox
window.Vyxal = Vyxal
window.copyToClipboard = copyToClipboard

// set up event listeners for execution
window.addEventListener("DOMContentLoaded", e => {
    initCodeMirror()
    decodeURL()
    updateCount()

    const run = document.getElementById("run_button")
    const clear = document.getElementById("clear")

    const stdin = document.getElementById("inputs")
    const flags = document.getElementById("flag")
    const output = document.getElementById("output")
    const extra = document.getElementById("debug")
    const filter = document.getElementById("filterBox")

    async function do_run() {
        const runButton = $('run_button');

        if (flags.value.includes("h")) {
            runButton.innerHTML = '<i class="fa fa-cog fa-spin"></i>';
            output.value = HelpText.getHelpText();
            expandBoxes();
            runButton.innerHTML = '<i class="fas fa-play-circle"></i>';
            return;
        }
        // generate random 32 character session string
        const sessioncode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        let timeout = 10000
        if (flags.value.includes("5")) {
            timeout = 5000;
        } else if (flags.value.includes("b")) {
            timeout = 15000;
        } else if (flags.value.includes("B")) {
            timeout = 30000;
        } else if (flags.value.includes("T")) {
            timeout = 60000;
        }
        if (e_code.doc.getValue() == 'lyxal') {
            location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        }

        worker = new Worker('./worker.js', { type: "module" });
        worker.onmessage = function (e) {
            if (e.data.session != sessioncode) { return; }
            if (e.data.command == "done") { runButton.innerHTML = '<i class="fas fa-play-circle"></i>'; }
            else { output.value += e.data.val; expandBoxes() }
        }
        if (runButton.innerHTML.includes('fa-spin')) {
            cancelWorker("Code terminated by user")
            return;
        }
        runButton.innerHTML = '<i class="fa fa-cog fa-spin"></i>';

        output.value = ""
        extra.value = ""

        worker.postMessage({
            "mode": "run",
            "code": (e_header.doc.getValue() ? e_header.doc.getValue() + '\n' : '')
                + e_code.doc.getValue() +
                (e_footer.doc.getValue() ? '\n' + e_footer.doc.getValue() : ''),
            "inputs": $('inputs').value,
            "flags": $('flag').value,
            "session": sessioncode,
            "shortDict": shortDict,
            "longDict": longDict
        })

        setTimeout(() => {
            // only execute if worker isn't terminated
            if (runButton.innerHTML.includes('fa-spin')) {
                cancelWorker(`Code terminated after ${timeout / 1000} seconds`);
            }
        }, timeout);
    }

    run.addEventListener('click', do_run)

    clear.addEventListener('click', e => {
        e_code.doc.setValue('')
        stdin.value = ""
        output.value = ""
        extra.value = ""
        e_footer.doc.setValue('')
        e_header.doc.setValue('')
        updateCount()
        flags.value = ""
        filter.value = ""
        glyphSearch()
        expandBoxes()
    })
})

document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key == 'Enter') {
        document.getElementById("run_button").click()
    }
})

// Codemirror stuff begins here
function initCodeMirror() {
    const $$$ = x => document.querySelector(x)

    //Get the corresponding codemirror textarea for any of 'code', 'header', and 'footer'
    function getCodeMirrorTextArea(boxId) {
        return $$$(`#${boxId} + div > div > textarea`);
    }

    function resize(elem) {
        var dummy = $$$("#dummy")
        dummy.style.fontFamily = getComputedStyle($$$('.CodeMirror.cm-s-default')).fontFamily
        dummy.style.fontSize = '15px'
        dummy.style.lineHeight = '24px'
        dummy.value = elem.doc.getValue()
        elem.setSize(
            null,
            (elem.lineCount() * 22) + 24
        )
        elem.refresh();
        dummy.value = ""

        // Make sure e_code is not null
        if ("e_code" in globalThis) {
            updateCount()
        }
    }

    let mode = {
        mode: 'vyxal',
        lineWrapping: true,
        autofocus: true,
    }

    function escapeRegex(string) {
        return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    let codeMode = {
        ...mode,
        extraKeys: {
            Tab: (cm) => {
                const cur = cm.getCursor();
                const lines = cm.getValue().split("\n");
                const line = lines[cur.line].slice(0, cur.ch);
                let alpha = line.match(/[ -~]+$/)?.[0];
                while (alpha?.length >= 3) {
                    // Greedily match as many characters as possible
                    const t = Object.entries(other_aliases).find(x => x[1].some(y => alpha.match(escapeRegex(y))?.[0] == alpha));
                    if (t) {
                        cm.replaceRange(t[0], { line: cur.line, ch: cur.ch - alpha.length }, { line: cur.line, ch: cur.ch }); // Suggested by copilot. **works**???
                        return;
                    }
                    alpha = alpha.slice(1); // Lop off the head, if not found
                }
                const k = lines[cur.line].slice(cur.ch - 2, cur.ch);
                const t = Object.entries(aliases).find(x => x[1].includes(k));
                if (t) {
                    cm.replaceRange(t[0], { line: cur.line, ch: cur.ch - 2 }, { line: cur.line, ch: cur.ch });
                    return;
                }
                const num = line.match(/\d+$/)?.[0] || "";
                if (num) {
                    let n = BigInt(num);
                    const c = codepage.replace('»', '').replace('␠', ' ').replace('␤', '\n');
                    let compressed = '';
                    do {
                        compressed = c[Number(n % 255n)] + compressed;
                        n /= 255n;
                    } while (n);
                    compressed = '»' + compressed + '»';
                    if (compressed.length <= num.length) {
                        cm.replaceRange(compressed, { line: cur.line, ch: cur.ch - num.length }, { line: cur.line, ch: cur.ch });
                        return;
                    }
                }
                const str = line.match(/`[a-z ]+`$/)?.[0]?.slice(1, -1);
                if (str) {
                    let r = 0n;
                    for (const c of str)
                        r = 27n * r + BigInt(' abcdefghijklmnopqrstuvwxyz'.indexOf(c));
                    const c = codepage.replace('«', '').replace('␠', ' ').replace('␤', '\n');
                    let compressed = '';
                    do {
                        compressed = c[Number(r % 255n)] + compressed;
                        r /= 255n;
                    } while (r);
                    compressed = '«' + compressed + '«';
                    if (compressed.length <= str.length + 2) {
                        cm.replaceRange(compressed, { line: cur.line, ch: cur.ch - str.length - 2 }, { line: cur.line, ch: cur.ch });
                        return;
                    }
                }
            }
        }
    }

    for (const boxId of ['header', 'code', 'footer']) {
        console.log(boxId)
        globalThis['e_' + boxId] = CodeMirror.fromTextArea($$$('#' + boxId), boxId === 'code' ? codeMode : mode)
        globalThis['e_' + boxId].on('change', cm => {
            resize(globalThis['e_' + boxId])
            globalThis['e_' + boxId].value = cm.getValue()
        })
        resize(globalThis['e_' + boxId])

        var box = getCodeMirrorTextArea(boxId)
        if (box) {
            const capturedId = boxId
            box.addEventListener('focusin', event => selectedBox = capturedId)
        }
    }
}
