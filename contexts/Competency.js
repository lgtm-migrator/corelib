import { Dimension } from './Dimension'
import { Labels } from '../i18n/Labels'
import { Status } from '../types/Status'
import { CompetencyCategory } from './CompetencyCategory'
import { getFieldName } from '../utils/getFieldName'
import { createGetAllRoute } from '../decorators/routes/getAll'

export const Competency = {
  name: 'competency',
  label: 'competency.title',
  icon: 'star',
  representative: ['shortCode', 'description'],
  filter: ['dimension', 'level', 'category', 'isLegacy']
}

Competency.schema = {
  status: {
    type: Number,
    label: Status.label,
    allowedValues: Status.allowedValues,
    defaultValue: Status.defaultValue,
    dependency: {
      context: Status.name,
      field: Status.representative
    }
  },
  shortCode: {
    type: String,
    max: 25,
    value: {
      method: 'concat',
      input: [
        {
          type: 'document',
          source: 'dimension',
          collection: Dimension.name,
          field: getFieldName(Dimension.schema, Dimension.schema.shortCode)
        },
        {
          type: 'field',
          source: 'level'
        },
        { type: 'value', value: '.' },
        {
          type: 'increment',
          decimals: 2,
          collection: Competency.name,
          filter: {
            fields: ['level', 'dimension']
          }
        }
      ]
    }
  },
  isLegacy: {
    type: Boolean,
    label: Labels.legacy,
    optional: true
  },
  dimension: {
    type: String,
    label: Dimension.label,
    dependency: {
      collection: Dimension.name,
      field: Dimension.representative
    }
  },
  level: {
    type: Number,
    min: 1,
    max: Number.MAX_SAFE_INTEGER
  },
  category: {
    type: String,
    optional: true,
    label: CompetencyCategory.label,
    dependency: {
      collection: CompetencyCategory.name,
      field: CompetencyCategory.representative,
      filter: {
        fields: [Dimension.name]
      }
    }
  },
  description: {
    type: String,
    label: Labels.description,
    max: 2500
  },
  descriptionSimple: {
    type: String,
    optional: true,
    max: 2500
  },
  example: {
    type: String,
    max: 2500,
    optional: true
  }
}

Competency.helpers = {}
Competency.methods = {}
Competency.publications = {}

Competency.routes = {}

Competency.routes.all = createGetAllRoute({
  context: Competency,
  schema: {
    ids: {
      type: Array,
      optional: true
    },
    'ids.$': String
  }
})
