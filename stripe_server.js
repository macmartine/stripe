Stripe = {};

// https://developers.stripe.com/accounts/docs/OAuth2Login#userinfocall
Stripe.whitelistedFields = ['id', 'email', 'display_name', 'business_name',
                   'default_currency', 'country', 'business_url', 'timezone'];

OAuth.registerService('stripe', 2, null, function(query) {

  var response = getTokens(query);
  var accessToken = response.accessToken;

  var identity = getIdentity(response.stripePublishableKey);

  var serviceData = {
    accessToken: accessToken
  };

  var fields = _.pick(identity, Stripe.whitelistedFields);
  _.extend(serviceData, fields);

  // only set the token in serviceData if it's there. this ensures
  // that we don't lose old ones (since we only get this on the first
  // log in attempt)
  if (response.refreshToken)
    serviceData.refreshToken = response.refreshToken;

  return {
    serviceData: serviceData,
    options: {profile: {name: identity.name}}
  };
});

// returns an object containing:
// - accessToken
// - expiresIn: lifetime of token in seconds
// - refreshToken, if this is the first authorization request
var getTokens = function (query) {
  var config = ServiceConfiguration.configurations.findOne({service: 'stripe'});
  if (!config)
    throw new ServiceConfiguration.ConfigError();

  var response;
  try {
    console.log( config );
    response = HTTP.post(
      "https://connect.stripe.com/oauth/token", {params: {
        code: query.code,
        client_id: config.clientId,
        client_secret: config.secretKey,
        grant_type: 'authorization_code'
      }});
  } catch (err) {
    throw _.extend(new Error("Failed to complete OAuth handshake with Stripe. " + err.message),
                   {response: err.response});
  }

  if (response.data.error) { // if the http response was a json object with an error attribute
    throw new Error("Failed to complete OAuth handshake with Stripe. " + response.data.error);
  } else {
    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      stripePublishableKey: response.data.stripe_publishable_key
    };
  }
};

var getIdentity = function (stripe_user_id) {
  try {
    return HTTP.get(
      "https://api.stripe.com/v1/account",
      {
        id: stripe_user_id,
        headers: {
          'Authorization': 'Bearer ' + Meteor.settings.private.stripe.testSecretKey
        }
      }
      ).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Stripe. " + err.message),
                   {response: err.response});
  }
};


Stripe.retrieveCredential = function(credentialToken, credentialSecret) {
  return OAuth.retrieveCredential(credentialToken, credentialSecret);
};
