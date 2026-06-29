import server from "../dist/server/server.js";

export const config = {
  runtime: "nodejs18.x",
};

export default async function handler(req: any, res: any) {
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers.host || "localhost";
  const url = req.url?.startsWith("http") ? req.url : `${protocol}://${host}${req.url}`;

  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body: ["GET", "HEAD"].includes(req.method) ? undefined : req,
  });

  const response = await server.fetch(request, undefined, undefined);

  res.statusCode = response.status;
  response.headers.forEach((value, name) => {
    if (name.toLowerCase() === "set-cookie") {
      res.setHeader(name, value);
    } else {
      res.setHeader(name, value);
    }
  });

  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}
