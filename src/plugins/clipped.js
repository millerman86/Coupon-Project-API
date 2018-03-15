import {collection} from '../db.js';
import Boom from 'boom';

const plugin = (server, options, next) => {

  server.route({
    method: 'POST',
    path: '/v1/clipped',
    config: {
      plugins: {
        body: {merg: false, sanitizer: {stripNullorEmpty: false}}
      },
      tags: ['api,', 'v1'],
      cors: {
        origin: ['http://elegant-kalam-35b272.netlify.com'],

        additionalHeaders: ['Access-Control-Allow-Origin', 'cache-control', 'x-requested-with']
      },
    },

    handler: {
      async: async(request, reply) => {


        let {couponId, customer} = request.payload;

        console.log(couponId, customer);

        let cursor = await collection('customers');
        let foundUser = await cursor.findOne({username: customer});

        if (!foundUser) return reply({message: "USER NOT FOUND"});


        await cursor.findOneAndUpdate({"username": customer}, {$addToSet: {"coupons": couponId}});

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


        cursor = await collection('customers');
        foundUser = await cursor.findOne({username: customer});


        let alreadyClippedCoupons = foundUser.coupons;


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
            && coupon.price
          ) {
            regular.push(coupon);
          }
        }



        for (let excludedItem of alreadyClippedCoupons) {
          regular = regular.filter(i => parseInt(i.id) !== parseInt(excludedItem))
        }


        featured = featured.slice(0, 4);

        regular = regular.slice(0, 15);


        return reply({message: 'This is an empty reply', regular: regular, featured: featured});

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












