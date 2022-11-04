const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('express-jwt');
const jwtScope = require('express-jwt-scope');
const jwksRsa = require('jwks-rsa');
const authConfig = require('../src/auth_config.json');
const axios = require('axios').default;
const qs = require('qs');
const jwtDecode = require('jwt-decode').default;

const app = express();
app.use(express.static("public"));

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
    jwksUri: `https://${authConfig.customDomain}/.well-known/jwks.json`,
  }),

  audience: authConfig.audience,
  issuer: `https://${authConfig.customDomain}/`,
  algorithms: ['RS256'],
});


app.get('/api/external', (req, res) => {

  const data = { 'client_id': '4b76e799-9039-4488-a660-a4be9d5f75b3',
                 'scope': 'user.read openid profile offline_access',
                 'username': 'zac@zacburragegmail.onmicrosoft.com',
                 'password': '',
                 'grant_type': 'password'
                 };
  const options = {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(data),
    url: 'https://login.microsoftonline.com/634d0af2-d73a-4242-9485-2ae2601952a1/oauth2/v2.0/token',
  };

  axios(options).then(
    response => {
      console.log(response);
      const claims = jwtDecode(response.data.id_token);
      res.send(claims);
    }
  );


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


app.post('/api/campaigns/password', checkJwt, jwtScope('create:campaigns'), (req, res) => {
  
  auth0.createPasswordChangeTicket()
  .then(response => {
    res.send(response);
  })
  .catch(err => {
    res.status(400).send(err);
  });

})

app.post('/api/connections/create', checkJwt, (req, res) => {

  console.log(req.body['data']);
  
  auth0.createConnection(req.body['data'])
  .then(response => {
    res.send(response);
  })
  .catch(err => {
    res.status(400).send(err);
  });

})

app.use(express.json());

app.post('/api/users/:sub/sec-profile', checkJwt, (req, res) => {

  var objWithId = {
    id: req.params['sub']
  };

  console.log(req.body);

  var updatedMetadata = {
    sec_credentials: req.body['sec_credentials']
  }
  
  auth0.updateUserMetadata(objWithId, updatedMetadata)
  .then(response => {
    res.send(response);
  })
  .catch(err => {
    res.status(400).send(err);
  });

})

const port = process.env.PORT || 3001;

app.listen(port, () => console.log(`Api started on port ${port}`));
