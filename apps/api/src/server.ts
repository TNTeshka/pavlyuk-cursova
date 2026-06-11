import "dotenv/config";
import { app } from "./app.js";
import http from "node:http";
import { initSocket } from "./socket.js";

const port = Number(process.env.PORT ?? 4000);
const server = http.createServer(app);
initSocket(server);
server.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
