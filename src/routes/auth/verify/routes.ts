import Group from "../../../router/group";
import {PUT} from "./handlers";

export default function routes(group: Group) {
    group.addRoute('/verify', PUT)
}