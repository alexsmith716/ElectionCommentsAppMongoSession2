
module.exports = function (customObject, currentKey, newKey) {

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> customObjectEnumerable <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

  var newCustomObject = {}

  Object.keys(customObject).forEach(function (k) {
    if(k === 'Stack'){
      newCustomObject['stack'] = customObject[k]
    } else {
      newCustomObject[k] = customObject[k]
    }
  })
  return newCustomObject
}
