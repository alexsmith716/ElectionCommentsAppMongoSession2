
module.exports = function (customErrorObject) {
  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> customErrorObjectEnumerable <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
  var newCustomErrorObjectEnumerable = {}
  Object.keys(customErrorObject).forEach(function (k) {
    if(k === 'Stack'){
      newCustomErrorObjectEnumerable['stack'] = customErrorObject[k]
    } else {
      newCustomErrorObjectEnumerable[k] = customErrorObject[k]
    }
  })
  return newCustomErrorObjectEnumerable
}