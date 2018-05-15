import { expect } from 'chai';

import createResolver from '../../src/lib/createResolver';

describe('lib/createResolver', () => {
  // it('propagates errors through the resolver inheritance chain', () => {
  //   const err = 'error!!!';
  //   const transformed1 = 'transformed 1 error!!!';
  //   const transformed2 = 'transformed 2 error!!!';
  //   const final = 'final error!!!';
  // 
  //   const parent = createResolver(
  //     () => ({}),
  //     (root, context, args, e) => {
  //       expect(e).to.equal(err);
  //       return transformed1;
  //     }
  //   );
  //   const child = parent.createResolver(
  //     () => ({}),
  //     (root, context, args, e) => {
  //       expect(e).to.equal(transformed1);
  //       return transformed2;
  //     }
  //   );
  //   
  //   const grandchild = child.createResolver(
  //     () => { throw err },
  //     null
  //   );
  //   
  //   const greatgrandchild = grandchild.createResolver(
  //     () => { throw err },
  //     (root, context, args, e) => {
  //       expect(e).to.equal(transformed2);
  //       return final;
  //     }
  //   );
  //   
  //   return greatgrandchild().then((a, b, c, d) => {
  //     console.log(a, b, c, d)
  //     throw new Error('should have thrown')
  //   }).catch((e) => {
  //     console.log(e);
  //     expect(e).to.equal(final);
  //   });
  // });
});
