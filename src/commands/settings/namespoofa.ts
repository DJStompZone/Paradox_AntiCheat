import { getPrefix, sendMsg, sendMsgToPlayer } from "../../util.js";
import config from "../../data/config.js";
import { ChatSendAfterEvent, Player, world } from "@minecraft/server";
import { NamespoofA } from "../../penrose/TickEvent/namespoof/namespoof_a.js";
import { dynamicPropertyRegistry } from "../../penrose/WorldInitializeAfterEvent/registry.js";

function namespoofAHelp(player: Player, prefix: string, nameSpoofBoolean: string | number | boolean) {
    let commandStatus: string;
    if (!config.customcommands.namespoofa) {
        commandStatus = "§6[§4DISABLED§6]§f";
    } else {
        commandStatus = "§6[§aENABLED§6]§f";
    }
    let moduleStatus: string;
    if (nameSpoofBoolean === false) {
        moduleStatus = "§6[§4DISABLED§6]§f";
    } else {
        moduleStatus = "§6[§aENABLED§6]§f";
    }
    return sendMsgToPlayer(player, [
        `\n§o§4[§6Command§4]§f: namespoofa`,
        `§4[§6Status§4]§f: ${commandStatus}`,
        `§4[§6Module§4]§f: ${moduleStatus}`,
        `§4[§6Usage§4]§f: namespoofa [optional]`,
        `§4[§6Optional§4]§f: help`,
        `§4[§6Description§4]§f: Toggles checks for player's name exceeding character limitations.`,
        `§4[§6Examples§4]§f:`,
        `    ${prefix}namespoofa`,
        `    ${prefix}namespoofa help`,
    ]);
}

/**
 * @name namespoofA
 * @param {ChatSendAfterEvent} message - Message object
 * @param {string[]} args - Additional arguments provided (optional).
 */
export function namespoofA(message: ChatSendAfterEvent, args: string[]) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/settings/namespoofa.js:36)");
    }

    const player = message.sender;

    // Get unique ID
    const uniqueId = dynamicPropertyRegistry.get(player?.id);

    // Make sure the user has permissions to run the command
    if (uniqueId !== player.name) {
        return sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You need to be Paradox-Opped to use this command.`);
    }

    // Get Dynamic Property Boolean
    const nameSpoofBoolean = dynamicPropertyRegistry.get("namespoofa_b");

    // Check for custom prefix
    const prefix = getPrefix(player);

    // Was help requested
    const argCheck = args[0];
    if ((argCheck && args[0].toLowerCase() === "help") || !config.customcommands.namespoofa) {
        return namespoofAHelp(player, prefix, nameSpoofBoolean);
    }

    if (nameSpoofBoolean === false) {
        // Allow
        dynamicPropertyRegistry.set("namespoofa_b", true);
        world.setDynamicProperty("namespoofa_b", true);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has enabled §6NamespoofA§f!`);
        NamespoofA();
    } else if (nameSpoofBoolean === true) {
        // Deny
        dynamicPropertyRegistry.set("namespoofa_b", false);
        world.setDynamicProperty("namespoofa_b", false);
        sendMsg("@a[tag=paradoxOpped]", `§f§4[§6Paradox§4]§f ${player.name}§f has disabled §4NamespoofA§f!`);
    }
}
