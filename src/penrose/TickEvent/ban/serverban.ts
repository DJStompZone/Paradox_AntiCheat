import { world, EntityQueryOptions, system } from "@minecraft/server";
import { allscores, banMessage, getScore, sendMsg, sendMsgToPlayer, setScore } from "../../../util.js";
import { queueUnban } from "../../../commands/moderation/unban.js";

function serverban() {
    const filter: EntityQueryOptions = {
        tags: ["isBanned"],
    };
    const filteredPlayers = world.getPlayers(filter);
    // run as each player
    for (const player of filteredPlayers) {
        if (queueUnban.has(player.name)) {
            // Remove tag
            player.removeTag("isBanned");

            const tags = player.getTags();

            // This removes old ban stuff
            tags.forEach((t) => {
                if (t.startsWith("Reason:")) {
                    player.removeTag(t);
                }
                if (t.startsWith("By:")) {
                    player.removeTag(t);
                }
            });

            // Remove player from queue
            queueUnban.delete(player.name);
            //clear violations
            const scores = allscores;
            scores.forEach((objective) => {
                const score = getScore(objective, player);
                //if the player has a violation then we reset the score.
                if (score > 0) {
                    //reset the score
                    setScore(player, objective, 0);
                }
            });

            // Let staff and player know they are unbanned
            sendMsgToPlayer(player, `§f§4[§6Paradox§4]§f You have been unbanned.`);
            sendMsg(`@a[tag=paradoxOpped]`, `§f§4[§6Paradox§4]§f ${player.name} has been unbanned.`);
            continue;
        }
        // Ban message
        else banMessage(player);
    }
}

/**
 * We store the identifier in a variable
 * to cancel the execution of this scheduled run
 * if needed to do so.
 */
export const ServerBan = system.runInterval(() => {
    serverban();
}, 40);
