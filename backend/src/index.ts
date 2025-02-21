import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

type ItemManager = {
  id: number;
  name: string;
  point: 0 | 1 | 2 | 3 | 4 | 5;
};

const itemManager: ItemManager[] = [
  { id: 1, name: "AAA", point: 1},
  { id: 2, name: "BBB", point: 5},
  { id: 3, name: "CCC", point: 0},
];

app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 3600,
    credentials: true,
  })
);

app.get("/items", async (c) => {
  const query = c.req.query();
  const keyword = query.keyword;

  if (keyword) {
    return c.json(itemManager.filter((item) => item.name.includes(keyword)));
  }

  return c.json(itemManager);
});

app.post("/items", async (c) => {
  const body = await c.req.json();
  const name = body.name;

  if (name === "") {
    return c.json({ error: "名前は必須です" });
  }

  const newItem: ItemManager = {
    id: itemManager.length + 1,
    name: name,
    point: 0,
  };

  itemManager.push(newItem);
  return c.json(newItem);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const port = 8080;
console.log(`Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
