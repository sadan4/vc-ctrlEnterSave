/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 sadan
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { IPluginOptionComponentProps, OptionType } from "@utils/types";
import { findComponentByCodeLazy } from "@webpack";
import { Button, Toasts, useEffect, useState } from "@webpack/common";
// two lines because formatting removes the two spaces at the end of the line
/**
 * shortcut: keys & mods in a string, joined by "+"
 *
 *
 * ctrl => mod
 *
 *
 * all lowercase
 */
const KeyComponent = findComponentByCodeLazy<{ shortcut: string; }>("{let{shortcut");
interface KeyBind {
    ctrl: boolean,
    shift: boolean,
    alt: boolean,
    key: string;
}
const ModKeys = new Set(["Control", "Alt", "Shift", "Meta"]);
function KeybindRecorder({ onBind }: {
    onBind: (kb: KeyBind) => void;
}) {
    useEffect(() => {
        function eventListener(ev: KeyboardEvent) {
            if (ModKeys.has(ev.key)) return;
            ev.stopImmediatePropagation();
            onBind({
                alt: ev.altKey,
                ctrl: ev.ctrlKey,
                shift: ev.shiftKey,
                key: ev.key
            });
        }
        document.addEventListener("keydown", eventListener);
        return () => {
            document.removeEventListener("keydown", eventListener);
        };
    }, [onBind]);
    return <></>;
}
function KeymapElement(props: IPluginOptionComponentProps) {
    const [keybind, setKeybind] = useState<KeyBind>(settings.store.keymap ?? {});
    const [recording, setRecording] = useState(false);
    // there has to be a better way to do this
    const keybindString: string[] = [];
    if (keybind.alt) keybindString.push("alt");
    if (keybind.ctrl) keybindString.push("mod");
    if (keybind.shift) keybindString.push("shift");
    if (keybind.key) keybindString.push(keybind.key.toLowerCase());
    // dont let them save if they're recording
    return <>
        <p></p>
        <div style={{
            color: "var(--header-primary)"
        }}>Record Your Keymap</div>
        <Button onClick={() => {
            props.setError(!recording);
            setRecording(!recording);
        }}>{recording ? "Stop Recording" : "Start Recording"}</Button>
        {recording && <KeybindRecorder onBind={kb => {
            props.setError(false);
            setRecording(!recording);
            setKeybind(kb);
            props.setValue(kb);
        }} />}
        {keybind.key && <KeyComponent shortcut={keybindString.join("+")} />
        }
    </>;
}
function isMatch(ev: KeyboardEvent) {
    const s: KeyBind = settings.store.keymap;
    if (!s || Object.entries(s).length === 0) {
        Toasts.show({
            id: Toasts.genId(),
            message: "(CtrlEnterSave) Set your keybind in settings",
            type: Toasts.Type.FAILURE,
            options: {
                position: Toasts.Position.TOP,
                duration: 2000
            }
        });
    }
    return ev.altKey === s.alt
        && ev.key === s.key
        && ev.ctrlKey === s.ctrl
        && ev.shiftKey === s.shift;
}
const settings = definePluginSettings({
    keymap: {
        type: OptionType.COMPONENT,
        description: "the keybind that you want to save on",
        component: props => <KeymapElement {...props}></KeymapElement>
    }
});
export default definePlugin({
    settings,
    name: "CtrlEnterSave",
    description: "Adds a keybind to save settings. YOU HAVE TO SET THE KEYBIND IN SETTINGS.",
    authors: [
        {
            name: "sadan",
            id: 521819891141967883n
        }
    ],
    patches: [
        {
            find: ".SETTINGS_NOTICE_MESSAGE",
            replacement: {
                match: /onSave:(\i).*?children:\[/,
                replace: "$&$self.KeyListener($1),"
            }
        }
    ],

    KeyListener(onClickFunc: () => void) {
        useEffect(() => {
            function eventListener(ev: KeyboardEvent) {
                if (isMatch(ev)) {
                    ev.stopImmediatePropagation();
                    onClickFunc();
                }
            }
            document.addEventListener("keydown", eventListener);
            return () => {
                document.removeEventListener("keydown", eventListener);
            };
        });
        return <></>;
    }
});
