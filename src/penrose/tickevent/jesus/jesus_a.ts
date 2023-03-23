import { world, Block, Player, Dimension, system, Vector } from "@minecraft/server";
import { startTimer } from "../../../util.js";
import { dynamicPropertyRegistry } from "../../worldinitializeevent/registry.js";

let blockAtPlayer0: Block;
let blockAtPlayer1: Block;
let playerTags: string[] = ["vanish", "swimming", "riding", "flying", "ground"];

const playerCount = new Map<Player, number>();

function timer(player: Player, dimension: Dimension, x: number, y: number, z: number) {
    player.teleport(new Vector(x, y - 2, z), dimension, 0, 0);
    playerCount.set(player, 0);
}

function jesusa(id: number) {
    // Get Dynamic Property
    const jesusaBoolean = dynamicPropertyRegistry.get("jesusa_b");

    // Unsubscribe if disabled in-game
    if (jesusaBoolean === false) {
        playerCount.clear();
        system.clearRun(id);
        return;
    }
    // run as each player
    for (const player of world.getPlayers()) {
        // Get unique ID
        const uniqueId = dynamicPropertyRegistry.get(player?.scoreboard?.id);

        // Skip if they have permission
        if (uniqueId === player.name) {
            continue;
        }

        const { x, y, z } = player.location;
        const dimension = player.dimension;
        try {
            // Below Below player
            blockAtPlayer0 = player.dimension.getBlock(new Vector(x, y - 1, z));
            // Below player
            blockAtPlayer1 = player.dimension.getBlock(new Vector(x, y, z));
        } catch (error) {}

        if (
            (playerTags.every((tag) => !player.hasTag(tag)) && blockAtPlayer1.typeId === "minecraft:water" && blockAtPlayer0.typeId === "minecraft:water") ||
            (playerTags.every((tag) => !player.hasTag(tag)) && blockAtPlayer1.typeId === "minecraft:lava" && blockAtPlayer0.typeId === "minecraft:lava")
        ) {
            const count = playerCount.get(player) || 0;
            playerCount.set(player, count + 1);

            /**
             * startTimer will make sure the key is properly removed
             * when the time for theVoid has expired. This will preserve
             * the integrity of our Memory.
             */
            const timerExpired = startTimer("jesusa", player.name, Date.now());
            if (timerExpired.includes("jesusa")) {
                const deletedKey = timerExpired.split(":")[1]; // extract the key without the namespace prefix
                playerCount.delete(deletedKey);
            }

            // Flag them after 2 seconds of activity
            if (count === 1) {
                timer(player, dimension, x, y, z);
            }
        }
        // Reset count
        if (player.hasTag("ground")) {
            playerCount.delete(player);
        }
    }
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function JesusA() {
    const jesusAId = system.runInterval(() => {
        jesusa(jesusAId);
    }, 20);
}
