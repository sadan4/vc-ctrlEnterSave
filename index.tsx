/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 sadan
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import definePlugin from "@utils/types";
import { useEffect } from "@webpack/common";


export default definePlugin({
    name: "CtrlEnterSave",
    description: "",
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

    KeyListener(onClickFunc: () => void){
        useEffect(() => {
            function eventListener(ev: KeyboardEvent){
                if (ev.ctrlKey && ev.key === "Enter") onClickFunc();
            }
            document.addEventListener("keydown", eventListener);
            return () => {
                document.removeEventListener("keydown", eventListener);
            };
        });
        return <></>;
    }
});
