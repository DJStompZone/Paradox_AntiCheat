import { world, system } from "@minecraft/server";
import config from "../../../data/config.js";
import { dynamicPropertyRegistry } from "../../worldinitializeevent/registry.js";

async function bedrockvalidate(id: number) {
    // Get Dynamic Property
    const bedrockValidateBoolean = dynamicPropertyRegistry.get("bedrockvalidate_b");

    // Unsubscribe if disabled in-game
    if (bedrockValidateBoolean === false) {
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
        // bedrock validation
        if (player.dimension === world.getDimension("overworld") && config.modules.bedrockValidate.overworld) {
            try {
                await player.runCommandAsync(`fill ~-20 -64 ~-20 ~20 -64 ~20 bedrock`);
            } catch (error) {}
        }

        if (player.dimension === world.getDimension("nether") && config.modules.bedrockValidate.nether) {
            try {
                await player.runCommandAsync(`fill ~-10 0 ~-10 ~10 0 ~10 bedrock`);
            } catch (error) {}

            try {
                await player.runCommandAsync(`fill ~-10 127 ~-10 ~10 127 ~10 bedrock`);
            } catch (error) {}

            try {
                await player.runCommandAsync(`fill ~-5 5 ~-5 ~5 120 ~5 air 0 replace bedrock`);
            } catch (error) {}
        }
    }
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function BedrockValidate() {
    const bedrockValidateId = system.runInterval(() => {
        bedrockvalidate(bedrockValidateId);
    }, 20);
}
