import {collection} from '../db.js';


function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}

function blah() {
  console.log('blah')
}

const plugin = (server, options, next) => {

  server.route({
    method: 'GET',
    path: '/v1/coupons',
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
        let params = request.query;
        console.log(params);
        const couponCursor = await collection('company');

        if (isEmpty(params)) {

          let coupons = couponCursor.aggregate({
            $project: {
              _id: 0,
              id: 1,
              price: 1,
              product: 1,
              deal: 1,
              offer: 1,
              condition: 1,
              disclaimer: 1,
              company: 1,
              shipping: 1,
            }
          });

          coupons = await coupons.toArray();

          let featured = [];
          let regular = [];
          for (let coupon of coupons) {
            if (coupon.deal
              && coupon.offer
              && coupon.disclaimer) {
              featured.push(coupon);
            }
          }
          for (let coupon of coupons) {
            if (coupon.company

              && coupon.price
            ) {
              regular.push(coupon);
            }
          }

          featured = featured.slice(0, 4);

          regular = regular.slice(0, 15);

          let couponResponse = [{regular: regular, featured: featured, pageBase: 0, pageSize: 16}];

          return reply(couponResponse);

        } else if (params.direction && params.page) {
          let {direction, page} = params;
          page = parseInt(page);
          let coupons = couponCursor.aggregate({
            $project: {
              _id: 0,
              id: 1,
              price: 1,
              product: 1,
              deal: 1,
              offer: 1,
              condition: 1,
              disclaimer: 1,
              company: 1,
              shipping: 1,
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

              && coupon.price
            ) {
              regular.push(coupon);
            }
          }

          let resultsPerPage;


          if (direction === "increase" && page !== 0) {
            regular = regular.slice((page + 1), (page + 16));
            page = page + 16;
            resultsPerPage = page + 16;
          } else if (direction === 'decrease' && page > 16) {
            regular = regular.slice((page - 16), (page - 1));
            page = page - 16;
            resultsPerPage = page - 16;
          } else if (page === 0) {
            regular = regular.slice(1, 16);
            page = page + 16;
            resultsPerPage = page + 16;
          }

          featured = featured.slice(0, 4);

          let couponResponse = [{regular: regular, featured: featured, pageBase: page, pageSize: resultsPerPage}];


          return reply(couponResponse);

        } else {
          for (let key in params) {
            if (key === 'company') {
              const coupons = couponCursor.find({company: {$exists: true}});
              let results = await coupons.toArray();
              console.log(params.company.charAt(0).toLowerCase());
              console.log(params.company.charAt(0));
              console.log(results);
              results = results
                .filter(i => (String(i.company)).charAt(0).toUpperCase() === params.company.charAt(0).toUpperCase());

              console.log(results);
              return reply(results);
            } else if (key === 'price') {

              let {price, pageBase, direction} = params;
              console.log(price, pageBase, direction);

              pageBase = parseInt(pageBase);

              let page = pageBase;

              let coupons = couponCursor.aggregate({
                $project: {
                  _id: 0,
                  id: 1,
                  price: 1,
                  product: 1,
                  deal: 1,
                  offer: 1,
                  condition: 1,
                  disclaimer: 1,
                  company: 1,
                  shipping: 1
                }
              });

              let results = await coupons.toArray();
              let numberArray = new Array((results.length));


              price = parseInt(price);

              results.map((i, index) => {
                numberArray[index] = parseInt(i.price);
              });

              numberArray = numberArray.filter(i => i > price);


              let lastArray = new Array(numberArray.length);

              numberArray.map((i, index) => {
                lastArray[index] = String(i);
              });

              coupons = results.filter((i, index) => i.price >= price);

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
                  && coupon.price
                ) {
                  regular.push(coupon);
                }
              }
              featured = featured.slice(0, 4);

              regular.sort(function (a, b) {
                return parseFloat(a.price) - parseFloat(b.price)
              });

              let resultsPerPage;

              regular = regular.slice(0, 16);


              if (direction === "increase") {
                regular = regular.slice((page + 1), (page + 16));
                pageBase = page + 16;
                resultsPerPage = pageBase + 16;
              } else if (direction === 'decrease' && page > 16) {
                regular = regular.slice((page - 16), (page - 1));
                pageBase = page - 16;
                resultsPerPage = pageBase - 16;
              }


              console.log(pageBase, resultsPerPage);

              let couponResponse = [{
                regular: regular,
                featured: featured,
                pageBase: pageBase,
                pageSize: resultsPerPage
              }];
              console.log(couponResponse);
              return reply(couponResponse);

            } else if (key === 'product') {
              const coupons = couponCursor.find({product: {$exists: true}});
              const result = await coupons.toArray();
              const newResult = result
                .filter(i => i.product.charAt(0).toUpperCase() === params.product.charAt(0).toUpperCase());

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
                  && coupon.product
                  && coupon.price
                  && coupon.shipping
                  && coupon.deal
                  && coupon.price
                ) {
                  regular.push(coupon);
                }
              }
              const couponResponse = [{regular: regular, featured: featured}];
              return reply(couponResponse);
            } else if (key === 'deal') {
              const coupons = couponCursor.find({deal: {$exists: true}});
              const result = await coupons.toArray();
              const newResult = result.filter(i => i.deal == '2 FOR 1');
              console.log(newResult);
              return reply(newResult);
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/v1/coupons',
    config: {
      plugins: {
        body: {merg: false, sanitizer: {stripNullorEmpty: false}}
      },
      tags: ['api', 'v1'],
    },
    handler: {
      async: async(request, reply) => {
        let {id, price, product, deal, offer, condition, disclaimer, company, shipping} = request.payload;
        const couponsCursor = await collection('company');

        const result = await couponsCursor.insertOne({
          id,
          price,
          product,
          deal,
          offer,
          condition,
          disclaimer,
          company,
          shipping
        });

        if (result.insertedCount === 1) {
          return reply(201, {message: 'Coupon submitted successfully'});
        }
        return reply();
      }
    }
  });

  return next();
};

plugin.attributes = {
  name: 'coupons',
  version: '1.0.0'
};


export default plugin;

