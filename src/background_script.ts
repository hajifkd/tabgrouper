import Tab = chrome.tabs.Tab;
import TabGroup = chrome.tabGroups.TabGroup;

class TabGroupInfo {
    tabGroup: TabGroup;
    tabs: Tab[];

    constructor(tabGroup: TabGroup, tabs: Tab[]) {
        this.tabGroup = tabGroup;
        this.tabs = tabs;
    }
}

function queryTabs(group: TabGroup): Promise<Tab[]> {
    return chrome.tabs.query({ groupId: group.id }); // Oops
}

function main() {
    const groupsInWindow = new Map<number, TabGroupInfo[]>();
    const groups = new Map<number, TabGroup>();
    chrome.tabGroups.query({}, gs => gs.forEach(g => groups.set(g.id, g)));
    chrome.tabGroups.onCreated.addListener(g => groups.set(g.id, g));
    chrome.tabGroups.onUpdated.addListener(g => {
        groups.set(g.id, g);
        console.log(groups);
    });

    // chrome.tabs.query does not works
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1181819&q=query&can=2

    chrome.windows.onRemoved.addListener(windowId => {
        console.log(`window id ${windowId} is closed`);
        chrome.tabGroups.query({ windowId }, groups => {
            for (const group of groups) {
                console.log(`group title ${group.title} is closing.`);
            }
        });
    });
}

main();