import {collection} from '../db.js';
import Boom from 'boom';

const plugin = (server, options, next) => {

  server.route({
    method: 'POST',
    path: '/v1/clipped/{customer}',
    config: {
      plugins: {
        body: {merg: false, sanitizer: {stripNullorEmpty: false}}
      },
      tags: ['api,', 'v1'],
      cors: {
        origin: ['*'],
        additionalHeaders: ['cache-control', 'x-requested-with']
      },
    },

    handler: {
      async: async(request, reply) => {
        let {couponId} = request.payload;
        const customer = request.params.customer ?
          encodeURIComponent(request.params.customer) : '';
        if (!customer) {
          return reply(Boom.unauthorized('You are not authorized.'));
        } else if (customer) {
          let cursor = await collection('customers');
          let foundUser = await cursor.findOne({username: customer});

          await cursor.update({'username': customer}, {$addToSet: {'coupons': couponId}});

          let foundUserData = foundUser.coupons;

          if (!foundUser) {
            return reply({message: 'You are not authorized.'});
          } else if (foundUser) {
            let couponCursor = await collection('company');

            let coupons = couponCursor.aggregate({
              $project: {
                _id: 0,
                id: 1,
                price: 1,
                product: 1,
                company: 1,
                shipping: 1,
                deal: 1,
              }
            });

            coupons = await coupons.toArray();

            let featured = [];
            let regular = [];
            for (let coupon of coupons) {
              if (coupon.deal
                && coupon.offer
                && coupon.condition
                && coupon.disclaimer) {
                featured.push(coupon);
              }
            }
            for (let coupon of coupons) {
              if (coupon.company
                && coupon.id
                // && coupon.product
                // && coupon.shipping
                // && coupon.deal
                && coupon.price
              ) {
                regular.push(coupon);
              }
            }


            for (let excludedItem of foundUserData) {
              regular = regular.filter(i => parseInt(i.id) !== parseInt(excludedItem))
            }

            featured = featured.slice(0, 4);

            regular = regular.slice(0, 15);

            let couponResponse = [{regular: regular, featured: featured, pageBase: 0, resultsPerPage: 16}];

            return reply(couponResponse);

          }
        }
        return reply();
      }
    }
  });

  next();

};

plugin.attributes = {
  name: 'clipped',
  version: '1.0.0'
};


export default plugin;
