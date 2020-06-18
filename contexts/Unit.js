import { Labels } from '../i18n/Labels'
import { Status } from '../types/Status'
import { UnitSet } from './UnitSet'
import { MediaLib } from './MediaLib'
import { getFieldName } from '../utils/getFieldName'
import { createPageSchema } from '../utils/pageSchema'

export const Unit = {}

Unit.name = 'unit'
Unit.label = 'unit.title'
Unit.icon = 'cube'
Unit.representative = 'shortCode'
Unit.useHistory = true

Unit.schema = {
  status: {
    type: Number,
    label: {
      name: Status.label,
      list: false,
      form: true,
      preview: true
    },
    allowedValues: Status.allowedValues,
    defaultValue: Status.defaultValue,
    dependency: {
      context: Status.name,
      field: Status.representative
    }
  },
  unitSet: {
    type: String,
    label: UnitSet.label,
    dependency: {
      collection: UnitSet.name,
      field: UnitSet.representative
    }
  },
  [Unit.representative]: {
    type: String,
    label: Labels[Unit.representative],
    value: {
      method: 'concat',
      input: [
        {
          type: 'document',
          source: 'unitSet',
          collection: UnitSet.name,
          field: UnitSet.representative
        },
        {
          type: 'value',
          value: '_'
        },
        {
          type: 'document',
          source: 'unitSet',
          collection: UnitSet.name,
          field: getFieldName(UnitSet.schema, UnitSet.schema.dimensionShort)
        },
        {
          type: 'increment',
          decimals: 4,
          collection: Unit.name
        }
      ]
    }
  },
  legacyId: {
    type: String,
    optional: true
  },
  title: {
    type: String,
    label: Labels.title
  },
  stimuli: {
    type: Array,
    optional: true,
    dependency: {
      filesCollection: MediaLib.name,
      version: 'original'
    }
  },
  'stimuli.$': {
    type: Object
  },
  instructions: {
    type: Array,
    optional: true,
    dependency: {
      filesCollection: MediaLib.name,
      version: 'original'
    }
  },
  'instructions.$': {
    type: Object
  },
  pages: {
    type: Array,
    optional: true,
    list: false
  },
  'pages.$': {
    type: Array,
    dependency: {
      filesCollection: MediaLib.name,
      version: 'original'
    }
  },
  'pages.$.$': {
    type: Object
  }
}

const pageSchema = createPageSchema(Unit)
pageSchema('stimuli.$')
pageSchema('instructions.$')
pageSchema('pages.$.$')
