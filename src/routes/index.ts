import { getConnInfo } from "@hono/node-server/conninfo";
import { Hono } from "hono";
import { requestId } from "hono/request-id";

const api = new Hono();

api.use("*", requestId());

api.get("/v1", (c) => {
	return c.json({
		address: getConnInfo(c).remote.address,
		requestId: c.get("requestId"),
		time: new Date().toISOString(),
	});
});

export default api;
