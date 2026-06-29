import server from "../dist/server/server.js";

export const config = {
  runtime: "edge",
};

export default async function handler(request: Request) {
  return await server.fetch(request, undefined, undefined);
}
