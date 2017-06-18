
module.exports = function (customObject, currentKey, newKey) {

  var newCustomObject = {}

  Object.keys(customObject).forEach(function (k) {
    if(k === 'Stack'){
      newCustomObject['stack'] = customObject[k]
      // delete customObject[k]
    } else {
      newCustomObject[k] = customObject[k]
    }
  })

  return newCustomObject
}
