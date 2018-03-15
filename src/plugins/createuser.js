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

        let {username, password} = request.payload;


        const customers = await collection('customers');

        // TRY TO FIND THE USER SPECIFIED IN REQUEST.PAYLOAD
        const foundCustomer = await customers.findOne({username});

        if (foundCustomer) {
          return reply({message: 'User already exists, please choose another username'})
        } else if (!foundCustomer) {
          const hashpassword = await encryptPassword(password);

          // CREATE THE VERY SPECIFIC USER PROFILE DATA STRUCTURE RIGHT HERE THAT WILL BE INSERTED INTO THE DATABASE
          const user = {
            username,
            hashpassword,
            coupons: []
          };

          const result = await customers.insertOne({user});
          if (result.insertedCount === 1) {
            const token = jwt.sign(user, 'secret', {expiresIn: '1 day'});
            return reply({token: token, type: 'user', username: username});

          }
        }
        return reply({message: "This function shouldn't run"});
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





