import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

type ItemManager = {
  id: number;
  name: string;
  point: 0 | 1 | 2 | 3 | 4 | 5;
};

// item manager (dummy data)
const itemManager: ItemManager[] = [
  { id: 1, name: "AAA", point: 1},
  { id: 2, name: "BBB", point: 5},
  { id: 3, name: "CCC", point: 0},
];

// CORS settings for local development
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

// get items (search)
app.get("/items", async (c) => {
  // get keyword from query
  const query = c.req.query();
  // get keyword from query
  const keyword = query.keyword;

  // if keyword is not empty
  if (keyword) {
    return c.json(itemManager.filter((item) => item.name.includes(keyword)));
  }

  // return all items
  return c.json(itemManager);
});

// add item
app.post("/items", async (c) => {
  // get name from request body
  const body = await c.req.json();
  // get name from request body
  const name = body.name;

  // if name is empty
  if (name === "") {
    return c.json({ error: "名前は必須です" });
  }

  // create new item
  const newItem: ItemManager = {
    id: itemManager.length + 1,
    name: name,
    point: 0,
  };

  // add new item to itemManager
  itemManager.push(newItem);

  // return new item
  return c.json(newItem);
});

// update item
app.put("/items/:id", async (c) => {
  // get item id from URL
  const id = Number(c.req.param("id"));
  // get point from request body
  const body = await c.req.json();
  // get point from request body
  const point = body.point as 0 | 1 | 2 | 3 | 4 | 5;

  // find item index by id
  const targetIndex = itemManager.findIndex((item) => item.id === id);

  // if item is not found
  if (targetIndex === -1) {
    return c.json({ error: "アイテムが見つかりません" }, 404);
  }

  // update
  itemManager[targetIndex] = {
    ...itemManager[targetIndex],
    point: point,
  };

  // return updated item
  return c.json(itemManager[targetIndex]);
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
