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

  if (loggedInUser.enabled === false) {
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
  const loggedInUser = request.user;

  if (loggedInUser.enabled === false) {
    return response.status(401).json({ 'error': 'You are not enabled' });
  }
  const body = request.body;
  const id = request.params.id;

  //Not allowed to change the product id, postId, dateCreated, dateModified, masterSku, or user.
  if (body.id || body.postId || body.dateCreated || body.dateModified || body.masterSku || body.user) {
    return response.status(400).json({ 'error': 'malformed request' });
  }

  const productToChange = (await productSheetService.findProducts(id, 'id'))[0];
  if (productToChange === null) {
    return response.status(404).json({ error: 'Product not found' });
  }

  const changedProduct = Object.assign(productToChange, request.body);
  changedProduct.dateModified = new Date().toISOString();

  const updatedProduct = await productSheetService.updateProduct(changedProduct);
  response.json(updatedProduct);
});


// Delete a product
productsRouter.delete('/:id', async (request, response) => {
  const loggedInUser = request.user;
  const id = request.params.id;

  const product = (await productSheetService.findProducts(id, 'id'))[0];

  if (product.user === loggedInUser.id) {
    await productSheetService.deleteProduct(product);

    loggedInUser.products = loggedInUser.products.filter(id => id !== product.id);
    await userSheetService.updateUser(loggedInUser);

    response.status(204).end();
  } else {
    return response.status(400).json({ error: 'user doesn\'t match the creator of the product.' });
  }
});

module.exports = productsRouter;