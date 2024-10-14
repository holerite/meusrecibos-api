import { Hono } from "hono";
import auth from "./auth.route";
import user from "./user.route";
import receipt from "./receipt.route";
import employee from "./employees.route" ;
import dashboard from './dashboard.route'

const api = new Hono();

api.route("/auth", auth);
api.route("/user", user);
api.route("/employees", employee);
api.route("/receipt", receipt);
api.route("/dashboard", dashboard);

export default api;
