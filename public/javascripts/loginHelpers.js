/* global $ */
/* global isSafari */
/* global location */
var helper = {

  init: function () {
    window.showLoading = function () {
        $('.modal-backdrop').show();
    };
    window.hideLoading = function () {
        $('.modal-backdrop').hide();
    };

    showLoading();

    setTimeout(function () { hideLoading(); }, 500);

    helper.initializeJqueryEvents();
  },

  initializeJqueryEvents: function (){
    var emailPattern = /^\S+@\S+\.\S+/;
    var passwordPattern = /^\S{4,}$/;

    $('#forgotPasswordAnchor').click(function (){
      $('#forgotPasswordFormModal').modal({
        keyboard: false,
        backdrop: 'static'
      })
    });

    $('#forgotPasswordFormModal').on('hidden.bs.modal', function () {
      $("#forgotPasswordForm").get(0).reset()
      $('#forgotPassword').removeAttr('disabled')
      $('#forgotPasswordForm .loginerror').removeClass('show').html('')
      $('#forgotPasswordForm .formerror').removeClass('show')
      $('#forgotPassword').removeClass('has-error')
      $('.alertWarning').addClass('hide').removeClass('show')
      $('.modalOkayBtn').hide()
      $('.modalCancelSubmitBtns').show()
      var nextModal = $('body').data('doNextModal')
      nextModal ? helper.doNextModal(nextModal) : null
    });

    $('#forgotPasswordForm').on('submit', function (e) {
      e.preventDefault()

      $('#forgotPassword').removeClass('has-error')
      $('#forgotPasswordForm .loginerror').removeClass('show').html('')

      var data = {}
      var email = $('#forgotPassword').val()
      var isEmailValid = emailPattern.test(email)
      var serviceUrl = $(this).attr('action')

      if (email === '') {
        $('#forgotPassword').addClass('has-error')
        $('#forgotPasswordForm .loginerror').addClass('show').html('Please enter email')
        return false
      }
      if (!isEmailValid) {
        $('#forgotPassword').addClass('has-error')
        $('#forgotPasswordForm .loginerror').addClass('show').html('Please enter your valid email')
        return false
      }

      $('.loading').show()

      data = {
        email: email
      }

      data['_csrf'] = $('meta[name="csrf-token"]').attr('content')
      
      $.ajax({
        rejectUnauthorized: false,
        url: serviceUrl,
        type: 'POST',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        accepts: 'application/json',

        success: function (data, status, xhr) {
          if (data.response === 'success') {
            $('.loading').hide()
            $('#forgotPassword').attr('disabled', 'true')
            $('.alertWarning').html(data.message)
            $('.alertWarning').addClass('show').removeClass('hide')
            $('.modalOkayBtn').show()
            $('.modalCancelSubmitBtns').hide()
          } else {
            $('.loading').hide()
            $('#forgotPassword').addClass('has-error')
            $('#forgotPasswordForm .loginerror').addClass('show').html('Please enter a valid email address')
            //helper.handleErrorResponse(data.validatedData)
            return false
          }
        },

        error: function (xhr, status, error) {
          $('.loading').hide()
          var parsedXHR = JSON.parse(xhr.responseText)
          $('#modalAlert .modal-title').html(parsedXHR.err.title)
          $('#modalAlert .alertDanger').html(parsedXHR.err.alert)
          $('#modalAlert #errScrollbox').html(parsedXHR.err.message)
          $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
          $('body').data('doNextModal', 'modalAlert')
          $('#forgotPasswordFormModal .cancelButton').trigger('click')
          return false
        }
      })
    })

    $('#loginForm').on('submit', function (e) {
      e.preventDefault()
      showLoading()

      $('#loginForm .formerror').removeClass('show').addClass('hide')
      $('#loginForm .loginerror').removeClass('show')
      $('#loginForm .form-control').removeClass('has-error')

      var data = {}
      var email = $('#login-email').val()
      var password = $('#login-password').val()
      var serviceUrl = $(this).attr('action')
      
      if (email === '' || password === '') {
        hideLoading()
        return false

      } else {
        data = {
          email: email,
          password: password
        }

        data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

        $.ajax({
            rejectUnauthorized: false,
            url: serviceUrl,
            type: 'POST',
            data: JSON.stringify(data),
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            accepts: 'application/json',

            success: function (data, status, xhr) {
              if (data.response === 'success') {
                hideLoading()
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> loginForm SUCCESS REDIRECT <<<<<<<<<<<<<<<<<<<<<<<<<<<<: ', data.redirect)
                location.href = data.redirect
                
              } else {
                hideLoading()
                if(data.validatedData){
                  $('#loginForm .form-control').addClass('has-error')
                  $('#loginForm .loginerror').addClass('show')
                  $('#loginForm .loginerror').html('Email and Password don\'t match. Please try again.')
                  // helper.handleErrorResponse(data.validatedData)
                }else{
                  $('#loginForm .formerror').removeClass('hide').addClass('show')
                }

                return false
              }
            },

            error: function (xhr, status, error) {
              hideLoading()
              var parsedXHR = JSON.parse(xhr.responseText)
              $('#modalAlert .modal-title').html(parsedXHR.err.title)
              $('#modalAlert .alertDanger').html(parsedXHR.err.alert)
              $('#modalAlert #errScrollbox').html(parsedXHR.err.message)
              $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
              $('#modalAlert').modal({ keyboard: false,backdrop: 'static' })
              return false
            }
        });
      }
    })
  },

  doNextModal: function (whatModal) {
    $('body').removeData('doNextModal')
    //setTimeout(function () {
      $('#'+whatModal).modal({
        keyboard: false,
        backdrop: 'static'
      })
    //}, 100)
  },

  showLoading: function () {
    $('.modal-backdrop').show();
  },

  hideLoading: function () {
    $('.modal-backdrop').hide();
  },

  clearForgotPassword: function () {
    $("#forgotPasswordForm").get(0).reset();
    $('#forgotPassword').removeAttr('disabled');
    $('#forgotPasswordForm .loginerror').removeClass('show').html('');
    $('#forgotPasswordForm .formerror').removeClass('show');
    $('#forgotPassword').removeClass('has-error');
    $('.alertWarning').addClass('hide').removeClass('show')
    $('.modalOkayBtn').hide();
    $('.modalCancelSubmitBtns').show();
  },

  handleErrorResponse: function (data) {
    Object.keys(data).forEach(function (p) {
      switch (p) {
        case 'email':
          // console.log('handleErrorResponse: ', p, ' :: ', data[p]);
          break;
        
        case 'password':
          // console.log('handleErrorResponse: ', p, ' :: ', data[p]);
          break;
      }
    })
  },

}

$(function () {
    helper.init()
})
