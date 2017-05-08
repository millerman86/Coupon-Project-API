/**
 * Created by amrenmiller on 4/7/17.
 */

import {collection} from '../db.js';
import jwt from 'jsonwebtoken';
import Bcrypt from 'bcryptjs';

const encryptPassword = async(password) => {

  return await new Promise((resolve, reject) => {
    return Bcrypt.hash(password, 10, (err, hash) => {
      if (err) {
        return reject(err);
      }
      return resolve(hash);
    })

  })
};

const plugin = (server, options, next) => {

  server.route({
    method: 'POST',
    path: '/v1/createuser',
    config: {
      plugins: {
        body: {merg: false, sanitizer: {stripNullorEmpty: false}}
      },
      tags: ['api', 'v1'],
      cors: {
        origin: ['*'],
        additionalHeaders: ['cache-control', 'x-requested-with']
      },
    },
    handler: {
      async: async(request, reply) => {
        console.log(request.payload);
        let {username, password, usertype} = request.payload;

        if (username && password && usertype === 'user') {
          const customers = await collection('customers');

          const foundCustomer = await customers.findOne({username});

          if (foundCustomer) {
            return reply.redirect();
          } else if (!foundCustomer) {
            const hashpassword = await encryptPassword(password);

            const user = {username, hashpassword, coupons: []};

            const result = await customers.insertOne({username, hashpassword, coupons: []});
            if (result.insertedCount === 1) {
              const token = jwt.sign(user, 'secret', {expiresIn: '1 day'});
              return reply({token: token, type: 'user'});

            }
          }
        } else if (username && password && usertype === 'company') {

          const companies = await collection('company');

          const foundCompany = companies.findOne({username});

          if (foundCompany) {
            return reply.redirect();
          }

          if (!foundCompany) {
            const hashpassword = await encryptPassword(password);
            const user = {username, hashpassword, coupons: []};
            const result = await companies.insertOne({username, hashpassword, coupons: []});

            if (result.insertedCount === 1) {
              const token = jwt.sign(user, 'secret', {expiresIn: '1 day'});
              return reply({token: token, type: 'company'});
            }

          }

        }

        return reply();
      }
    }
  });

  return next();
};


plugin.attributes = {
  name: 'createuser',
  version: '1.0.0'
};

export default plugin;
