import Tab = chrome.tabs.Tab;
import TabGroup = chrome.tabGroups.TabGroup;

import { nonNullFilter } from './util';

const KEY_CURRENT = 'current';

interface TabGroupData {
    groupName?: string;
    groupColor?: chrome.tabGroups.Color;
    tabUrls: (string | undefined)[];
}

class TabGroupInfo {
    tabGroup: TabGroup | undefined;
    tabs: Map<number, Tab>; // tabs[tab.id] = tab

    constructor(tabGroup: TabGroup | undefined, tabs: Tab[]) {
        this.tabGroup = tabGroup;
        this.tabs = new Map();
        tabs.forEach(tab => { if (tab.id != null) { this.tabs.set(tab.id, tab) } });
    }

    toData(): TabGroupData {
        return {
            groupName: this.tabGroup?.title,
            groupColor: this.tabGroup?.color,
            tabUrls: [...this.tabs.values()].map(tab => tab.url)
        };
    }
}

type WindowGroupInfo = Map<number, Map<number, TabGroupInfo>>;

function appendTabGroup(windowGroupInfos: WindowGroupInfo, groupId: number, windowId: number, newGroup?: TabGroup) {
    if (!windowGroupInfos.has(windowId)) {
        const groupInfo = new Map<number, TabGroupInfo>();
        groupInfo.set(groupId, new TabGroupInfo(newGroup, []));
        windowGroupInfos.set(windowId, groupInfo);
    } else {
        windowGroupInfos.get(windowId)?.set(groupId, new TabGroupInfo(newGroup, []));
    }
}

function saveCurrentWindow(info: TabGroupData[]) {
    const obj: { [k: string]: TabGroupData[] } = Object();
    obj[KEY_CURRENT] = info;
    chrome.storage.local.set(obj);
}

async function registerHandlers() {
    const windowGroupInfos: WindowGroupInfo = new Map(); // windowId => groupId => Info
    (await new Promise<TabGroup[]>(resolve => chrome.tabGroups.query({}, resolve)))
        .forEach(group => appendTabGroup(windowGroupInfos, group.id, group.windowId, group));
    chrome.tabGroups.onCreated.addListener(group => appendTabGroup(windowGroupInfos, group.id, group.windowId, group));
    chrome.tabGroups.onUpdated.addListener(group => {
        console.log("group updated");
        console.log(windowGroupInfos);
        const info = windowGroupInfos.get(group.windowId);
        if (info != null) {
            const groupInfo = info.get(group.id);
            if (groupInfo != null) {
                groupInfo.tabGroup = group
            }
            saveCurrentWindow([...info.values()].map(i => i.toData()));
        }
    });
    chrome.tabGroups.onRemoved.addListener(group => {
        // todo check if the window is closing
        const info = windowGroupInfos.get(group.windowId);
        if (info != null) {
            info.delete(group.id);
            saveCurrentWindow([...info.values()].map(i => i.toData()));
        }
    })
    console.log(windowGroupInfos);

    // chrome.tabs.query does not works
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1181819&q=query&can=2
    const updateTab = (tab: Tab) => {
        console.log("tab updated");
        if (tab.id != null) {
            let info = windowGroupInfos.get(tab.windowId);
            if (info == undefined) {
                appendTabGroup(windowGroupInfos, tab.groupId, tab.windowId, undefined);
                info = windowGroupInfos.get(tab.windowId);
            }
            if (info != undefined) {
                // initialize tabgroup
                info.get(tab.groupId)?.tabs.set(tab.id, tab);
                saveCurrentWindow([...info.values()].map(i => i.toData()));
            }
        }
    };
    (await chrome.tabs.query({})).forEach(updateTab);
    chrome.tabs.onCreated.addListener(updateTab);
    chrome.tabs.onUpdated.addListener((_1, _2, tab) => updateTab(tab));
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
        // todo remove tabid
        // dict[tabid] => groupid should be needed.
    });

    let keyNum = 0;
    chrome.windows.onRemoved.addListener(windowId => {
        console.log(`window id ${windowId} is closed`);
        const info = windowGroupInfos.get(windowId)?.values();
        if (info != undefined) {
            const obj: { [k: string]: TabGroupInfo[] } = Object();
            obj[keyNum.toString()] = [...info];
            chrome.storage.local.set(obj);
        }
        keyNum = keyNum + 1; // eslint does not accept { (keyNum++) : foo } or keyNum += 1
        console.log(info);
        windowGroupInfos.delete(windowId);
    });
}

function restoreGroups() {
    console.log("restoring");
    chrome.storage.local.get(null, (obj: { [key: string]: TabGroupData[] }) => {
        console.log(obj);
        Object.entries(obj).forEach(([windowKey, groupsInWindow]) => {
            if (windowKey != KEY_CURRENT) {
                // TODO create window
            }
            groupsInWindow.map(async data => {
                console.log(data);
                const tabs = await Promise.all(data.tabUrls.map(url => new Promise<Tab>(resolve => chrome.tabs.create({ url: url }, resolve))));
                chrome.tabs.group({ tabIds: tabs.map(tab => tab.id).filter(nonNullFilter) }, groupId => {
                    chrome.tabGroups.update(groupId, { title: data.groupName, color: data.groupColor }, () => {
                        //
                    });
                })
            })
        });
        chrome.storage.local.clear();
    });
}

function main() {
    restoreGroups();
    registerHandlers();
}

main();