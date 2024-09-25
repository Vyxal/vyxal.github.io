// @ts-expect-error PRODUCTION gets replaced by webpack
if (PRODUCTION == "true") {
    fetch("https://discord.com/api/guilds/936437703048822844/widget.json")
        .then((r) => r.json())
        .then(({ presence_count: online }) => {
            document.getElementById("discord-online")!.innerText = online;
            document.getElementById("discord-online")!.ariaLabel = `${online} users online`;
        });
}