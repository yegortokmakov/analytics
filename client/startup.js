import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { SETTINGS } from "./constants";
import { initIronRouter } from "./iron-router";
import { trackLogins, getUserEmail } from "./meteor-analytics";
const analytics = require("analytics.js");

import "./flow-router.js";

Meteor.startup(() => {
  if (SETTINGS) {
    initIronRouter();
    // FlowRouter handles its own initialisation. Funky things happen if you attempt,
    // to initialise inside of Meteor.startup()
    // @todo should be removed as soon as pixel is added
    const fbp = require('@segment/analytics.js-integration-facebook-pixel');
    analytics.use(fbp);
    analytics.initialize(SETTINGS);
  } else {
    console.error("Missing analyticsSettings in Meteor.settings.public");
  }

  if (Package["accounts-base"]) {
    Tracker.autorun(() => {
      userEmail = getUserEmail();
    });
    Tracker.autorun(trackLogins);
  }
});

