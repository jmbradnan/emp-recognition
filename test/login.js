const Browser = require('zombie');
var faker = require('faker');
Browser.localhost("example.com", 5000);

describe('User visits signup page', function() {
  const browser = new Browser();

  before(function(done) {
    browser.visit('/reset', done);
  });

  before(function(done) {
    browser.visit('/', done);
  });

  describe('submits form', function() {

    before(function(done) {
      browser
        .fill('input[name=email]', "admin@admin.com")
      browser
        .fill('input[name=password]', "password")
      browser
        .pressButton('Submit', done);
    });

    it('should be successful', function() {
      browser.assert.success();
    });

    it('should see welcome page', function() {
      browser.assert.url({ pathname: '/user/home' });
    });
  });
});
