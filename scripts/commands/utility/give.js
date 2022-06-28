/* eslint no-var: "off"*/

import { world } from "mojang-minecraft";
import { ItemStack } from "mojang-minecraft";
import { Items } from "mojang-minecraft";
import { MinecraftItemTypes } from "mojang-minecraft";
import config from "../../data/config.js";
import maxItemStack, { defaultMaxItemStack } from "../../data/maxstack.js";
import { crypto, getPrefix, sendMsgToPlayer, toCamelCase } from "../../util.js";

const World = world;

function giveHelp(player, prefix) {
    let commandStatus;
    if (!config.customcommands.fullreport) {
        commandStatus = "§6[§4DISABLED§6]§r";
    } else {
        commandStatus = "§6[§aENABLED§6]§r";
    }
    return sendMsgToPlayer(player, [
        `\n§4[§6Command§4]§r: give`,
        `§4[§6Status§4]§r: ${commandStatus}`,
        `§4[§6Usage§4]§r: give [optional]`,
        `§4[§6Optional§4]§r: username item amount, help`,
        `§4[§6Description§4]§r: Gives player items.`,
        `§4[§6Examples§4]§r:`,
        `    ${prefix}give ${player.name} diamond 64`,
        `    ${prefix}give ${player.name} iron_ore 64`,
        `    ${prefix}give ${player.name} tropical_fish 64`,
        `    ${prefix}give help`,
    ]);
}

/**
 * @name give
 * @param {object} message - Message object
 * @param {array} args - Additional arguments provided (optional).
 */
export function give(message, args) {
    // validate that required params are defined
    if (!message) {
        return console.warn(`${new Date()} | ` + "Error: ${message} isnt defined. Did you forget to pass it? (./commands/utility/give.js:32)");
    }
    
    message.cancel = true;

    let player = message.sender;
    
    // Check for hash/salt and validate password
    let hash = player.getDynamicProperty('hash');
    let salt = player.getDynamicProperty('salt');
    let encode;
    try {
        encode = crypto(salt, config.modules.encryption.password);
    } catch (error) {}
    // make sure the user has permissions to run the command
    if (hash === undefined || encode !== hash) {
        return sendMsgToPlayer(player, `§r§4[§6Paradox§4]§r You need to be Paradox-Opped to use this command.`);
    }

    // Check for custom prefix
    let prefix = getPrefix(player);

    // Was help requested
    let argCheck = args[0];
    if (argCheck && args[0].toLowerCase() === "help" || !config.customcommands.give) {
        return giveHelp(player, prefix);
    }

    // Are there arguements
    if (!args.length) {
        return tprHelp(player, prefix);
    }
    
    // Try to find the player requested
    let member;
    if (args.length) {
        for (let pl of World.getPlayers()) {
            if (pl.nameTag.toLowerCase().includes(args[0].toLowerCase().replace(/"|\\|@/g, ""))) {
                member = pl;
            }
        }
    }
    
    // Are they online?
    if (!member) {
        return sendMsgToPlayer(player, `§r§4[§6Paradox§4]§r Couldnt find that player!`);
    }

    /**
     * Verify if the parameters are valid to prevent errors
     * args[0] = username
     * args[1] = item
     * args[2] = amount
     */
    let confirmItem = false;
    let itemStringConvert = toCamelCase(args[1])
    for (let itemValidate in MinecraftItemTypes) {
        if (itemStringConvert === itemValidate) {
            confirmItem = true;
            break;
        }
    }
    if (confirmItem) {
        if (isNaN(args[2])) {
            /**
             * This parameter is invalid so we will remove it and add a default value of 1.
             */
            args.splice(2, 1, '1')
        }
        const maxStack = maxItemStack[itemStringConvert.replace(itemStringConvert, "minecraft:" + args[1])] ?? defaultMaxItemStack;
        if (maxStack >= args[2]) {
            let inv = member.getComponent('inventory').container
            let item = new ItemStack(MinecraftItemTypes[itemStringConvert], Number(args[2]));
            inv.addItem(item);
            return sendMsgToPlayer(player, `§r§4[§6Paradox§4]§r ${member.name} was given ${args[1]} x${args[2]}.`);
        } else {
            return sendMsgToPlayer(player, `§r§4[§6Paradox§4]§r This stack is too high! ${maxStack} is the max. Try again.`);
        }
    } else {
        return sendMsgToPlayer(player, `§r§4[§6Paradox§4]§r This item could not be found! Try again.`);
    }
}
