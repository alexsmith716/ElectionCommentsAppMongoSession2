
module.exports = function (errorObject) {

  var newObjectErrorEnumerable = {}

  Object.keys(errorObject).forEach(function (k) {

    if (k !== 'model') {  
      newObjectErrorEnumerable[k] = errorObject[k]
    }

  })

  newObjectErrorEnumerable['stack'] = errorObject.stack

  return newObjectErrorEnumerable
}
