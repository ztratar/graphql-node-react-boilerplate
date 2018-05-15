export default errorsCb => {
  return Component => {
    Component.errors = errorsCb();
    return Component;
  }
}
