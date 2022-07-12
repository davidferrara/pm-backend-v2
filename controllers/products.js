const productsRouter = require('express').Router();
const productSheetService = require('../utils/productSheetService');
const ObjectID = require('bson').ObjectID;
const { Product, validateProduct } = require('../models/Product');
const userSheetService = require('../utils/userSheetService');

const generatePostId = () => {
  let s = '', r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 6; i++) {
    s += r.charAt(Math.floor(Math.random() * r.length));
  }

  return s;
};


// Get all the products per user
productsRouter.get('/', async (request, response) => {
  const loggedInUser = request.user;

  const products = await productSheetService.findProducts(loggedInUser.id, 'user');

  response.json(products);
});


// Create a new product
productsRouter.post('/', async (request, response) => {
  const loggedInUser = request.user;

  if(loggedInUser.enabled === false) {
    return response.status(401).json({ 'error': 'You are not enabled' });
  }

  const { client,
    reason,
    condition,
    conditionNotes,
    asin,
    expirationDate,
    quantity,
    location } = request.body;

  const id = new ObjectID();
  let postId = generatePostId();
  let existingId = await productSheetService.findProducts(postId, 'postId');
  while (existingId !== undefined) {
    postId = generatePostId();
    existingId = await productSheetService.findProducts(postId, 'postId');
  }

  const newProduct = Object.seal(new Product(
    id.toString(),
    postId,
    client,
    reason,
    condition,
    conditionNotes,
    asin,
    expirationDate,
    quantity,
    location,
    id.getTimestamp().toISOString(),  // Date Created
    id.getTimestamp().toISOString(),  // Date Modified
    '',
    loggedInUser.id
  ));

  validateProduct(newProduct);

  const savedProduct = await productSheetService.saveProduct(newProduct);

  const userProducts = loggedInUser.products;
  userProducts.push(savedProduct.id);
  loggedInUser.products = userProducts;

  await userSheetService.updateUser(loggedInUser);

  response.status(201).json(savedProduct);
});

// Update a product
productsRouter.put('/:id', async (request, response) => {
  // const body = request.body;
  // const id = request.params.id;

  // const productToChange = await Product.findById(id);
  // if (productToChange === null) {
  //   return response.status(404).json({ error: 'Product not found' });
  // }

  // const changedProduct = {
  //   ...productToChange._doc,
  //   client: body.client,
  //   reason: body.reason,
  //   condition: body.condition,
  //   conditionNote: body.conditionNote,
  //   asin: body.asin,
  //   expiration: body.expiration,
  //   quantity: body.quantity,
  //   location: body.location,
  //   dateModified: new Date(),

  // };

  // const updatedProduct = await Product.findByIdAndUpdate(id, changedProduct, { new: true });
  // response.json(updatedProduct);
  response.json({ message: 'edit products enpoint' });
});

// Delete a product
productsRouter.delete('/:id', async (request, response) => {
  // const user = request.user;

  // const product = await Product.findById(request.params.id);

  // if (product.user.toString() === user.id.toString()) {
  //   await Product.deleteOne({ _id: product._id });

  //   // user.blogs is an array of ObjectId('')'s
  //   user.products = user.products.filter(id => id.toString() !== product._id.toString());
  //   await user.save();

  //   response.status(204).end();
  // } else {
  //   return response.status(400).json({ error: 'user doesn\'t match the creator of the product.' });
  // }
  response.json({ message: 'delete products enpoint' });
});

module.exports = productsRouter;