import { BlockBreakAfterEvent, PlayerLeaveAfterEvent, world } from "@minecraft/server";
import { xrayblocks } from "../../../data/xray.js";
import { sendMsg } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";

// Define different thresholds for different ore categories
const XRAY_THRESHOLD_COMMON = 5;
const XRAY_THRESHOLD_UNCOMMON = 4;
const XRAY_THRESHOLD_RARE = 3;
const XRAY_THRESHOLD_VERY_RARE = 2;

interface XrayData {
    lastNotifyTime: number;
}

// Use a global variable to store xrayData map
let xrayData: Map<string, XrayData> = new Map();

// Use a global variable to store the number of blocks broken within the last minute
let blocksBrokenCount: Map<string, number> = new Map();

function isXraySuspicious(playerName: string, blockId: string): boolean {
    const data = xrayData.get(playerName);
    if (!data) return false;
    const currentTime = Date.now();
    const timeSinceLastNotify = currentTime - data.lastNotifyTime;

    // Determine the threshold based on the block being broken
    let threshold = 0;
    if (blockId in xrayblocks) {
        if (
            blockId === "minecraft:iron_ore" ||
            blockId === "minecraft:gold_ore" ||
            blockId === "minecraft:lapis_ore" ||
            blockId === "minecraft:deepslate_iron_ore" ||
            blockId === "minecraft:deepslate_gold_ore" ||
            blockId === "minecraft:deepslate_lapis_ore"
        ) {
            threshold = XRAY_THRESHOLD_COMMON;
        } else if (blockId === "minecraft:redstone_ore" || blockId === "minecraft:deepslate_redstone_ore") {
            threshold = XRAY_THRESHOLD_UNCOMMON;
        } else if (blockId === "minecraft:diamond_ore" || blockId === "minecraft:emerald_ore" || blockId === "minecraft:deepslate_diamond_ore" || blockId === "minecraft:deepslate_emerald_ore") {
            threshold = XRAY_THRESHOLD_RARE;
        } else if (blockId === "minecraft:ancient_debris") {
            threshold = XRAY_THRESHOLD_VERY_RARE;
        }
    }

    return blocksBrokenCount.get(playerName) >= threshold && timeSinceLastNotify <= 60000;
}

function onPlayerLogout(event: PlayerLeaveAfterEvent): void {
    // Remove the player's data from the map when they log off
    const playerName = event.playerName;
    xrayData.delete(playerName);
    blocksBrokenCount.delete(playerName);
}

function xraya(object: BlockBreakAfterEvent) {
    // Get Dynamic Property
    const xrayBoolean = dynamicPropertyRegistry.get("xraya_b");

    // Unsubscribe if disabled in-game
    if (xrayBoolean === false) {
        xrayData.clear();
        blocksBrokenCount.clear();
        world.afterEvents.blockBreak.unsubscribe(xraya);
        world.afterEvents.playerLeave.unsubscribe(onPlayerLogout);
        return;
    }

    // Properties from class
    const { player, brokenBlockPermutation } = object;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Skip if they have permission
    if (uniqueId === player.name) {
        return;
    }

    // Player coordinates
    const { x, y, z } = player.location;

    if (brokenBlockPermutation.type.id in xrayblocks) {
        const playerName = player.name;
        if (!xrayData.has(playerName)) {
            xrayData.set(playerName, { lastNotifyTime: 0 });
        }
        if (!blocksBrokenCount.has(playerName)) {
            blocksBrokenCount.set(playerName, 0);
        }
        const playerData = xrayData.get(playerName)!;

        // Increment the count for the player
        blocksBrokenCount.set(playerName, (blocksBrokenCount.get(playerName) || 0) + 1);

        // Reset the timer whenever we add new ore data
        playerData.lastNotifyTime = Date.now();

        if (isXraySuspicious(playerName, brokenBlockPermutation.type.id)) {
            sendMsg(
                `@a[tag=notify]`,
                `§r§4[§6Paradox§4]§r §4[Xray]§r ${playerName}§r§6 has found §r${blocksBrokenCount.get(playerName)}x ${brokenBlockPermutation.type.id.replace("minecraft:", "")}§6 at X=§r${x.toFixed(0)}§6 Y=§r${y.toFixed(0)}§6 Z=§r${z.toFixed(0)}.`
            );
            // Reset the count after notifying
            blocksBrokenCount.set(playerName, 0);
        }
    }
}

const XrayA = () => {
    world.afterEvents.blockBreak.subscribe(xraya);
    world.afterEvents.playerLeave.subscribe(onPlayerLogout); // Subscribe to player logout events
};

export { XrayA };
