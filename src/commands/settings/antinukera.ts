import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { NukerA } from "../../penrose/BlockBreakAfterEvent/nuker/nuker_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function antinukeraHelp(player: Player, prefix: string, antiNukerABoolean: string | number | boolean) {
    let commandStatus: string;
    if (!config.customcommands.antinukera) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus: string;
    if (antiNukerABoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    } else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: antinukera`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: antinukera [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Checks player's for nuking blocks.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}antinukera`,
        `    ${prefix}antinukera help`,
    ]);
}

/**
 * @name antinukerA
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function antinukerA(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/antinukera.js:36)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to use this command.`);
    }

    // Get Dynamic Property Boolean
    const antiNukerABoolean = dynamicPropertyRegistry.get("antinukera_b");

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.antinukera) {
        return antinukeraHelp(player, prefix, antiNukerABoolean);
    }

    if (antiNukerABoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("antinukera_b", true);
        world.setDynamicProperty("antinukera_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has enabled §6AntiNukerA§f!`);
        NukerA();
    } else if (antiNukerABoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("antinukera_b", false);
        world.setDynamicProperty("antinukera_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has disabled §4AntiNukerA§f!`);
    }
}
