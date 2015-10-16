Template.configureLoginServiceDialogForStripe.helpers({
  siteUrl: function () {
    return Meteor.absoluteUrl();
  }
});

Template.configureLoginServiceDialogForStripe.fields = function () {
  return [
    {property: 'clientId', label: 'Client Id'},
    {property: 'secretKey', label: 'Secret Key'},
  ];
};
