import Group from "../../group";
import {GET} from "./handlers";

/**
 * Configures routes for the given group.
 *
 * @param {Group} group - The group object to which routes will be added.
 * @return {void} - Does not return a value.
 */
export default function routes(group: Group): void {
    group.addRoute('/health', GET)
}