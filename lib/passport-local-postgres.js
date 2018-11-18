//adapted from passport-local-postgres module
function postgresLocal(pool) {
  let self = this;
  self.pool = pool;
  this.localStrategy = function(email, password, cb) {
    self.pool.connect((err, client, release) => {
      client.query(
        "SELECT id, email, password FROM users WHERE email=$1",
        [email],
        (err, result) => {
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
      client.query(
        "SELECT id, email, administrator FROM users WHERE id = $1",
        [parseInt(id, 10)],
        (err, results) => {
          client.release();
          cb(null, results.rows[0]);
        }
      );
    });
  };
  return this;
}

module.exports = postgresLocal;
