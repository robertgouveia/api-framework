import Group from "../../../router/group";
import {POST} from "./handlers";

export default function routes(group: Group) {
    group.addRoute('/login', POST)
}