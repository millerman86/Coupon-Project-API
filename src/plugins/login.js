import {collection} from '../db.js';
import jwt from 'jsonwebtoken';
import Bcrypt from 'bcryptjs';
import Boom from 'boom';
// import Joi from 'joi';




// STEPS FOR THE SIMPLEST WAY OF LOGGING IN KNOWN TO MAN
//
// STEP 1: Install
// https://github.com/dwyl/hapi-login
// npm install hapi-login joi bcrypt --save
//
// STEP 2: SPECIFY THE FIELDS REQUIRED FOR LOGIN
//
// ANY ADDITIONAL FIELDS CAN BE ADDED AS NEEDED
// let Joi = require('joi');
// let custom_fields = {
//   email     : Joi.string().email().required(), // Required
//   password  : Joi.string().required().min(6)   // minimum length 6 characters
// }
//
// STEP 3: Define your custom handler function
// handler: (required) A user lookup and password validation function with the signature function (request, reply)
// request - is the hapi request object of the request which is being authenticated.
//
// reply - the hapi reply object used to send the response to the client when login succeeds (or fails).

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
        console.log('HERE IS YOUR REQUEST PAYLOAD', request.payload);
        let {username, password} = request.payload;
        const customers = await collection('customers');

        const foundCustomer = await customers.findOne({username});

        console.log('HERE IS THE FOUND CUSTOMER', foundCustomer);

        // IF THE USER IS NOT FOUND IN THE DATABASE
        if (!foundCustomer) {
          return reply(Boom.notFound('User not found!!!!')); // THIS RETURNS AN OBJECT WITH A MESSAGE PROPERTY, USING REPLY.MESSAGE, WILL STILL EXECUTE THE .THEN PORTION OF THE CLIENT REQUEST
        }

        // IF THE USER IS FOUND BUT THE PASSWORD IS INCORRECT
        if (foundCustomer && !Bcrypt.compareSync(password, foundCustomer.hashpassword)) {
          return reply({message: 'Password incorrect'});
        }

        // IF THE USER IS FOUND AND THE PASSWORD MATCHES
        if (foundCustomer && Bcrypt.compareSync(password, foundCustomer.hashpassword)) {
          const token = jwt.sign(foundCustomer, "secret", {expiresIn: '1 day'});
          console.log('HERE IS YOUR TOKEN', token);
          return reply({token: token, type: foundCustomer.type}); // WILL BE REPLY.TOKEN, REPLY.TYPE ON THE CLIENT SIDE
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

