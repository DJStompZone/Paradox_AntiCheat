import { world, EntityQueryOptions, GameMode, system } from "@minecraft/server";
import { getScore, sendMsg, setScore } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../worldinitializeevent/registry.js";

async function adventure(id: number) {
    // Get Dynamic Property
    const adventureGMBoolean = dynamicPropertyRegistry.get("adventuregm_b");
    const creativeGMBoolean = dynamicPropertyRegistry.get("creativegm_b");
    const survivalGMBoolean = dynamicPropertyRegistry.get("survivalgm_b");

    // Unsubscribe if disabled in-game
    if (adventureGMBoolean === false) {
        system.clearRun(id);
        return;
    }
    const filter = new Object() as EntityQueryOptions;
    // 2 = adventure
    filter.gameMode = GameMode.adventure;
    // Run as each player
    for (const player of world.getPlayers(filter)) {
        // Get unique ID
        const uniqueId = dynamicPropertyRegistry.get(player.scoreboard.id);

        // Skip if they have permission
        if (uniqueId === player.name) {
            continue;
        }
        // Make sure they didn't enable all of them in config.js as this will have a negative impact
        if (survivalGMBoolean === true && creativeGMBoolean === true) {
            // Default to adventure for safety
            dynamicPropertyRegistry.set("adventuregm_b", false);
            world.setDynamicProperty("adventuregm_b", false);
        }
        // Are they in adventure? Fix it.
        if (survivalGMBoolean === true && creativeGMBoolean === false) {
            // Creative is allowed so set them to creative
            await player.runCommandAsync(`gamemode c`);
        }
        if (survivalGMBoolean === false && creativeGMBoolean === true) {
            // Survival is allowed so set them to survival
            await player.runCommandAsync(`gamemode s`);
        }
        // If both are allowed then default to survival
        if (survivalGMBoolean === false && creativeGMBoolean === false) {
            // Survival is allowed so set them to survival
            await player.runCommandAsync(`gamemode s`);
        }
        setScore(player, "gamemodevl", 1, true);
        sendMsg("@a[tag=notify]", `§r§4[§6Paradox§4]§r ${player.nameTag} §6has tried to change their gamemode §7(Gamemode_A)§6.§4 VL= ${getScore("gamemodevl", player)}`);
    }
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function Adventure() {
    const adventureId = system.runInterval(() => {
        adventure(adventureId);
    });
}
