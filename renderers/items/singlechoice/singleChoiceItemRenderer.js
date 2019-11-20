import { ReactiveVar } from 'meteor/reactive-var'
import '../../../components/soundbutton/soundbutton'
import './singleChoiceItemRenderer.css'
import './singleChoiceItemRenderer.html'

Template.singleChoiceItemRenderer.onCreated(function () {
  const instance = this
  instance.values = new ReactiveVar()
  instance.selected = new ReactiveVar(null)
  instance.responseCache = new ReactiveVar(null)

  instance.autorun(function () {
    const data = Template.currentData()
    const { value } = data
    const name = Math.floor(Math.random() * 10000)
    instance.values.set(value.map((entry, index) => {
      entry.name = name
      entry.index = index
      return entry
    }))
  })
})

Template.singleChoiceItemRenderer.onRendered(function () {
  const instance = this
  submitValues(instance)
})

Template.singleChoiceItemRenderer.helpers({
  values() {
    return Template.instance().values.get()
  },
  selected (index) {
    return Template.instance().selected.get() === index
  }
})

Template.singleChoiceItemRenderer.events({
  'click .radio-group-soundbutton' (event) {
    event.stopPropagation()
  },
  'click .choice-entry' (event, templateInstance) {
    const $target = templateInstance.$(event.currentTarget)
    const indexStr = $target.data('index')
    const name = $target.data('name')
    const index = parseInt(indexStr, 10)

    // skip if we have already selected this
    // to prevent further unnecessary processing
    if (templateInstance.selected.get() === index) {
      return
    }

    templateInstance.selected.set(index)
    templateInstance.$(`#${name}-${index}`).prop('checked', true)
    submitValues(templateInstance)
  }
})

function submitValues (templateInstance) {
  let value = ''
  templateInstance.$('input:radio').each(function (index, radioButton) {
    const $rb = templateInstance.$(radioButton)
    if ($rb.is(':checked')) {
      value = $rb.val()
    }
  })

  // skip if there is no onInput connected
  // which can happen when creating new items
  if (!templateInstance.data.onInput) {
    return
  }

  const userId = templateInstance.data.userId
  const sessionId = templateInstance.data.sessionId
  const taskId = templateInstance.data.taskId
  const page = templateInstance.data.page
  const type = templateInstance.data.subtype

  // also return if our identifier values
  // are not set, which also can occur in item-dev
  if (!userId || !sessionId || !taskId) {
    return
  }

  const responses = []
  responses.push(value)

  // we use a simple stringified cache as we have fixed
  // positions, so we can easily skip sending same repsonses
  const cache = templateInstance.responseCache.get()
  const strResponses = JSON.stringify(responses)
  if (strResponses === cache) {
    return
  }

  templateInstance.responseCache.set(strResponses)
  templateInstance.data.onInput({ userId, sessionId, taskId, page, type, responses })
}