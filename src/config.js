module.exports = (function () {
  return {
    dev: {
      host: 'localhost',
      port: '3306',
      user: 'dwsmile',
      password: 'dwlee1975!',
      database: 'sotdb',
      connectionLimit: 5
    },
    real: { // real server db info
      host: '',
      port: '3306',
      user: 'dwsmile',
      password: 'dwlee1975!',
      database: 'sotdb',
      connectionLimit: 5
    }
  }
})();
