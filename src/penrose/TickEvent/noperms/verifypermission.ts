import { world, EntityQueryOptions, system } from "@minecraft/server";
import config from "../../../data/config.js";
import { crypto, sendMsg } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../WorldInitializeAfterEvent/registry.js";

function verifypermission() {
    const filter: EntityQueryOptions = {
        tags: ["paradoxOpped"],
    };
    const filteredPlayers = world.getPlayers(filter);
    // Let's check the players for illegal permissions
    for (const player of filteredPlayers) {
        // Check for hash/salt and validate password
        let hash, salt;
        try {
            hash = player.getDynamicProperty("hash");
            salt = player.getDynamicProperty("salt");
        } catch (error) {
            if (config.debug) {
                console.error(`Error retrieving dynamic properties for player: ${player.name}`);
                console.error(error);
                console.log("Player:", player.name);
            }
            continue; // Skip to the next player
        }

        // Use either the operator's ID or the encryption password as the key
        const key = config.encryption.password ? config.encryption.password : player.id;

        // Generate the hash
        const encode = crypto?.(salt, key);
        if (encode === hash) {
            // Make sure their unique ID exists in case of a reload
            if (dynamicPropertyRegistry.has(player.id) === false) {
                dynamicPropertyRegistry.set(player.id, player.name);
            }
            continue;
        } else {
            player.removeDynamicProperty("hash");
            player.removeDynamicProperty("salt");
            dynamicPropertyRegistry.delete(player.id);
            player.removeTag("paradoxOpped");
        }

        sendMsg("@a[tag=notify]", `§f§4[§6Paradox§4]§f ${player.name} had unauthorized permissions. Permissions removed!`);
    }
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export const VerifyPermission = system.runInterval(() => {
    verifypermission();
}, 20);
