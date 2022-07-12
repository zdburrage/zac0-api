const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const authConfig = require('./auth_config.json');
const axios = require('axios');

const app = express();


if (
  !authConfig.domain ||
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
  scope: 'read:organizations'
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

app.get('/api/external', checkJwt, (req, res) => {
  res.send({
    msg: 'Your access token was successfully validated!',
  });
});

app.get('/api/organizations', (req, res) => {
  
  auth0.organizations.getAll()
  .then(response => {
    res.send(response);
  })
  .catch(err => {
    res.status(400).send(err);
  });

})

app.get('/api/organization/:id', checkJwt, (req, res) => {
  
  auth0.organizations.getByID({id: req.params['id']})
  .then(response => {
    res.send(response);
  })
  .catch(err => {
    res.status(400).send(err);
  });

})

app.get('/api/games/:year', (req, res) => {
  axios
  .get(`https://api.collegefootballdata.com/games?year=${req.params['year']}&conference=sec`, {
    headers: {'Authorization': 'Bearer +RZzoA0scARG6oXSPr1GfgVJOvWhjMJLW5AdhAKdu/HI7Y2vU2zzDV0sMrn6bCKU'}
  })
  .then(resp => {
    console.log(`statusCode: ${resp.status}`);
    console.log(resp);
    res.send(resp.data);
  })
  .catch(error => {
    console.error(error);
    res.send(error);
  });
})

const port = process.env.API_SERVER_PORT || 3001;

app.listen(port, () => console.log(`Api started on port ${port}`));
