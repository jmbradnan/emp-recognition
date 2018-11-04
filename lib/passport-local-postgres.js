function postgresLocal(pool) {
  let self = this;
  self.pool = pool;
  this.localStrategy = function(email, password, cb) {
    self.pool.connect((err, client, release) => {
      if (err) {
        console.log("Error acquiring client", err.stack);
        return cb(err);
      }
      client.query(
        "SELECT id, email, password FROM users WHERE email=$1",
        [email],
        (err, result) => {
          if (err) {
            console.log("Error when selecting user on login", err);
            return cb(err);
          }

          if (result.rows.length > 0) {
            const first = result.rows[0];
            if (password == first.password) {
              cb(null, { id: first.id, email: first.email });
            } else {
              cb(null, false);
            }
          } else {
            cb(null, false);
          }
        }
      );
    });
  };

  this.serializeUser = function(user, done) {
    done(null, user.id);
  };

  this.deserializeUser = function(id, cb) {
    self.pool.connect((err, client, release) => {
      if (err) {
        console.log("Error acquiring client", err.stack);
        return cb(err);
      }
      client.query(
        "SELECT id, email FROM users WHERE id = $1",
        [parseInt(id, 10)],
        (err, results) => {
          client.release();
          if (err) {
            console.log(
              "Error when selecting user on session deserialize",
              err
            );
            return cb(err);
          }

          cb(null, results.rows[0]);
        }
      );
    });
  };

  return this;
}

module.exports = postgresLocal;
