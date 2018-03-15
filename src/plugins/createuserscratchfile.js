
//
//  else if (username && password && usertype === 'company') {
//
//   const companies = await collection('company');
//
//   const foundCompany = companies.findOne({username});
//
//   if (foundCompany) {
//     return reply.redirect();
//   }
//
//   if (!foundCompany) {
//     const hashpassword = await encryptPassword(password);
//     const user = {username, hashpassword, coupons: []};
//     const result = await companies.insertOne({username, hashpassword, coupons: []});
//
//     if (result.insertedCount === 1) {
//       const token = jwt.sign(user, 'secret', {expiresIn: '1 day'});
//       return reply({token: token, type: 'company'});
//     }
//
//   }
//
// }
//
// return reply();


//
// if (username && password && usertype === 'user') {
//   const customers = await collection('customers');
//
//   const foundCustomer = await customers.findOne({username});
//
//   if (foundCustomer) {
//     return reply({message: 'you found me'});
//   }
