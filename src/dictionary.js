let temp = { "short": "", "long": "" };

async function getShort() {
    const short = await fetch("https://raw.githubusercontent.com/Vyxal/Vyxal/version-3/shared/resources/ShortDictionary.txt")
        .then(res => res.text());
    return short;
}

async function getLong() {
    const long = await fetch("https://raw.githubusercontent.com/Vyxal/Vyxal/version-3/shared/resources/LongDictionary.txt")
        .then(res => res.text());
    return long;
}

getShort().then(short => temp.short = short);
getLong().then(long => temp.long = long);

const dictionary = temp;