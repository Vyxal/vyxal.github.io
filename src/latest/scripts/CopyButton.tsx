import { useState } from "react";
import { Button } from "react-bootstrap";

type CopyButtonParams = {
    className?: string,
    title: string,
    generate: () => string,
};
export function CopyButton({ className, title, generate }: CopyButtonParams) {
    const TITLES = {
        copy: title,
        copied: "Copied!",
        failed: "Failed to copy",
    };
    const ICONS = {
        copy: "bi-clipboard",
        copied: "bi-clipboard-check",
        failed: "bi-clipboard-x",
    };
    const VARIANTS = {
        copy: "outline-primary",
        copied: "success",
        failed: "danger",
    };
    const [state, setState] = useState<"copy" | "copied" | "failed">("copy");

    return (
        <Button
            variant={VARIANTS[state]}
            className={className}
            title={TITLES[state]}
            onClick={async() => {
                if (state == "copy") {
                    try {
                        // @ts-expect-error Apparently "clipboard-write" isn't a permission TS knows
                        const permission = await navigator.permissions.query({ name: "clipboard-write" });
                        if (permission.state != "granted") {
                            console.error("Clipboard write permission not granted, is this a secure context?");
                            setState("failed");
                            return;
                        }
                    } catch {
                        // we're probably on firefox
                    }
                    try {
                        await navigator.clipboard.writeText(generate());
                    } catch (e) {
                        setState("failed");
                        console.error("Failed to copy", e);
                    } finally {
                        setTimeout(() => setState("copy"), 1500);
                    }
                }
            }}
        >
            <i className={`bi ${ICONS[state]}`}></i>
        </Button>
    );
}
