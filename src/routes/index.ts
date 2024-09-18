import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono } from "hono";
import { requestId } from "hono/request-id";
import auth from "./auth.route";

const api = new Hono();

api.use("*", requestId());

api.route("/auth", auth);

export default api;
