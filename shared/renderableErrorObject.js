module.exports = function (err) {

  var errTitle = 'Application Error Notice'

  var errAlert = '<p>A error recently occurred with the application.</p><p>If this problem continues, please contact our Help Desk at 555-555-1234 or email Customer Service at customer.care@ThisGreatApp.com.</p><p>Visit our&nbsp;<a class="highlight" href="/customerservice">Customer Service</a>&nbsp;webpage for a full listing of helpful information.</p><p>We appreciate your patience!</p>'

  var errMessage = '<pre><p>Name:&nbsp;'+err.name+'</p><p>Message:&nbsp;'+err.message+'</p><p>Status:&nbsp;'+err.status+'</p><p>Code:&nbsp;'+err.code+'</p><p>Referer:&nbsp;'+err.referer+'</p><p>Stack:&nbsp;'+err.stack+'</p></pre>'

  var renderableErrorObject = {'title': errTitle, 'alert': errAlert, 'message': errMessage}

  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> renderableErrorObject <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

  return renderableErrorObject

}
