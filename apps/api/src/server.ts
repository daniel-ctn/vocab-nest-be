import { app } from "./app";
import { env } from "./config/env";

const server = app.listen(env.PORT, () => {
  console.log(`VocabNest API listening on http://localhost:${env.PORT}`);
});

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});
