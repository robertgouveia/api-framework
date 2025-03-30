import Group from "../../../router/group";
import {GET} from "./handlers";

export default function routes(group: Group) {
    group.addRoute('/health', GET)
}