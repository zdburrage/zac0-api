import * as express from 'express';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';
const bearerToken = require('express-bearer-token');
import { NextFunction, Request, Response, Router } from 'express';
import { getPizzaRepository, Pizza } from './models/model';

const app = express()
  .use(cors())
  .use(bodyParser.json())
  .use(bearerToken());

app.listen(4201, () => {
  return console.log('My Node App listening on port 4201');
});


app.get('/pizza', async function (req, res, next: NextFunction) {
  try {
    const repository = await getPizzaRepository();
    const allPizzas = await repository.find();
    res.send(allPizzas);
  }
  catch (err) {
    return next(err);
  }
});

app.get('/pizza/:id', async function (req, res, next: NextFunction) {
  try {
    const repository = await getPizzaRepository();
    const product = await repository.findOne(req.params.id);
    res.send(product);
  }
  catch (err) {
    return next(err);
  }
});

app.post('/pizza', async function (req, res, next: NextFunction) {
  try {
    const repository = await getPizzaRepository();
    const product = new Pizza();
    product.type = req.body.type;
    product.description = req.body.description;
    product.price = Number.parseFloat(req.body.price);

    const result = await repository.save(product);
    res.send(result);
  }
  catch (err) {
    return next(err);
  }
});

app.post('/pizza/:id', async function (req, res, next: NextFunction) {
  try {
    const repository = await getPizzaRepository();
    const pizza = await repository.findOne(req.params.id);
    pizza.type = req.body.type;
    pizza.description = req.body.description;
    pizza.price = Number.parseFloat(req.body.price);

    const result = await repository.save(pizza);
    res.send(result);
  }
  catch (err) {
    return next(err);
  }
});

app.delete('/pizza/:id', async function (req, res, next: NextFunction) {
  try {
    const repository = await getPizzaRepository();
    await repository.delete(req.params.id);
    res.send('OK');
  }
  catch (err) {
    return next(err);
  }
});
