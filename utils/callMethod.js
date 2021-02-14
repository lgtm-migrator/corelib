import { Meteor } from 'meteor/meteor'
import { check, Match } from 'meteor/check'

/**
 * Provides a Promise that wraps a method call
 * @param name
 * @param args
 * @param prepare
 * @param receive
 * @param success
 * @param failure
 * @return {Promise}
 */
export const callMethod = ({ name, args, prepare, receive, success, failure }) => {
  const methodName = typeof name === 'object' ? name.name : name
  check(methodName, String)
  check(args, Match.Maybe(Object))
  check(prepare, Match.Maybe(Function))
  check(receive, Match.Maybe(Function))
  check(success, Match.Maybe(Function))
  check(failure, Match.Maybe(Function))

  // at very first we prepare the call,for example by setting some submission flags
  if (typeof prepare === 'function') {
    prepare()
  }

  // then we create the promise
  const promise = new Promise((resolve, reject) => {
    Meteor.call(methodName, args, (error, result) => {
      // call receive hook in any case the method has completed
      if (typeof receive === 'function') {
        receive()
      }

      if (error) {
        return reject(error)
      }

      return resolve(result)
    })
  })

  if (typeof success === 'function') {
    promise.then(success)
  }

  if (typeof failure === 'function') {
    promise.catch(failure)
  }

  return promise
}
