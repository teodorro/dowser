export const unreachable = (x: never): never => {
  console.log(x);
  throw new Error('Unreachable');
};

export default unreachable;
