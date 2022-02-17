"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const bearerToken = require('express-bearer-token');
const model_1 = require("./models/model");
const app = express()
    .use(cors())
    .use(bodyParser.json())
    .use(bearerToken());
app.listen(4201, () => {
    return console.log('My Node App listening on port 4201');
});
app.get('/pizza', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield (0, model_1.getPizzaRepository)();
            const allPizzas = yield repository.find();
            res.send(allPizzas);
        }
        catch (err) {
            return next(err);
        }
    });
});
app.get('/pizza/:id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield (0, model_1.getPizzaRepository)();
            const product = yield repository.findOne(req.params.id);
            res.send(product);
        }
        catch (err) {
            return next(err);
        }
    });
});
app.post('/pizza', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield (0, model_1.getPizzaRepository)();
            const product = new model_1.Pizza();
            product.type = req.body.type;
            product.description = req.body.description;
            product.price = Number.parseFloat(req.body.price);
            const result = yield repository.save(product);
            res.send(result);
        }
        catch (err) {
            return next(err);
        }
    });
});
app.post('/pizza/:id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield (0, model_1.getPizzaRepository)();
            const pizza = yield repository.findOne(req.params.id);
            pizza.type = req.body.type;
            pizza.description = req.body.description;
            pizza.price = Number.parseFloat(req.body.price);
            const result = yield repository.save(pizza);
            res.send(result);
        }
        catch (err) {
            return next(err);
        }
    });
});
app.delete('/pizza/:id', function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const repository = yield (0, model_1.getPizzaRepository)();
            yield repository.delete(req.params.id);
            res.send('OK');
        }
        catch (err) {
            return next(err);
        }
    });
});
