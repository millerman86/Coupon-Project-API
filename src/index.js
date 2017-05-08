import {Server} from 'hapi';
import Coupons from './plugins/coupons.js';
import Login from './plugins/login.js';
import createUser from './plugins/createuser.js';
import Clipped from './plugins/clipped.js';

const server = new Server({});
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 5000;

server.connection({
  port: 4000,
  router: {
    isCaseSensitive: false
  },
  routes: {
    cors: true
  }
});


server.register([
  require('hapi-bodyparser'),
  require('inert'),
  require('vision'),
  require('blipp'),
  require('tv'),
  require('hapi-async-handler'),
  {
    register: require('hapi-swagger'),
    options: {
      cors: true,
      jsonEditor: true,
      documentationPath: '/',
      info: {
        title: 'Example',
        version: '1.0.0',
        description: 'An example api',
      }
    }
  },


  {
    register: require('good'),
    options: {
      ops: {
        interval: 5000
      },
      reporters: {
        console: [
          {
            module: 'good-console',
            args: [{
              log: '*',
              response: '*', request: '*', error: '*'
            }]
          }, 'stdout']
      }
    }
  },

  Coupons,
  Login,
  createUser,
  Clipped,

], err => {
  if (err) throw err;

  if (env !== 'testing') {
    server.start(err => {
      if (err) throw err;
      server.log('info', 'Server running at: ' + server.info.uri);
    });
  }

});


export default server;
