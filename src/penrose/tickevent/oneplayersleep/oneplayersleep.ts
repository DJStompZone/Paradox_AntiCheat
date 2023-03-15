import { world, EntityQueryOptions, Player, system } from "@minecraft/server";
import { dynamicPropertyRegistry } from "../../worldinitializeevent/registry.js";

async function queueSleep(player: Player, id: number) {
    await player.runCommandAsync(`time set 126553000`);
    await player.runCommandAsync(`weather clear`);
    const hotbarBoolean = dynamicPropertyRegistry.get("hotbar_b");
    if (hotbarBoolean === undefined || hotbarBoolean === false) {
        await player.runCommandAsync(`title @a[tag=!vanish] actionbar Good Morning`);
    }
    system.clearRun(id);
}

function ops(opsID: number) {
    // Get Dynamic Property
    const opsBoolean = dynamicPropertyRegistry.get("ops_b");

    // Unsubscribe if disabled in-game
    if (opsBoolean === false) {
        system.clearRun(opsID);
        return;
    }
    const filter = new Object() as EntityQueryOptions;
    filter.tags = ["sleeping"];
    const filterPlayers = [...world.getPlayers(filter)];
    if (filterPlayers.length) {
        const id = system.runInterval(() => {
            queueSleep(filterPlayers[0], id);
        }, 40);
    }
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export function OPS() {
    const opsId = system.runInterval(() => {
        ops(opsId);
    });
}
