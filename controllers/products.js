const productsRouter = require('express').Router();
// const Product = require('../models/product');
const logger = require('../utils/logger');

const generateId = () => {
  let s = '', r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  for (let i = 0; i < 6; i++) {
    s += r.charAt(Math.floor(Math.random() * r.length));
  }

  return s;
};

// Get all the products
productsRouter.get('/', async (request, response) => {
  // const allProducts = await Product.find({});
  // response.json(allProducts);
  response.json({ message: 'get all products enpoint' });
});

// Create a new product
productsRouter.post('/', async (request, response) => {
  // const body = request.body;
  // const user = request.user;

  // let newId = generateId();
  // let existingId = await Product.findOne({ postId: newId });
  // while (existingId !== null) {
  //   newId = generateId();
  //   existingId = await Product.findOne({ postId: newId });
  // }

  // const product = new Product({
  //   postId: newId,
  //   client: body.client,
  //   reason: body.reason,
  //   condition: body.condition,
  //   conditionNote: body.conditionNote,
  //   asin: body.asin,
  //   expiration: body.expiration,
  //   quantity: body.quantity,
  //   location: body.location,
  //   dateCreated: new Date(),
  //   user: user._id,
  // });

  // const savedProduct = await product.save();
  // user.products = user.products.concat(savedProduct._id);
  // await user.save();
  // response.status(201).json(savedProduct);
  response.json({ message: 'create product enpoint' });
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