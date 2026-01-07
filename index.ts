import { API } from "@haelp/teto/utils";
import fs from "node:fs/promises";

const api = new API({ token: process.env.TOKEN! });

let uid = await api.users.me().then((u) => u._id);

let cachedResult: Awaited<ReturnType<typeof api.users.get>> | null = null;
let r: () => void;
let ready = new Promise<void>((res) => {
  r = res;
});
setInterval(async () => {
  cachedResult = await api.users.get({ id: uid });
  r();
}, 5000);

// read all files in dist/assets and serve them at /assets/<filename>
const files = await fs.readdir("./dist/assets");
const assets: Record<string, Uint8Array> = {};
for (const file of files) {
  const data = await fs.readFile(`./dist/assets/${file}`);
  assets[`/assets/${file}`] = data;
}

Bun.serve({
  port: 3000,
  async fetch(request) {
    try {
      if (new URL(request.url).pathname === "/counter") {
        await ready;
        const { xp } = cachedResult!;
        const level =
          Math.pow(xp / 500, 0.6) + xp / (5000 + Math.max(0, xp - 4000000) / 5000) + 1;

        return new Response(
          JSON.stringify({ friends: cachedResult!.friendCount, level }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }

      if (new URL(request.url).pathname in assets) {
        return new Response(Buffer.from(assets[new URL(request.url).pathname]), {
          headers: {
            "Content-Type": `text/${new URL(request.url).pathname
              .split(".")
              .pop()
              ?.replace("js", "javascript")}`,
            "Access-Control-Allow-Origin": "*",
          },
        });
      } else if (new URL(request.url).pathname === "/") {
        return new Response(Buffer.from(await fs.readFile("./dist/index.html")), {
          headers: {
            "Content-Type": "text/html",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return new Response("404 Not Found", {
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    } catch (error) {
      return new Response("500 Internal Server Error", {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    }
  },
  websocket: undefined as any,
});

console.log("Server running on http://localhost:3000");
