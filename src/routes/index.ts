import { Hono } from "hono";
import auth from "./auth.route";
import userRoute from "./user.route";

const api = new Hono();

api.route("/auth", auth);
api.route("/user", userRoute);

export default api;
