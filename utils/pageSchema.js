export const createPageSchema = context => (field) => {
  Object.assign(context.schema[field], {
    type: Object,
    blackbox: true,
    custom (...args) {
      // TODO validate based on element type/subtype
    }
  })
}