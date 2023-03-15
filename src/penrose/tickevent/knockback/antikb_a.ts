import { EntityInventoryComponent, world, system } from "@minecraft/server";
import { flag, setScore } from "../../../util.js";
import config from "../../../data/config.js";
import { dynamicPropertyRegistry } from "../../worldinitializeevent/registry.js";

async function antiknockbacka(id: number) {
    // Get Dynamic Property
    const antikbBoolean = dynamicPropertyRegistry.get("antikb_b");

    // Unsubscribe if disabled in-game
    if (antikbBoolean === false) {
        system.clearRun(id);
        return;
    }
    // run as each player
    for (const player of world.getPlayers()) {
        // Get unique ID
        const uniqueId = dynamicPropertyRegistry.get(player.scoreboard.id);

        // Skip if they have permission
        if (uniqueId === player.name) {
            continue;
        }

        const hand = player.selectedSlot;

        const invContainer = player.getComponent("inventory") as EntityInventoryComponent;
        const inventory = invContainer.container;
        const equippedItem = inventory.getItem(hand);

        let defineItem = "";
        // Check if object returns defined
        if (equippedItem !== undefined) {
            defineItem = equippedItem.typeId;
        }
        // Verify if property of object is a trident and skip if it is
        if (defineItem === "minecraft:trident") {
            continue;
        }

        // antikb/a = checks for anti knockback and flags it
        if (Number((player.velocity.y + player.velocity.x + player.velocity.z).toFixed(3)) <= config.modules.antikbA.magnitude) {
            if (player.hasTag("attacked") && !player.hasTag("dead") && !player.hasTag("gliding") && !player.hasTag("levitating") && !player.hasTag("flying")) {
                try {
                    // Make sure Anti Knockback is turned on
                    await player.runCommandAsync(`testfor @s[scores={antikb=1..}]`);
                    flag(player, "AntiKB", "A", "Movement", null, null, "Magnitude", (player.velocity.y + player.velocity.x + player.velocity.z).toFixed(3), true, null);
                    setScore(player, "velocityvl", 1, true);
                } catch (error) {}
            }
        }
    }
    return;
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function AntiKnockbackA() {
    const antiKnockbackAId = system.runInterval(() => {
        antiknockbacka(antiKnockbackAId);
    }, 40);
}
