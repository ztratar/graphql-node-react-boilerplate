import { TransactionContext, createTransactionContext } from '../functions/transactionContext';

// Attach this decorator to model based functions where database
// transactions should be using the same type of transaction
export default function transaction(target, name, descriptor) {
  const fn = descriptor.value;

  descriptor.value = function () {
    const args = Array.from(arguments);

    const lastArg = args[args.length - 1];

    if (!(lastArg instanceof TransactionContext)) {
      return createTransactionContext((transactionContext) => {
        if (lastArg === undefined) {
          args[Math.max(args.length - 1, 0)] = transactionContext;
        } else {
          args.push(transactionContext);
        }
        return fn.apply(this, args);
      });
    }
    return fn.apply(this, args);
  };

  return descriptor;
}
