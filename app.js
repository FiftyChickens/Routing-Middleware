const express = require("express");
const StoreError = require("./storeError");
let items = require("./fakeDb.js");

const app = express();
app.use(express.json());

function inventoryEmpty() {
  if (items.length === 0) throw new StoreError("Sorry Out of Stock", 400);
}
function notItem(req, res) {
  const itemName = req.params.name;
  const item = items.find((item) => item.name === itemName);

  if (!item) {
    throw new StoreError("Item not found, try /items/name", 404);
  }
  return item;
}

app.get("/", (req, res) => {
  res.send(
    "<h1>Express Store</h1> <h3>Commands for viewing:</h3> <p>/items views all items</p> <p>/items/nameOfItem views one item</p> <h3>Admin commands:</h3> <p><b>post</b> /item addes item with keys matching: name and value</p> <p><b>patch</b> item/nameOfItem updates values on key</p> <p><b>delete</b> /item/nameOfItem removes item from list</p>"
  );
});

// View all items
app.get("/items", (req, res, next) => {
  try {
    inventoryEmpty();
    return res.json(items);
  } catch (err) {
    return next(err);
  }
});

// View one item
app.get("/items/:name", (req, res, next) => {
  try {
    inventoryEmpty();
    const item = notItem(req);
    return res.send(item);
  } catch (err) {
    return next(err);
  }
});

// modify one item
app.patch("/items/:name", (req, res, next) => {
  try {
    inventoryEmpty();
    const item = notItem(req);

    if (Object.keys(req.body).length === 0) {
      throw new StoreError("No update keys missing", 400);
    }

    Object.keys(req.body).forEach((key) => {
      if (item.hasOwnProperty(key)) {
        item[key] = req.body[key];
      }
    });

    res.status(200).json({ message: "Item updated successfully", item });
  } catch (err) {
    return next(err);
  }
});

// Delete one item
app.delete("/items/:name", (req, res, next) => {
  try {
    inventoryEmpty();
    const item = notItem(req);
    items = items.filter((product) => product.name !== item.name);
    res.json({ message: "Item removed successfully", item });
  } catch (err) {
    return next(err);
  }
});

// Add one item
function validateKeys(req, res, next) {
  try {
    const requiredKeys = ["name", "price"];
    const bodyKeys = Object.keys(req.body);
    console.log(bodyKeys.length);

    if (bodyKeys.length !== 2) {
      throw new StoreError("Request body must have at least two keys.", 400);
    }

    const missingKeys = requiredKeys.filter((key) => !bodyKeys.includes(key));
    if (missingKeys.length > 0) {
      throw new StoreError(
        `Missing required keys: ${missingKeys.join(", ")}`,
        400
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}
app.post("/items", validateKeys, (req, res, next) => {
  items.push(req.body);
  res.status(200).json({ message: "Request is valid!", data: items });
});

// Error handling
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Something went wrong.";

  return res.status(status).json({
    error: { message, status },
  });
});

app.listen(3000, () => {
  console.log("Listening on localhost:3000");
});
