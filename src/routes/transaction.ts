import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { randomUUID } from "crypto";

import { createTransactionBodySchema } from "../schemas";

export async function transactionRoutes(app: FastifyInstance) {
  app.get("/", async (request, reply) => {
    const transactions = await knex("transactions").select("*");

    return reply.status(200).send(transactions);
  });

  app.post("/", async (request, reply) => {
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    await knex("transactions").insert({
      id: randomUUID(),
      title: title,
      amount: type === "credit" ? amount : amount * -1,
    });

    return reply.status(201).send();
  });
}
