const Browser = require("zombie");
var faker = require("faker");
Browser.localhost("example.com", 5000);

describe("User", function() {
  const browser = new Browser();

  before(function(done) {
    browser.visit("/reset", done);
  });

  describe("is redirected to home page after login", function() {
    before(function(done) {
      browser.visit("/", done);
    });

    before(function(done) {
      browser.fill("input[name=email]", "admin@admin.com");
      browser.fill("input[name=password]", "password");
      browser.pressButton("Submit", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should see home page", function() {
      browser.assert.url({ pathname: "/user/home" });
    });
  });

  describe("can create a new award", function() {
    before(function(done) {
      browser.visit("/user/home", done);
    });

    before(function(done) {
      browser.select("select[name=type_id]", "Week");
      browser.fill("input[name=name]", faker.name.findName());
      browser.fill("input[name=email]", faker.internet.email());
      browser.fill("input[name=time]", "13:45");
      browser.fill("input[name=date]", "5/01/2018");
      browser.pressButton("Submit", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the awards page", function() {
      browser.assert.url({ pathname: "/user/awards" });
    });

    it("assert text", function() {
      browser.assert.text("tr:last-child td:nth-child(7)", "5/1/2018");
    });
  });
});
