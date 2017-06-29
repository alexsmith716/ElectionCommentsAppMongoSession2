
var evaluateUserEmail = require('./evaluateUserEmail')

module.exports = function (req, res, cb) {

  var reqBody = req.body
  var match = {}
  var nomatch = {}
  var testName
  var emailPattern = /^\S+@\S+\.\S+/
  var passwordPattern = /^\S{4,}$/
  var displaynamePattern = /^[A-Za-z0-9_]{4,21}$/
  var basicTextMaxLengthPattern = /^(?=\s*\S)(.{1,35})$/
  var basicTextPattern = /^(?=\s*\S)(.{1,})$/
  var textSpaceMaxLengthOnlyPattern = /^[a-zA-Z ]{1,35}$/
  var validatedUserInput = {}
  var elementObject = {}
  var errorType
  var isDataValid
  var objName
  var emailIsValid
  var confirmEmailIsValid
  var passwordIsValid
  var confirmPasswordIsValid

  for (var compareTemplateName in req.body.template) {
    testName = compareTemplateName

    for (compareTemplateName in reqBody) {
      if (testName === compareTemplateName) {
        testName = undefined
        break
      }
    }

    if (testName !== undefined && testName !== 'expectedResponse') {
      nomatch[testName] = 'empty'
      reqBody[testName] = ''
    }

  }

  for (var objName in reqBody) {

    if (typeof reqBody[objName] !== 'function') {

      if (objName === 'displayname') {

        isDataValid = displaynamePattern.test(reqBody[objName])
        elementObject = {}

        if (!isDataValid) {

          reqBody[objName].length === 0 ? errorType = 'empty' : errorType = 'invalid'
          elementObject.error = errorType

          if (reqBody[objName].length > 0 && reqBody[objName].length < 4) {
            elementObject.stringValLength = reqBody[objName].length
            elementObject.lengthError = 'minlength'
          }

          if (reqBody[objName].length > 21) {
            elementObject.stringValLength = 21
            elementObject.lengthError = 'maxlength'
          }

        } else {

          elementObject.error = false
        }

        validatedUserInput[objName] = elementObject

      } else if (objName === 'email') {

        reqBody[objName] = reqBody[objName].trim()
        isDataValid = emailPattern.test(reqBody[objName])
        elementObject = {}

        if (!isDataValid) {

          reqBody[objName] === '' ? errorType = 'empty' : errorType = 'invalid'
          elementObject.error = errorType

        } else {

          elementObject.error = false
        }

        validatedUserInput[objName] = elementObject

      } else if (objName === 'confirmEmail') {

        reqBody[objName] = reqBody[objName].trim()
        isDataValid = emailPattern.test(reqBody[objName])
        elementObject = {}

        if (!isDataValid) {

          reqBody[objName] === '' ? errorType = 'empty' : errorType = 'invalid'
          elementObject.error = errorType

        } else {

          elementObject.error = false
        }

        validatedUserInput[objName] = elementObject


      } else if (objName === 'password') {

        isDataValid = passwordPattern.test(reqBody[objName])
        elementObject = {}

        if (!isDataValid) {

          reqBody[objName].length === 0 ? errorType = 'empty' : errorType = 'invalid'
          elementObject.error = errorType

          if (reqBody[objName].length > 0 && reqBody[objName].length < 4) {
            elementObject.stringValLength = reqBody[objName].length
          } 

        } else {

          elementObject.error = false
        }

        validatedUserInput[objName] = elementObject

      } else if (objName === 'confirmPassword') {

        isDataValid = passwordPattern.test(reqBody[objName])
        elementObject = {}

        if (!isDataValid) {

          reqBody[objName].length === 0 ? errorType = 'empty' : errorType = 'invalid'
          elementObject.error = errorType

        } else {

          elementObject.error = false
        }

        validatedUserInput[objName] = elementObject

      } else if (objName === 'firstname') {

        reqBody[objName] = reqBody[objName].trim()
        //isDataValid = basicTextPattern.test(reqBody[objName])
        elementObject = {}

        if (reqBody[objName] === '') {

          elementObject.error = 'empty'

        } else if (reqBody[objName].length > 35) {

          elementObject.stringValLength = 35
          elementObject.lengthError = 'maxlength'

        } else {

          elementObject.error = false
        }

        validatedUserInput[objName] = elementObject

      } else if (objName === 'lastname') {

        reqBody[objName] = reqBody[objName].trim()
        //isDataValid = basicTextPattern.test(reqBody[objName])
        elementObject = {}

        if (reqBody[objName] === '') {

          elementObject.error = 'empty'

        } else if (reqBody[objName].length > 35) {

          elementObject.stringValLength = 35
          elementObject.lengthError = 'maxlength'

        } else {

          elementObject.error = false
        }

        validatedUserInput[objName] = elementObject


      } else if (objName === 'city') {

        reqBody[objName] = reqBody[objName].trim()
        //isDataValid = basicTextPattern.test(reqBody[objName])
        elementObject = {}

        if (reqBody[objName] === '') {

          elementObject.error = 'empty'

        } else if (reqBody[objName].length > 35) {

          elementObject.stringValLength = 35
          elementObject.lengthError = 'maxlength'

        } else {

          elementObject.error = false
        }

        validatedUserInput[objName] = elementObject

      } else if (objName === 'state') {

        elementObject = {}

        if (reqBody[objName] === '') {

          elementObject.error = 'empty'

        } else {

          elementObject.error = false
        }

        validatedUserInput[objName] = elementObject
      }
    }
  }

  if (validatedUserInput['password']) {
    if (validatedUserInput['password'].error === false) {
      passwordIsValid = true
    }
  }

  if (validatedUserInput['confirmPassword']) {
    if (validatedUserInput['confirmPassword'].error === false) {
      confirmPasswordIsValid = true
    }
  }

  if (passwordIsValid && confirmPasswordIsValid) {

    elementObject = {}

    if (reqBody.password !== reqBody.confirmPassword) {

        elementObject.error = 'nomatch'

    } else {

      elementObject.error = 'match'
    }

    validatedUserInput['password'] = elementObject
    validatedUserInput['confirmPassword'] = elementObject

  }

  if (validatedUserInput['email']) {
    if (validatedUserInput['email'].error === false) {
      emailIsValid = true
    }
  }

  if (validatedUserInput['confirmEmail']) {
    if (validatedUserInput['confirmEmail'].error === false) {
      confirmEmailIsValid = true
    }
  }

  if (emailIsValid || confirmEmailIsValid) {

    var objValue
    var objName1
    var objName2

    emailIsValid ? objValue = reqBody.email : objValue = reqBody.confirmEmail
    objValue === reqBody.email ? objName1 = 'email' : objName1 = 'confirmEmail'

    evaluateUserEmail(req, res, function (err, response) {

      if (err) {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 1 serverSideValidation > evaluateUserEmail > ERROR')

        cb(err)

      } else {

        if (response.response === 'error') {

          elementObject = {}
          elementObject.error = 'registered'
          validatedUserInput[objName1] = elementObject

        }

        objName1 === 'email' ? objValue = reqBody.confirmEmail : objValue = reqBody.email
        objName1 === 'email' ? objName1 = 'confirmEmail' : objName1 = 'email'

        if (validatedUserInput[objName1] && validatedUserInput[objName1].error === false) {

          evaluateUserEmail(req, res, function (err, response) {

            if (err) {

              cb(err)

            } else {

              objName1 === 'email' ? objName2 = 'confirmEmail' : objName2 = 'email'

              elementObject = {}

              if (response.response === 'error') {

                elementObject.error = 'registered'
                validatedUserInput[objName1] = elementObject

              } else if (validatedUserInput[objName2] && validatedUserInput[objName2].error === false) {

                if (reqBody.email !== reqBody.confirmEmail) {

                  elementObject.error = 'nomatch'

                } else {

                  elementObject.error = 'match'

                }

                validatedUserInput.email = elementObject
                validatedUserInput.confirmEmail = elementObject

              }

              cb(null, validatedUserInput)

            }

          })

        } else {

          cb(null, validatedUserInput)

        }
      }

    })

  } else {

    cb(null, validatedUserInput)

  }
}
