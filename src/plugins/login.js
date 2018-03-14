import {collection} from '../db.js';
import jwt from 'jsonwebtoken';
// import Joi from 'joi';
import Bcrypt from 'bcryptjs';


const plugin = (server, options, next) => {

  server.route({
    method: 'POST',
    path: '/v1/login',
    config: {
      plugins: {
        body: {merg: false, sanitizer: {stripNullorEmpty: false}}
      },
      tags: ['api', 'v1'],
    },
    handler: {
      async: async(request, reply) => {
        console.log(request.payload);
        let {username, password} = request.payload;
        const customers = await collection('customers');

        const foundCustomer = await customers.findOne({username});

        console.log(foundCustomer);

        // If the user is not found in the database
        if (!foundCustomer) {
          return reply({message: 'User not found!!!!'})
        }

        // If the user is found, but the password is not correct
        if (foundCustomer && !Bcrypt.compareSync(password, foundCustomer.hashpassword)) {
          return reply({message: 'Password incorrect'});
        }

        // If the user is found and the password matches
        if (foundCustomer && Bcrypt.compareSync(password, foundCustomer.hashpassword)) {
          const token = jwt.sign(foundCustomer, "secret", {expiresIn: '1 day'});
          console.log(token);
          return reply({token: token, type: foundCustomer.type});
        }

        return reply({});
      }
    }
  });


  return next();

};


plugin.attributes = {
  name: 'login',
  version: '1.0.0'
};

export default plugin;

