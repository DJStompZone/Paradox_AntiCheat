import * as Minecraft from "mojang-minecraft";
import { flag, getTags } from "../../../util.js";
import config from "../../../data/config.js";
import { setTickInterval } from "../../../timer/scheduling.js";

const World = Minecraft.World;
const Commands = Minecraft.Commands;

const AntiKnockbackA = () => {
    setTickInterval(() => {
        // run as each player
        for (let player of World.getPlayers()) {
            // fix a disabler method
            player.nameTag = player.nameTag.replace("\"", "");
            player.nameTag = player.nameTag.replace("\\", "");

            // get all tags of the player
            let playerTags = getTags(player);

            // antikb/a = checks for anti knockback and flags it
            if((player.velocity.y + player.velocity.x + player.velocity.z).toFixed(3) <= config.modules.antikbA.magnitude) {
                if(playerTags.includes('attacked') && !playerTags.includes('dead') && !playerTags.includes('gliding') && !playerTags.includes('levitating') && !playerTags.includes('flying')) {
                    try {
                        // Make sure Anti Knockback is turned on
	                    Commands.run(`testfor @a[name="${player.nameTag}",scores={antikb=1..}]`, World.getDimension("overworld"));
                        flag(player, "AntiKB", "A", "Movement", "Magnitude", (player.velocity.y + player.velocity.x + player.velocity.z).toFixed(3), true, false);
	                    Commands.run(`scoreboard players add @a[name="${player.nameTag}"] velocityvl 1`, World.getDimension("overworld"));
                    } catch(error) {}
                }
            }
        }
    }, 40) //Executes every 2 seconds
}

export { AntiKnockbackA }