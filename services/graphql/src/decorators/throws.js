export default (errors = {}) => Class => {
  Class.errors = errors;
  return Class;
};
