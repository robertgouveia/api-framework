import Group from "../../../pkg/router/group";
import {GET} from "./handlers";
import DB from "../../../pkg/database/db";

export default function routes(group: Group, db: DB) {
    group.addRoute('/health', GET)
}