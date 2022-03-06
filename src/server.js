const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('express-jwt');
const jwtScope = require('express-jwt-scope');
const jwksRsa = require('jwks-rsa');
const authConfig = require('./auth_config.json');
const axios = require("axios");
const bodyParser = require('body-parser');

const app = express();
app.use(express.static("public"));


if (!authConfig.domain ||
  !authConfig.audience ||
  authConfig.audience === "YOUR_API_IDENTIFIER"
) {
  console.log(
    "Exiting: Please make sure that auth_config.json is in place and populated with valid domain and audience values"
  );

  process.exit();
}

app.use(morgan('dev'));
app.use(helmet());
app.use(
  cors({
    origin: authConfig.appUri,
  })
);




var ManagementClient = require('auth0').ManagementClient;
var auth0 = new ManagementClient({
  domain: authConfig.domain,
  clientId: authConfig.clientId,
  clientSecret: authConfig.clientSecret,
  scope: authConfig.scopes,
});





const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${authConfig.domain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.domain}/`,
  algorithms: ['RS256'],
});

app.use(express.json());
app.post('/api/order', checkJwt, jwtScope('write:orders'), (req, res) => {
  let objWithId = {
    id: req.body.user_id
  }
  let orders = {
    orders: req.body.orders
  }

  auth0.updateUserMetadata(objWithId, orders)
    .then(response => {
      res.send(response);
    })
    .catch(err => {
      res.status(400).send(err);
    });
});


app.get('/api/pizza', checkJwt, (req, res) => {
  res.send({
    pizzas: [{
        type: 'Cheese',
        price: 5
      },
      {
        type: 'Pepperoni',
        price: 5
      },
      {
        type: 'Sausage',
        price: 6
      },
      {
        type: 'Supreme',
        price: 6
      }
    ]
  });
});


app.use(express.json());
app.post('/api/verification-email', checkJwt, (req, res) => {

  let objWithId = {
    user_id: req.body.user_id
  }

  auth0.sendEmailVerification(objWithId)
    .then(response => {
      res.send(response);
    })
    .catch(err => {
      res.status(400).send(err);
    });

});

app.use(express.json());
app.post('/api/change-password', checkJwt, (req, res) => {

  let objWithId = {
    user_id: req.body.user_id,
    result_url: req.body.result_url
  }

  auth0.createPasswordChangeTicket(objWithId)
    .then(response => {
      res.send(response);
    })
    .catch(err => {
      res.status(400).send(err);
    });

});

app.use(express.json());
app.post('/api/delete-account', checkJwt, (req, res) => {

  let objWithId = {
    id: req.body.user_id
  }


  auth0.deleteUser(objWithId)
    .then(response => {
      res.send(response);
    })
    .catch(err => {
      console.log(err);
      res.status(400).send(err);
    });

});


const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`Api started on port ${port}`));