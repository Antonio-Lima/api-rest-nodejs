import crypto from "node:crypto";

import fastify from "fastify";
import { env } from "./env";
import { transactionRoutes } from "./routes/transaction";

const app = fastify();

app.register(transactionRoutes, {
  prefix: "transactions",
});

app.listen({ port: env.PORT }).then(() => {
  console.log("HTTP server is running");
});
