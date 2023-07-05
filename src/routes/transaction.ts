import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";

import { createTransactionBodySchema } from "../schemas";
import { checkSessionId } from "../middlewares/check-session-id";

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionId],
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      if (!sessionId) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const transactions = await knex("transactions").where({
        session_id: sessionId,
      });

      return { transactions };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });
      const { id } = getTransactionParamsSchema.parse(request.params);

      const transactions = await knex("transactions")
        .where({ id, session_id: sessionId })
        .first();

      return { transactions };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionId],
    },
    async (request) => {
      const { sessionId } = request.cookies;
      const summary = await knex("transactions")
        .sum("amount", { as: "amount" })
        .where({ session_id: sessionId })
        .first();

      return { summary };
    }
  );

  app.post("/", async (request, reply) => {
    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;
    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title: title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
