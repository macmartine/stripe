 Stripe = {};

// Request  Stripe credentials for the user
// @param options {optional}
// @param credentialRequestCompleteCallback {Function} Callback function to call on
//   completion. Takes one argument, credentialToken on success, or Error on
//   error.
 Stripe.requestCredential = function (options, credentialRequestCompleteCallback) {
  // support both (options, callback) and (callback).
  if (!credentialRequestCompleteCallback && typeof options === 'function') {
    credentialRequestCompleteCallback = options;
    options = {};
  } else if (!options) {
    options = {};
  }

  var config = ServiceConfiguration.configurations.findOne({service: 'stripe'});
  if (!config) {
    credentialRequestCompleteCallback && credentialRequestCompleteCallback(
      new ServiceConfiguration.ConfigError());
    return;
  }

  var credentialToken = Random.secret();

  // always need this to get user id from stripe.
  var scope = 'read_only';
  //if (options.requestPermissions)
    //scope = options.requestPermissions;
  //var flatScope = _.map(scope, encodeURIComponent).join('+');

  // https://developers.stripe.com/accounts/docs/OAuth2WebServer#formingtheurl
  var accessType = options.requestOfflineToken ? 'offline' : 'online';

  var loginStyle = OAuth._loginStyle('stripe', config, options);

  console.log( config );

  var loginUrl =
        'https://connect.stripe.com/oauth/authorize' +
        '?response_type=code' +
        '&client_id=' + config.clientId +
        '&scope=' + scope +
        '&redirect_uri=' + OAuth._redirectUri('stripe', config) +
        '&state=' + OAuth._stateParam(loginStyle, credentialToken);

  if (typeof options.prompt === 'string') {
    loginUrl += '&prompt=' + options.prompt;
  } else if (options.forceApprovalPrompt) {
    loginUrl += '&prompt=consent';
  }

  // Use  Stripe's domain-specific login page if we want to restrict creation to
  // a particular email domain. (Don't use it if restrictCreationByEmailDomain
  // is a function.) Note that all this does is change  Stripe's UI ---
  // accounts-base/accounts_server.js still checks server-side that the server
  // has the proper email address after the OAuth conversation.
  if (typeof Accounts._options.restrictCreationByEmailDomain === 'string') {
    loginUrl += '&hd=' + encodeURIComponent(Accounts._options.restrictCreationByEmailDomain);
  }

  OAuth.launchLogin({
    loginService: "stripe",
    loginStyle: loginStyle,
    loginUrl: loginUrl,
    credentialRequestCompleteCallback: credentialRequestCompleteCallback,
    credentialToken: credentialToken,
    popupOptions: { height: 600 }
  });
};
