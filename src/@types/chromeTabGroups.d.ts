declare namespace chrome.tabs {
    export interface QueryInfo {
        /**
         * Optional. Whether the tabs have completed loading.
         * One of: "loading", or "complete"
         */
        status?: 'loading' | 'complete';
        /**
         * Optional. Whether the tabs are in the last focused window.
         * @since Chrome 19.
         */
        lastFocusedWindow?: boolean;
        /** Optional. The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window. */
        windowId?: number;
        /**
         * Optional. The type of window the tabs are in.
         * One of: "normal", "popup", "panel", "app", or "devtools"
         */
        windowType?: 'normal' | 'popup' | 'panel' | 'app' | 'devtools';
        /** Optional. Whether the tabs are active in their windows. */
        active?: boolean;
        /**
         * Optional. The position of the tabs within their windows.
         * @since Chrome 18.
         */
        index?: number;
        /** Optional. Match page titles against a pattern. */
        title?: string;
        /** Optional. Match tabs against one or more URL patterns. Note that fragment identifiers are not matched. */
        url?: string | string[];
        /**
         * Optional. Whether the tabs are in the current window.
         * @since Chrome 19.
         */
        currentWindow?: boolean;
        /** Optional. Whether the tabs are highlighted. */
        highlighted?: boolean;
        /**
         * Optional.
         * Whether the tabs are discarded. A discarded tab is one whose content has been unloaded from memory, but is still visible in the tab strip. Its content gets reloaded the next time it's activated.
         * @since Chrome 54.
         */
        discarded?: boolean;
        /**
         * Optional.
         * Whether the tabs can be discarded automatically by the browser when resources are low.
         * @since Chrome 54.
         */
        autoDiscardable?: boolean;
        /** Optional. Whether the tabs are pinned. */
        pinned?: boolean;
        /**
         * Optional. Whether the tabs are audible.
         * @since Chrome 45.
         */
        audible?: boolean;
        /**
         * Optional. Whether the tabs are muted.
         * @since Chrome 45.
         */
        muted?: boolean;

        /**
         * Optional.
         * The ID of the group that the tabs are in, or tabGroups.TAB_GROUP_ID_NONE for ungrouped tabs.
         * @since Chrome 88
         */
        groupId?: number;
    }
}

////////////////////
// TabGroups
////////////////////
/**
 * Use the chrome.tabGroups API to interact with the browser's tab grouping system.
 * You can use this API to modify and rearrange tab groups in the browser.
 * To group and ungroup tabs, or to query what tabs are in groups, use the chrome.tabs API.
 * Permissions: "tabGroups", Manifest v3
 * @since Chrome 89.
 */
declare namespace chrome.tabGroups {
    export interface TabGroup {
        /**
         * Whether the group is collapsed. A collapsed group is one whose tabs are hidden.
         */
        collabled: boolean;

        /**
         * The group's color.
         */
        color: Color;

        /**
         * The ID of the group. Group IDs are unique within a browser session.
         */
        id: number;

        /**
         * Optional.
         * The title of the group.
         */
        title?: string;

        /**
         * The ID of the window that contains the group.
         */
        windowId: number;
    }

    export interface MoveProperties {
        /** The position to move the window to. -1 will place the tab at the end of the window. */
        index: number;
        /** Optional. Defaults to the window the tab is currently in. */
        windowId?: number;
    }

    export interface QueryInfo {
        /**
         * Optional.
         * Whether the groups are collapsed.
         */
        collapsed?: boolean;

        /**
         * Optional.
         * The color of the groups.
         */
        color?: Color;

        /**
         * Optional.
         * Match group titles against a pattern.
         */
        title?: string;

        /** 
         * Optional.
         * The ID of the parent window, or windows.WINDOW_ID_CURRENT for the current window.
         */
        windowId?: number;
    }

    export interface UpdateProperties {

        /**
         * Optional.
         * Whether the group should be collapsed.
         */
        collapsed?: boolean;

        /**
         * Optional.
         * The color of the group.
         */
        color?: Color;

        /**
         * Optional.
         * The title of the group.
         */
        title?: string;
    }

    export interface TabGroupEvent extends chrome.events.Event<(group: TabGroup) => void> { }

    /**
     * Fired when a group is created.
     */
    export var onCreated: TabGroupEvent;

    /**
     * Fired when a group is moved within a window. Move events are still fired for the individual tabs within the group,
     * as well as for the group itself. This event is not fired when a group is moved between windows;
     * instead, it will be removed from one window and created in another.
     */
    export var onMoved: TabGroupEvent;

    /**
     * Fired when a group is closed, either directly by the user or automatically because it contained zero tabs.
     */
    export var onRemoved: TabGroupEvent;

    /**
     * Fired when a group is updated.
     */
    export var onUpdated: TabGroupEvent;

    /**
     * The group's color.
     */
    export type Color = "grey" | "blue" | "red" | "yellow" | "green" | "pink" | "purple" | "cyan";

    /**
     * An ID that represents the absence of a group.
     */
    export const TAB_GROUP_ID_NONE: number;

    /**
     * Retrieves details about the specified group.
     */
    export function get(groupId: number, callback: (group: TabGroup) => void): void;

    /**
     * Moves the group and all its tabs within its window, or to a new window.
     * @param groupId The ID of the group to move.
     */
    export function move(groupId: number, moveProperties: MoveProperties, callback: (group: TabGroup) => void): void;

    /**
     * Gets all groups that have the specified properties, or all groups if no properties are specified.
     */
    export function query(queryInfo: QueryInfo, callback: (result: TabGroup[]) => void): void;

    /**
     * Modifies the properties of a group. Properties that are not specified in updateProperties are not modified.
     * @param groupId The ID of the group to modify.
     */
    export function update(groupId: number, updateProperties: object, callback: (group: TabGroup) => void): void;
}