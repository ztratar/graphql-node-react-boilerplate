export default (Error, data = {}) => async (val) => {
  const v = await val;
  if (!v) throw new Error({
    data
  });
  return v;
}
