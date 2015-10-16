Package.describe({
  summary: "Stripe OAuth flow",
  version: "1.0.0",
  name: "macmartine:stripe"
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@0.9.3', 'METEOR@0.9.4', 'METEOR@1.0']);
  api.use('oauth2', ['client', 'server']);
  api.use('oauth', ['client', 'server']);
  api.use('http', ['server']);
  api.use(['underscore', 'service-configuration'], ['client', 'server']);
  api.use(['random', 'templating'], 'client');

  api.export('Stripe');

  api.addFiles(
    ['stripe_configure.html', 'stripe_configure.js'],
    'client');

  api.addFiles('stripe_server.js', 'server');
  api.addFiles('stripe_client.js', 'client');
});
