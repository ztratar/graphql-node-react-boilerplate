export default (name, doc) => {
  return Component => {
    Component.fragments = Component.fragments || {};
    Component.fragments[name] = doc;
    return Component;
  }
}
