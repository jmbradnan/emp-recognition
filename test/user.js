require("dotenv").config();

var assert = require("assert");
const Browser = require("zombie");
var faker = require("faker");
Browser.waitDuration = "50s";
Browser.localhost("example.com", 5000);
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
  //ssl: true
});

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
      browser.fill("input[name=name]", "Tester Name");
      browser.fill("input[name=email]", "test@email.com");
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
      browser.assert.text("tr:last-child td:nth-child(2)", "Week");
      browser.assert.text("tr:last-child td:nth-child(3)", "admin@admin.com");
      browser.assert.text("tr:last-child td:nth-child(4)", "Tester Name");
      browser.assert.text("tr:last-child td:nth-child(5)", "test@email.com");
      browser.assert.text("tr:last-child td:nth-child(6)", "1:45 PM");
      browser.assert.text("tr:last-child td:nth-child(7)", "5/1/2018");
    });
  });

  describe("can delete an award", function() {
    before(function(done) {
      browser.visit("/user/awards", done);
    });

    before(function(done) {
      browser.pressButton("tr:last-child button", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the awards page", function() {
      browser.assert.url({ pathname: "/user/awards" });
    });

    it("award should be deleted", function() {
      assert.notEqual(
        browser.text("tr:last-child td:nth-child(5)"),
        "test@email.com"
      );
    });
  });

  describe("can change name", function() {
    before(function(done) {
      browser.visit("/user/name", done);
    });

    before(function(done) {
      browser.fill("input[name=fname]", "new_first_name");
      browser.fill("input[name=lname]", "new_last_name");
      browser.pressButton("Change Name", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the name page", function() {
      browser.assert.url({ pathname: "/user/name" });
    });

    it("name should be updated", function() {
      browser.assert.input("input[name=fname]", "new_first_name");
      browser.assert.input("input[name=lname]", "new_last_name");
    });
  });

  describe("can logout", function() {
    before(function(done) {
      browser.visit("/user/awards", done);
    });

    before(function(done) {
      browser.clickLink("Logout", done);
    });

    before(function(done) {
      browser.visit("/user/awards", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the login page", function() {
      browser.assert.url({ pathname: "/user/login" });
    });
  });

  describe("can reset password and login", function() {
    before(function(done) {
      browser.visit("/password", done);
    });

    before(function(done) {
      browser.fill("input[name=email]", "admin@admin.com");
      browser.pressButton("Send Reset Password Email", done);
    });

    before(function(done) {
      pool.query("SELECT * FROM users;", (err, res) => {
        var reset_token = res.rows[0].reset_token;
        browser.visit(
          `/password/update?email=admin@admin.com&reset_token=${reset_token}`,
          done
        );
        pool.end();
      });
    });

    before(function(done) {
      browser.fill("input[name=password]", "newpass");
      browser.pressButton("Update Password", done);
    });

    before(function(done) {
      browser.fill("input[name=email]", "admin@admin.com");
      browser.fill("input[name=password]", "newpass");
      browser.pressButton("Submit", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the home page", function() {
      browser.assert.url({ pathname: "/user/home" });
    });
  });
});
