if (Meteor.isClient) {
  Router.route('/', function () {
    this.layout('mainLayout');
    this.render('one');
  }, {
    name: 'home'
  });

  Router.route('/one', function () {
    this.layout('mainLayout');
    this.render('one');
  }, {
    name: 'one'
  });

  Router.route('/two', function () {
    this.layout('mainLayout');
    this.render('two');
  }, {
    name: 'two'
  });

  Router.route('/three', function () {
    this.layout('mainLayout');
    this.render('three');
  }, {
    name: 'three'
  });

  Template.mainLayout.onCreated(function () {
    Meteor.subscribe('oauthInfo');
    var self = this;
    self.log = new ReactiveVar([]);
    self.currentIdentity = new ReactiveVar("No Identity Set");

    // We don't want to register analytics if it has been blocked by an adblocker.
    if (typeof analytics === "undefined") return;

    self.currentIdentity.set(analytics._user._getTraits().email || "No Identity Set");

    analytics.on('page', function(event, properties, options) {
      var latest = self.log.get();
      latest.push("Page: " + options.path);
      self.log.set(latest);
    });

    analytics.on('identify', function(event, properties, options) {
      var latest = self.log.get();
      latest.push("Identify: " + properties.email);
      self.log.set(latest);
      self.currentIdentity.set(properties.email);
    });

    analytics.on('track', function(event, properties, options) {
      var latest = self.log.get();
      latest.push("Track: " + event);
      self.log.set(latest);
    });
  });

  Template.mainLayout.helpers({
    log:     function() { return Template.instance().log.get(); },
    currentIdentity: function() { return Template.instance().currentIdentity.get(); },
    isOauth: function() {
      var user = Meteor.user();
      var message = "";
      if (user && user.services) {
        if (user.services.facebook) {
          message = "Signed in with Facebook as " + user.services.facebook.name + " (" + user.services.facebook.email + ")";
        } else if (user.services.github) {
          message = "Signed in with Github as " + user.services.github.username + " (" + user.services.github.email + ")";
        } else if (user.services.google) {
          message = "Signed in with Google as " + user.services.google.name + " (" + user.services.google.email + ")";
        } else {
          message = "Not an oauth login";
        }
        return message;
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish('oauthInfo', function() {
    return Meteor.users.find(
          {_id: this.userId},
          {fields: {
            'services.facebook.name': 1,
            'services.facebook.email': 1,
            'services.github.username': 1,
            'services.github.email': 1,
            'services.google.name': 1,
            'services.google.email': 1
          }});
  });
}
