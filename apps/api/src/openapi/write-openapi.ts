import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { openApiDocument } from "./document";

const outputPath = resolve(process.cwd(), "openapi.json");

const main = async () => {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(openApiDocument, null, 2)}\n`, "utf8");

  console.log(`OpenAPI document written to ${outputPath}`);
};

void main();
