require("dotenv").config();

var assert = require("assert");
const Browser = require("zombie");
var faker = require("faker");
Browser.waitDuration = "50s";
Browser.localhost("example.com", 5000);
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

describe("System", function() {
  const browser = new Browser();

  before(function(done) {
    browser.visit("/reset", done);
  });

  /*
   * User Testing
   */
  describe("User is redirected to home page after login", function() {
    before(function(done) {
      browser.visit("/", done);
    });

    before(function(done) {
      browser.fill("input[name=email]", "user@user.com");
      browser.fill("input[name=password]", "password");
      browser.pressButton("Submit", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should see home page", function() {
      browser.assert.url({ pathname: "/user/awards/index" });
    });

    it("should see flash", function() {
      browser.assert.text(".alert-info", "Logged In");
    });
  });

  describe("User can create a new award", function() {
    before(function(done) {
      browser.visit("/user/awards/new", done);
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
      browser.assert.url({ pathname: "/user/awards/index" });
    });

    it("assert text", function() {
      browser.assert.text("tr:last-child td:nth-child(2)", "Week");
      browser.assert.text("tr:last-child td:nth-child(3)", "user@user.com");
      browser.assert.text("tr:last-child td:nth-child(4)", "Tester Name");
      browser.assert.text("tr:last-child td:nth-child(5)", "test@email.com");
      browser.assert.text("tr:last-child td:nth-child(6)", "1:45 PM");
      browser.assert.text("tr:last-child td:nth-child(7)", "5/1/2018");
    });

    it("should see flash", function() {
      browser.assert.text(".alert-info", "Award Created");
    });
  });

  describe("User can delete an award", function() {
    before(function(done) {
      browser.visit("/user/awards/index", done);
    });

    before(function(done) {
      browser.pressButton("tr:last-child button", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the awards page", function() {
      browser.assert.url({ pathname: "/user/awards/index" });
    });

    it("award should be deleted", function() {
      assert.notEqual(
        browser.text("tr:last-child td:nth-child(5)"),
        "test@email.com"
      );
    });

    it("should see flash", function() {
      browser.assert.text(".alert-info", "Award Deleted");
    });
  });

  describe("User can change name", function() {
    before(function(done) {
      browser.visit("/user/name/edit", done);
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
      browser.assert.url({ pathname: "/user/name/edit" });
    });

    it("name should be updated", function() {
      browser.assert.input("input[name=fname]", "new_first_name");
      browser.assert.input("input[name=lname]", "new_last_name");
    });

    it("should see flash", function() {
      browser.assert.text(".alert-info", "Name Updated");
    });
  });

  describe("User can logout", function() {
    before(function(done) {
      browser.visit("/user/awards/index", done);
    });

    before(function(done) {
      browser.clickLink("Logout", done);
    });

    before(function(done) {
      browser.visit("/user/awards/index", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the login page", function() {
      browser.assert.url({ pathname: "/login" });
    });
  });

  describe("User can reset password and login", function() {
    before(function(done) {
      browser.visit("/password", done);
    });

    before(function(done) {
      browser.fill("input[name=email]", "user@user.com");
      browser.pressButton("Send Reset Password Email", done);
    });

    before(function(done) {
      pool.query(
        "SELECT * FROM users WHERE email=($1);",
        ["user@user.com"],
        (err, res) => {
          var reset_token = res.rows[0].reset_token;
          browser.visit(
            `/password/edit?email=user@user.com&reset_token=${reset_token}`,
            done
          );
          pool.end();
        }
      );
    });

    before(function(done) {
      browser.fill("input[name=password]", "newpass");
      browser.pressButton("Update Password", done);
    });

    before(function(done) {
      browser.fill("input[name=email]", "user@user.com");
      browser.fill("input[name=password]", "newpass");
      browser.pressButton("Submit", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the home page", function() {
      browser.assert.url({ pathname: "/user/awards/index" });
    });

    it("should see flash", function() {
      browser.assert.text(".alert-info", "Logged In");
    });
  });

  describe("User is redirected when visiting a Admin page", function() {
    before(function(done) {
      browser.visit("/administration", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the home page", function() {
      browser.assert.url({ pathname: "/user/awards/index" });
    });
  });

  describe("Users can only see awards they created", function() {
    before(function(done) {
      browser.visit("/logout", done);
    });

    before(function(done) {
      browser.fill("input[name=email]", "user2@user.com");
      browser.fill("input[name=password]", "password");
      browser.pressButton("Submit", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the home page", function() {
      browser.assert.url({ pathname: "/user/awards/index" });
    });

    it("other user's award should not appear", function() {
      assert.notEqual(
        browser.text("tr:first-child td:nth-child(3)"),
        "user@user.com"
      );
    });
  });

  /*
   * Admin Testing
   */
  describe("Admin is redirected to /administration", function() {
    before(function(done) {
      browser.visit("/logout", done);
    });

    before(function(done) {
      browser.fill("input[name=email]", "admin@admin.com");
      browser.fill("input[name=password]", "password");
      browser.pressButton("Submit", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the home page", function() {
      browser.assert.url({ pathname: "/administration" });
    });
  });

  describe("Admin is redirected when visiting a user page", function() {
    before(function(done) {
      browser.visit("/user/awards/index", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the home page", function() {
      browser.assert.url({ pathname: "/administration" });
    });
  });

  describe("Admin can logout", function() {
    before(function(done) {
      browser.clickLink("Logout", done);
    });

    before(function(done) {
      browser.visit("/administration", done);
    });

    it("should be successful", function() {
      browser.assert.success();
    });

    it("should be on the login page", function() {
      browser.assert.url({ pathname: "/login" });
    });
  });
});
