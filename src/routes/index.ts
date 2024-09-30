import { Hono } from "hono";
import auth from "./auth.route";
import userRoute from "./user.route";
import receiptRoute from "./receipt.route";

const api = new Hono();

api.route("/auth", auth);
api.route("/user", userRoute);
api.route("/receipt", receiptRoute);

export default api;
