/*
  Expects Model interface of:
  {
    instanceOf(Object): Boolean
    findById(String [, transaction]): Promise<Model#Type>
    create(Object [, transaction]): Promise<Model#type>
    schema: SequelizeSchema
  }
*/
export default (Model, opts = { create: true }) => async (data, transaction) => !data ? (
  null
) : Model.isInstance(data) ? (
  data
) : data.id ? (
  await Model.findById(data.id, transaction)
) : (
  opts.create !== false ? await Model.create(data, transaction) : null
);
