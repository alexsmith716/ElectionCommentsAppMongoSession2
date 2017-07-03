
module.exports = function (err) {

  var errTitle = 'An Application Error Has Occurred'

  var errAlert = '<p>A error recently occurred with the application. Please try your request again.</p><p>If this problem continues, please contact our Help Desk at 555-555-1234.</p><p>You may also email Customer Service at customer.care@ThisGreatApp.com.</p><p>Visit our&nbsp;<a class="highlight" href="/customerservice">Customer Service</a>&nbsp;webpage for a full listing of helpful information.</p><p>We appreciate your patience!</p>'

  var errMessage = '<pre><p>Name:&nbsp;'+err.name+'</p><p>Message:&nbsp;'+err.message+'</p><p>Status:&nbsp;'+err.status+'</p><p>Code:&nbsp;'+err.code+'</p><p>Referer:&nbsp;'+err.referer+'</p><p>Stack:&nbsp;'+JSON.stringify(err.stack)+'</p></pre>'

  var renderableErrorObject = {title: errTitle, alert: errAlert, message: errMessage }

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> renderableErrorObject <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

  return renderableErrorObject

}
