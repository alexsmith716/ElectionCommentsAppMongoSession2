/* global $ */
/* global isSafari */
/* global location */
var helper = {

  init: function() {
    helper.showLoading()

    $('#state').attr('required', false)

    setTimeout(function () { helper.hideLoading() }, 500)

    console.log('### userProfileHelpers > isSafari: ', isSafari)
    console.log('### userProfileHelpers > interactiveFormValidationEnabled??: ', interactiveFormValidationEnabled)

    //var windowHeight = $(window).height();
    var windowHeight = ($(window).height() - 180);
    $('#errScrollbox').css('max-height', windowHeight+'px');

    helper.initializeJqueryEvents()
  },

  // handling pre-safari 10.1 & webkit 603.1.30
  testFormValidity: function (theForm, eventListener) {

    var boundEventTypes
    var formElement
    var checkConstraints
    var formValid = null
    var resp = {}

    for( var i = 0; i < theForm.length; i++ ) {

      formElement = $(theForm[i])
      checkConstraints = formElement.get(0).checkValidity()

      if(!checkConstraints && formValid === null){
        formValid = false
        resp.formValid = false
        resp.focusFirstElement = formElement
        break
      }

      if(eventListener === 'change'){
        boundEventTypes = $._data( formElement[0], 'events' );
        for (var eType in boundEventTypes){
          formElement.trigger(eType)
        }
      }
      
      if(eventListener === 'focusout'){
        formElement.trigger('focusout')
      }
    }
    return resp
  },


  initializeJqueryEvents:  function(){

    $('#modalAlert').on('shown.bs.modal', function () {
      //
    })

    $('#modalAlert').on('hidden.bs.modal', function () {
      $('#modalAlert .modal-title').html('')
      $('#modalAlert .alert').html('')
      $('#modalAlert').find('.alert').removeClass('show').addClass('hide')
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#editProfileFormModal').on('shown.bs.modal', function() {
      $('body').data('modalShown', '#editProfileFormModal')
      var activeElementID = $('body').data('elementID')
      $('#'+activeElementID).focus()
    })

    $('#editProfileFormModal').on('hidden.bs.modal', function () {
      $('body').removeData('modalShown');
      var activeElementID = $('body').data('elementID')
      $('#editProfileForm .formerror').removeClass('show').addClass('hide')
      $('#editProfileForm').get(0).reset()
      $('#editProfileForm').find('.error').removeClass('show ').addClass('hide')
      $('#'+activeElementID+'Error').removeClass('show').html('')
      $('#'+activeElementID).removeClass('has-error')
      $('.modalAlertSuccess').hide()
      $('.modalAlertDanger').hide()
      $('.modalOkayBtn').hide()
      $('.modalCancelSubmitBtns').show()
      var nextModal = $('body').data('doNextModal')
      nextModal ? helper.doNextModal(nextModal) : null
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#currentUserDataPathModal').on('shown.bs.modal', function () {
      $('body').data('modalShown', '#currentUserDataPathModal')
    })

    $('#currentUserDataPathModal').on('hidden.bs.modal', function () {
      helper.resetNewUserDataItemModals()
      var nextModal = $('body').data('doNextModal')
      nextModal ? helper.doNextModal(nextModal) : null
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#userDataEmailPathChangeModal').on('shown.bs.modal', function() {
      helper.turnOnSpecificEvents()
      $('body').data('modalShown', '#userDataEmailPathChangeModal')
    })

    $('#userDataEmailPathChangeModal').on('hidden.bs.modal', function () {
      helper.resetNewUserDataItemModals()
      var nextModal = $('body').data('doNextModal')
      nextModal ? helper.doNextModal(nextModal) : null
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#userDataPasswordPathChangeModal').on('shown.bs.modal', function() {
      helper.turnOnSpecificEvents()
      $('body').data('modalShown', '#userDataPasswordPathChangeModal')
    })

    $('#userDataPasswordPathChangeModal').on('hidden.bs.modal', function () {
      helper.resetNewUserDataItemModals()
      var nextModal = $('body').data('doNextModal')
      nextModal ? helper.doNextModal(nextModal) : null
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#personalInfoToggle').on('click', function (e) {
      helper.toggleEditBtn('personalInfo', true);
    })

    $('#personalInfoUpdate').on('click', function (e) {
      helper.toggleEditBtn('personalInfo', false);
    })

    $('#accountInfoToggle').on('click', function (e) {
      helper.toggleEditBtn('accountInfo', true);
    })

    $('#accountInfoUpdate').on('click', function (e) {
      helper.toggleEditBtn('accountInfo', false);
    })

    $('.editFormElement').on('click', function (e) {
      helper.doEditProfileModal(this);
    })

    $('.editFormEmailPassElement').on('click', function (e) {
      helper.doUserDataPathChange(this);
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#editProfileForm').on('submit', function(e) {

      console.log('>>>>>>>>>>>>>>>>>>>> editProfileForm > SUBMIT <<<<<<<<<<<<<<<<<<<<<<<')

      e.preventDefault()
      $('.loading').show()
      
      var elementID = $('#editProfileForm').data('elementID')
      var whichformdataid = $('body').data('whichformdataid')
      var labelText = helper.makeTitleFromElementID(whichformdataid)
      var s = document.getElementById(elementID)
      var data = {}
      var serviceUrl = $(this).attr('action')
      var constrainedFormElements = document.getElementById('editProfileForm').querySelectorAll('[required]')

      if(!interactiveFormValidationEnabled){
        var testFocusout = helper.testFormValidity(constrainedFormElements, 'focusout')
        if (testFocusout.formValid !== undefined){
          console.log('+++++++++++ BAD FORM !!!!!!!!!!!')
          testFocusout.focusFirstElement.focus()
          $('.loading').hide()
          return false
        }
      }

      data[elementID] = $('#'+elementID).val()
      data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

      console.log('>>>>>>>>>>>>>>>>>>>> editProfileForm > SUBMIT > data <<<<<<<<<<<<<<<<<<<<<<<: ', data)

      $.ajax({

        rejectUnauthorized: false,
        url: serviceUrl,
        type: 'PUT',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        accepts: 'application/json',

        success: function(data, status, xhr) {

          if (data.response === 'success') {

            console.log('#editProfileForm > ajax > SUCCESS > SUCCESS: ')
            
            $('.loading').hide()
            $('#modalAlert .modal-title').html('Edit Profile Update Alert')
            $('#modalAlert .alertSuccess').html('You\'re '+labelText+' has been successfully changed!')
            $('#modalAlert .alertSuccess').addClass('show').removeClass('hide')
            $('body').data('doNextModal', 'modalAlert')
            $('#editProfileFormModal .cancelButton').trigger('click')
            $('.'+whichformdataid).text(data.updatedData)

          } else {

            $('.loading').hide()
            if(data.validatedData){

              console.log('#editProfileForm > ajax > SUCCESS > ERROR > validatedData: ', data)

              helper.handleErrorResponse(data.validatedData)

            }else{

              console.log('#editProfileForm > ajax > SUCCESS > ERROR > ERR: ', data)

              $('#modalAlert .alertDanger').html('Could not update your information! Please try again or contact Customer Service.')
              $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
              $('body').data('doNextModal', 'modalAlert')
              $('#editProfileFormModal .cancelButton').trigger('click')

            }
            return false
          }

        },

        error: function(xhr, status, error) {

          //console.log('#editProfileForm > ajax > ERROR > ERROR: ', xhr)
          
          $('.loading').hide()
          var parsedXHR = JSON.parse(xhr.responseText)

          console.log('#editProfileForm > ajax > ERROR > ERROR > TITLE: ', parsedXHR.err.title)
          console.log('#editProfileForm > ajax > ERROR > ERROR > ALERT: ', parsedXHR.err.alert)
          console.log('#editProfileForm > ajax > ERROR > ERROR > MESSAGE: ', parsedXHR.err.message)

          $('#modalAlert .modal-title').html(parsedXHR.err.title)
          $('#modalAlert .alertDanger').html(parsedXHR.err.alert)
          $('#modalAlert #errScrollbox').html(parsedXHR.err.message)
          $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
          $('body').data('doNextModal', 'modalAlert')
          $('#editProfileFormModal .cancelButton').trigger('click')
          return false

        }
      })
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#userDataEmailPathChangeForm').on('submit', function(e) {

      console.log('>>>>>>>>>>>>>>>>>>>>>> userDataEmailPathChangeForm > SUBMIT 1 <<<<<<<<<<<<<<<<<<<<<<<<<')

      e.preventDefault()
      $('.loading').show()
      $('#userDataEmailPathChangeForm .formerror').removeClass('show').addClass('hide')

      var whichformdataid = $('body').data('whichformdataid')
      var newVal = $.trim($('#email').val())
      var data = {}
      var serviceUrl = $(this).attr('action')
      var constrainedFormElements = document.getElementById('userDataEmailPathChangeForm').querySelectorAll('[required]')

      if(!interactiveFormValidationEnabled){
        var testFocusout = helper.testFormValidity(constrainedFormElements, 'focusout')
        if (testFocusout.formValid !== undefined){
          console.log('+++++++++++ BAD FORM !!!!!!!!!!!')
          testFocusout.focusFirstElement.focus()
          $('.loading').hide()
          return false
        }
      }

      var data = {
        type: 'email',
        newUserDataItem: $('#email').val(),
        confirmNewUserDataItem: $('#confirmEmail').val()
      }

      data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

      console.log('>>>>>>>>>>>>>>>>>>>>>> userDataEmailPathChangeForm > SUBMIT 2 <<<<<<<<<<<<<<<<<<<<<<<<<: ', data)

      $.ajax({

        rejectUnauthorized: false,
        url: serviceUrl,
        type: 'PUT',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        accepts: 'application/json',

        success: function(data, status, xhr) {

          if (data.response === 'success') {

            console.log('>>>>>>>>>> userDataEmailPathChangeForm > ajax > SUCCESS > SUCCESS <<<<<<<<<<: ', data)

            $('#modalAlert .alertSuccess').html('You\'re Email has been successfully changed!')
            $('#modalAlert .alertSuccess').addClass('show').removeClass('hide')
            $('body').data('doNextModal', 'modalAlert')
            $('#userDataEmailPathChangeModal .cancelButton').trigger('click')
            $('.'+whichformdataid).text(newVal)
            $('.loading').hide()

          } else {

            $('.loading').hide()
            if (data.alertDanger) {

              console.log('>>>>>>>>>> userDataEmailPathChangeForm > ajax > SUCCESS > ERROR 1 <<<<<<<<<<: ', data)

              $('#currentUserDataPathModal .modal-title').html('Change your Email:')
              $('#currentUserDataPathLabel').html('Please Enter Your Current Email Address:')
              $('#currentUserDataPathModal .alertDanger').html(data.alertDanger)
              $('#currentUserDataPathModal .alertDanger').addClass('show').removeClass('hide')

              $('#currentUserDataPath').attr({
                type: 'text',
                pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
                title: 'Please enter a valid Email Address',
                placeholder: 'Current Email Address'
              })

              $('body').data('doNextModal', 'currentUserDataPathModal')
              $('#userDataEmailPathChangeModal .cancelButton').trigger('click')
 
              /*
              $('#currentUserDataPath').off('focusout')
              $('#email').off('focusout')
              $('#confirmEmail').off('focusout')
              $('body').off('click')
              */

            } else if (data.validatedData) {

              console.log('>>>>>>>>>> userDataEmailPathChangeForm > ajax > SUCCESS > ERROR 2 <<<<<<<<<<: ', data)

              $('body').data('validatedData', data.validatedData)
              helper.handleErrorResponse(data.validatedData)

            } else {

              console.log('>>>>>>>>>> userDataEmailPathChangeForm > ajax > SUCCESS > ERROR 3 <<<<<<<<<<: ', data)

              $('#modalAlert .alertDanger').html('Could not update your information! Please try again or contact Customer Service.')
              $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
              $('body').data('doNextModal', 'modalAlert')
              $('#userDataEmailPathChangeModal .cancelButton').trigger('click')
              
            }

            return false
          }

        },

        error: function(xhr, status, error) {

          console.log('>>>>>>>>>> userDataEmailPathChangeForm > ajax > ERROR > ERROR <<<<<<<<<<: ', xhr)

          $('.loading').hide()
          var parsedXHR = JSON.parse(xhr.responseText)
          $('#modalAlert .modal-title').html(parsedXHR.err.title)
          $('#modalAlert .alertDanger').html(parsedXHR.err.alert)
          $('#modalAlert #errScrollbox').html(parsedXHR.err.message)
          $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
          $('body').data('doNextModal', 'modalAlert')
          $('#userDataEmailPathChangeModal .cancelButton').trigger('click')
          return false

        }
      })
    })

    $('#userDataPasswordPathChangeForm').on('submit', function(e) {

      console.log('>>>>>>>>>>>>>>>>>>>>>> userDataPasswordPathChangeForm > SUBMIT 1 <<<<<<<<<<<<<<<<<<<<<<<<<')

      e.preventDefault()
      $('.loading').show()
      $('#userDataPasswordPathChangeForm .formerror').removeClass('show').addClass('hide')

      var data = {}
      var serviceUrl = $(this).attr('action')
      var constrainedFormElements = document.getElementById('userDataPasswordPathChangeForm').querySelectorAll('[required]')

      if(!interactiveFormValidationEnabled){
        var testFocusout = helper.testFormValidity(constrainedFormElements, 'focusout')
        if (testFocusout.formValid !== undefined){
          console.log('+++++++++++ BAD FORM !!!!!!!!!!!')
          testFocusout.focusFirstElement.focus()
          $('.loading').hide()
          return false
        }
      }

      var data = {
        type: 'password',
        newUserDataItem: $('#password').val(),
        confirmNewUserDataItem: $('#confirmPassword').val()
      }

      data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

      console.log('>>>>>>>>>>>>>>>>>>>>>> userDataPasswordPathChangeForm > SUBMIT 2 <<<<<<<<<<<<<<<<<<<<<<<<<: ', data)

      $.ajax({

        rejectUnauthorized: false,
        url: serviceUrl,
        type: 'PUT',
        data: JSON.stringify(data),
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        accepts: 'application/json',

        success: function(data, status, xhr) {

          if (data.response === 'success') {

            console.log('>>>>>>>>>> userDataPasswordPathChangeForm > ajax > SUCCESS > SUCCESS <<<<<<<<<<: ', data)

            $('#modalAlert .alertSuccess').html('You\'re Password has been successfully changed!')
            $('#modalAlert .alertSuccess').addClass('show').removeClass('hide')
            $('body').data('doNextModal', 'modalAlert')
            $('#userDataPasswordPathChangeModal .cancelButton').trigger('click')
            $('.loading').hide()

          } else {

            $('.loading').hide()
            if (data.alertDanger) {

              console.log('>>>>>>>>>> userDataPasswordPathChangeForm > ajax > SUCCESS > ERROR 1 <<<<<<<<<<: ', data)
              
              $('#currentUserDataPathModal .modal-title').html('Change your Password:')
              $('#currentUserDataPathLabel').html('Please Enter Your Current Email Address:')
              $('#currentUserDataPathModal .alertDanger').html(data.alertDanger)
              $('#currentUserDataPathModal .alertDanger').addClass('show').removeClass('hide')

              $('#currentUserDataPath').attr({
                type: 'text',
                pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
                title: 'Please enter a valid Email Address',
                placeholder: 'Current Email Address'
              })

              $('body').data('doNextModal', 'currentUserDataPathModal')
              $('#userDataPasswordPathChangeModal .cancelButton').trigger('click')
 
              /*
              $('#currentUserDataPath').off('focusout')
              $('#email').off('focusout')
              $('#confirmEmail').off('focusout')
              $('body').off('click')
              */

            } else if (data.validatedData) {

              console.log('>>>>>>>>>> userDataPasswordPathChangeForm > ajax > SUCCESS > ERROR 2 <<<<<<<<<<: ', data)

              $('body').data('validatedData', data.validatedData)
              helper.handleErrorResponse(data.validatedData)

            } else {

              console.log('>>>>>>>>>> userDataPasswordPathChangeForm > ajax > SUCCESS > ERROR 3 <<<<<<<<<<: ', data)

              $('#modalAlert .alertDanger').html('Could not update your information! Please try again or contact Customer Service.')
              $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
              $('body').data('doNextModal', 'modalAlert')
              $('#userDataPasswordPathChangeModal .cancelButton').trigger('click')
              
            }

            return false
          }

        },

        error: function(xhr, status, error) {

          console.log('>>>>>>>>>> userDataPasswordPathChangeForm > ajax > ERROR > ERROR <<<<<<<<<<: ', xhr)

          $('.loading').hide()
          var parsedXHR = JSON.parse(xhr.responseText)
          $('#modalAlert .modal-title').html(parsedXHR.err.title)
          $('#modalAlert .alertDanger').html(parsedXHR.err.alert)
          $('#modalAlert #errScrollbox').html(parsedXHR.err.message)
          $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
          $('body').data('doNextModal', 'modalAlert')
          $('#userDataPasswordPathChangeModal .cancelButton').trigger('click')
          return false

        }
      })
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    $('body').on('mousedown', function (e) {

      var activeElement = $(document.activeElement)

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> BODY > MOUSEDOWN > activeElement <<<<<<<<<<<<<<<<<<<<<<: ', activeElement)
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> BODY > MOUSEDOWN > e.target <<<<<<<<<<<<<<<<<<<<<<: ', e.target)

      if ($(e.target).hasClass('submit')) {
        if (activeElement.is( 'INPUT' )) {
          // $('body').data('activeElement', activeElement.attr('id'))
        }
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> BODY > SUBMIT > MOUSEDOWN <<<<<<<<<<<<<<<<<<<<?: ', $('body').data('activeElement'))
      }

      if (e.target.attributes['data-dismiss'] || $(e.target).hasClass('cancelButton') || e.target.innerHTML === 'Cancel') {
        helper.turnOffSpecificEvents()
      }

    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    $('#currentUserDataPathModal .nextButton').on('click', function(e) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> currentUserDataPathModal .nextButton 1 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

      var type = $('body').data('elementID')
      var currentUserEmailVerified = $('#currentUserDataPathModal').data('currentUserEmailVerified')
      var data = $('#currentUserDataPath').val()
      var testData = helper.pattern.basicTextMaxLength.test(data)

      if (testData) {

        if (currentUserEmailVerified !== true) {

          helper.validateNewUserDataService(data, 'email', 'true', function (err, response) {

            if (err) {

              $('#currentUserDataPath').addClass('has-error')
              $('#currentUserDataPathError').removeClass('show').addClass('hide')
              $('#currentUserDataPathRegistered').removeClass('hide').addClass('show').html('Please Enter Your '+$('#currentUserDataPath').attr('placeholder'))

            } else {

              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> currentUserDataPathModal .nextButton 2 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

              $('#currentUserDataPath').removeClass('has-error')
              $('#currentUserDataPathError').removeClass('show').addClass('hide')
              $('#currentUserDataPathRegistered').removeClass('show').addClass('hide')

              if(type === 'email'){

                $('body').data('doNextModal', 'userDataEmailPathChangeModal')
                $('#currentUserDataPathModal .cancelButton').trigger('click')

              }

              if(type === 'password'){

                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> currentUserDataPathModal .nextButton 3 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

                $('#currentUserDataPathModal').data('currentUserEmailVerified', true)

                $('#currentUserDataPathLabel').html('Please Enter Your Current Password:')
                $('#currentUserDataPath').val('')

                $('#currentUserDataPath').attr({ 
                  type: 'password',
                  pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
                  title: 'Please enter your Password',
                  placeholder: 'Current Password'
                })


                $('body').data('doNextModal', 'currentUserDataPathModal')
                $('#currentUserDataPathModal .cancelButton').trigger('click') 
      
              }
            }
          })

        } else {

          if (type === 'password') {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> currentUserDataPathModal .nextButton 4 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

            helper.validateNewUserDataService(data, type, 'true', function (err, response) {

              if (err) {

                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> currentUserDataPathModal .nextButton 5 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

                if(err.alertDanger){

                  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> currentUserDataPathModal .nextButton 5a <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

                  $('#currentUserDataPath').val('')
                  $('#currentUserDataPathModal').removeData('currentUserEmailVerified')

                  $('#currentUserDataPathModal .alertDanger').html(err.alertDanger)
                  $('#currentUserDataPathModal .alertDanger').addClass('show').removeClass('hide')

                  $('#currentUserDataPathLabel').html('Please Enter Your Current Email Address:')

                  $('#currentUserDataPath').attr({
                      type: 'text',
                      pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
                      title: 'Please enter a valid Email Address',
                      placeholder: 'Current Email Address'
                  })

                }else{

                  console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> currentUserDataPathModal .nextButton 5b <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

                  $('#currentUserDataPath').addClass('has-error')
                  $('#currentUserDataPathError').removeClass('show').addClass('hide')
                  $('#currentUserDataPathRegistered').removeClass('hide').addClass('show').html('Please Enter Your '+$('#currentUserDataPath').attr('placeholder'))

                }

              } else {

                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> currentUserDataPathModal .nextButton 6 <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

                $('#currentUserDataPath').removeClass('has-error')
                $('#currentUserDataPathError').removeClass('show').addClass('hide')
                $('#currentUserDataPathRegistered').removeClass('show').addClass('hide')
                
                $('#currentUserDataPathModal').data('currentUserEmailVerified', true)

                $('body').data('doNextModal', 'userDataPasswordPathChangeModal')
                $('#currentUserDataPathModal .cancelButton').trigger('click') 

              }

            })

          }

        }

      } else {

        $('#currentUserDataPath').addClass('has-error')
        $('#currentUserDataPathError').removeClass('hide').addClass('show')

      }

    })

  },



  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

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
    $('.modal-backdrop').show()
  },

  hideLoading: function () {
    $('.modal-backdrop').hide()
  },

  pattern: {
    displayname: /^[A-Za-z0-9_]{4,21}$/,
    email: /^\S+@\S+\.\S+/,
    password: /^\S{4,}$/,
    password2: /^[\S]{4,}$/,
    basicTextMaxLength: /^(?=\s*\S)(.{1,35})$/,
    basicText: /^(?=\s*\S)(.{1,})$/,
    textSpaceMaxLengthOnly: /^[a-zA-Z ]{1,35}$/
  },

  makeTitleFromElementID: function(whichID) {
      whichID = whichID.replace(/-/g, ' ')
      labelText = whichID.replace(/\b\w/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
      return labelText
  },

  // AbcdefghijklmnopqrstUvwxyzabcdefghIjklmnopqrstuvwxyz
  validateMaxLengthUserInput: function (val, maxlen) {
    val = $.trim(val)
    var newVal = (val.length) - maxlen
    newVal = (val.length) - newVal
    newVal = val.slice(0, newVal)
    return newVal
  },

  elementIDtoTitleCase: function (whichID) {
    whichID = whichID.replace(/([A-Z])/g, ' $1')
    var labelText = whichID.replace(/^./, function (str) { return str.toUpperCase() })
    return labelText
  },


// =================================================================================================================================
// =================================================================================================================================


  resetNewUserDataItemModals: function () {
    $('body').removeData('modalShown')

    $('#currentUserDataPath').val('')
    $('#currentUserDataPath').removeClass('has-error')
    $('#currentUserDataPathModal .alertDanger').html('')
    $('#currentUserDataPathModal .alertDanger').addClass('hide').removeClass('show')

    $('#currentUserDataPathModal').find('.error').removeClass('show').addClass('hide')
    $('#currentUserDataPathRegistered').html('')

    $('#userDataEmailPathChangeForm .formerror').removeClass('show').addClass('hide')
    $('#userDataEmailPathChangeForm').get(0).reset()
    $('#userDataEmailPathChangeModal .modalAlertWarning .alert').html('')
    $('#userDataEmailPathChangeModal .modalAlertWarning').hide()
    $('#userDataEmailPathChangeModal input').removeClass('has-error')
    $('#userDataEmailPathChangeModal').find('.error').removeClass('show').addClass('hide')

    $('#userDataPasswordPathChangeForm .formerror').removeClass('show').addClass('hide')
    $('#userDataPasswordPathChangeForm').get(0).reset()
    $('#userDataPasswordPathChangeModal .modalAlertWarning .alert').html('')
    $('#userDataPasswordPathChangeModal .modalAlertWarning').hide();
    $('#userDataPasswordPathChangeModal').find('.error').removeClass('show').addClass('hide')
    $('#userDataPasswordPathChangeModal input').removeClass('has-error')
  },

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  turnOffSpecificEvents: function () {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> turnOffSpecificEvents <<<<<<<<<<<<<<<<<<<<<<<<<<<')

    $('#email').off('change')
    $('#confirmEmail').off('change')

    $('#firstname').off('focusout')
    $('#lastname').off('focusout')
    $('#city').off('focusout')

    $('#password').off('focusout')
    $('#confirmPassword').off('focusout')

  },

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  turnOnSpecificEvents: function () {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> turnOnSpecificEvents <<<<<<<<<<<<<<<<<<<<<<<<<<<')

    $('#email').on('change', function (e) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> email > onChange <<<<<<<<<<<<<<<<<<<<<<<<<<<')
      //!interactiveFormValidationEnabled ? helper.turnOffSpecificEvents() : null
      $('body').data('elementID', 'email')
      helper.emailElementValidation('email', e.type(), 'confirmEmail', $(this).val())
    })

    $('#confirmEmail').on('change', function (e) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> confirmEmail > onChange <<<<<<<<<<<<<<<<<<<<<<<<<<<')
      //!interactiveFormValidationEnabled ? helper.turnOffSpecificEvents() : null
      $('body').data('elementID', 'email')
      helper.emailElementValidation('confirmEmail', e.type(), 'email', $(this).val())
    })

    $('#password').on('change', function (e) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> password > onChange <<<<<<<<<<<<<<<<<<<<<<<<<<<')
      //!interactiveFormValidationEnabled ? helper.turnOffSpecificEvents() : nul
      $('body').data('elementID', 'password')
      helper.passwordElementValidation('password', e.type(), 'confirmPassword')
    })

    $('#confirmPassword').on('change', function (e) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> confirmPassword > onChange <<<<<<<<<<<<<<<<<<<<<<<<<<<')
      //!interactiveFormValidationEnabled ? helper.turnOffSpecificEvents() : null
      $('body').data('elementID', 'password')
      helper.passwordElementValidation('confirmPassword', e.type(), 'password')
    })

    $('#state').on('change', function (e) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> state > onChange <<<<<<<<<<<<<<<<<<<<<<<<<<<')
      helper.selectElementValidation('state')
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    if (!interactiveFormValidationEnabled) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> turnOnSpecificEvents > !interactiveFormValidationEnabled <<<<<<<<<<<<<<<<<<<<<<<<<<<')

      $('#firstname').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> firstname > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.textElementValidation($(this).attr('id'), helper.pattern.basicTextMaxLength)
      })

      $('#lastname').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> lastname > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.textElementValidation($(this).attr('id'), helper.pattern.basicTextMaxLength)
      })

      $('#city').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> city > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.textElementValidation($(this).attr('id'), helper.pattern.basicTextMaxLength)
      })

      $('#email').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> email! > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.emailElementValidation($(this).attr('id'), 'focusout')
      })

      $('#confirmEmail').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> confirmEmail > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.emailElementValidation($(this).attr('id'), 'focusout')
      })

      $('#password').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> password > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.passwordElementValidation($(this).attr('id'), 'focusout')
      })

      $('#confirmPassword').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> confirmPassword > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.passwordElementValidation($(this).attr('id'), 'focusout')
      })

    }

  },


// =================================================================================================================================
// =================================================================================================================================


  emailElementValidation: function (elementID, eType, confirmElementID, elementVal) {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> emailElementValidation <<<<<<<<<<<<<<<<<<<<<<<<<<<')

    if (eType === 'change') {

      helper.validateEmailField(elementVal, elementID, confirmElementID)
    }

    if (eType === 'focusout') {

      $('#' + elementID).on('input', function () {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> emailElementValidation > focusout > onInput <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.testUserInputEmail(elementID)
      })

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> emailElementValidation > focusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
      helper.testUserInputEmail(elementID)
    }
  },

  passwordElementValidation: function (elementID, eType, confirmElementID) {

    if (eType === 'change') {
      if(helper.validateParams('password', 'confirmPassword')){

          is_safari ? $('#'+confirmElementID).off('input') : null;
      }
    }

    if (eType === 'focusout') {

      var pattern = helper.pattern.password

      $('#' + elementID).on('input', function () {
        helper.testUserInput(elementID, pattern)
      })

      helper.testUserInput(elementID, pattern)
    }
  },


  textElementValidation: function (elementID, pattern, err1) {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> textElementValidation 1 <<<<<<<<<<<<<<<<<<<<<<<: ', $('#' + elementID))

    var thisElementValue = $.trim($('#' + elementID).val())
    var title = $('#' + elementID).attr('title')
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    var patternTestValue = pattern.test(thisElementValue)
    err1 !== undefined && err1.lengthError === 'maxlength' ? patternTestValue = false : null

    if (thisElementValue !== '') {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> textElementValidation 2 <<<<<<<<<<<<<<<<<<<<<<<')
      if (!patternTestValue) {
        !interactiveFormValidationEnabled ? $('#' + elementID + 'Error').text('Invalid input. ' + $('#' + elementID).attr('title')) : null
        err1 !== undefined && interactiveFormValidationEnabled ? $('#' + elementID + 'Error').text('Please match the requested format. ' + title) : null

        if ((err1 !== undefined && interactiveFormValidationEnabled) || !interactiveFormValidationEnabled) {
          $('#' + elementID + 'Error').removeClass('hide').addClass('show')
        }

        if (err1 !== undefined && err1.lengthError === 'maxlength') {
          var newVal = helper.validateMaxLengthUserInput($('#' + elementID).val(), err1.stringValLength)
          $('#' + elementID).val(newVal)
        }
      } else {
        !interactiveFormValidationEnabled ? $('#' + elementID + 'Error').text('') : null
        !interactiveFormValidationEnabled ? $('#' + elementID + 'Error').removeClass('show').addClass('hide') : null
        $('#' + elementID).get(0).setCustomValidity('')
      }
    } else {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> textElementValidation 3 <<<<<<<<<<<<<<<<<<<<<<<')
      !interactiveFormValidationEnabled ? $('#' + elementID + 'Error').text('Please fill out this field. ' + $('#' + elementID).attr('title')) : null
      err1 !== undefined && interactiveFormValidationEnabled ? $('#' + elementID + 'Error').text('Please fill out this field.') : null

      if ((err1 !== undefined && interactiveFormValidationEnabled) || !interactiveFormValidationEnabled) {
        $('#' + elementID + 'Error').removeClass('hide').addClass('show')
      }
    }

  },

  selectElementValidation: function (elementID, err1) {
    var thisElementValue = $('#' + elementID).val()
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    if (thisElementValue !== '') {
      if (!interactiveFormValidationEnabled) {
        // ++++
      }

      $('#' + elementID + 'Error').text('')
      $('#' + elementID + 'Error').removeClass('show').addClass('hide')

      interactiveFormValidationEnabled ? $('#' + elementID).get(0).setCustomValidity('') : null
    } else {
      !interactiveFormValidationEnabled ? $('#' + elementID + 'Error').text('Please select an option. ' + $('#' + elementID).attr('title')) : null

      err1 !== undefined && interactiveFormValidationEnabled ? $('#' + elementID + 'Error').text('Please select an item in the list.') : null

      if ((err1 !== undefined && interactiveFormValidationEnabled) || !interactiveFormValidationEnabled) {
        $('#' + elementID + 'Error').removeClass('hide').addClass('show')
      }
    }
  },


// =================================================================================================================================
// =================================================================================================================================


  validateNewUserDataService: function (value, type, resp, cb) {

    var ms = $('body').data('modalShown')
    ms ? $(ms + ' .loading').show() : helper.showLoading()

    var err
    var data = {}

    data['type'] = type
    data['data'] = value
    data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

    console.log('validateNewUserDataService > DATA: ', data)

    $.ajax({

      rejectUnauthorized: false,
      url: 'https://localhost:3000/api/validatenewuserdataservice',
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      accepts: 'application/json',
      async: true,

      success: function (data, status, xhr) {

        if (data.response === 'success') {

          console.log('validateNewUserDataService > SUCCESS > SUCCESS: ', data)
          cb(null, true)
        } else {

          console.log('validateNewUserDataService > SUCCESS > ERROR: ', data)
          cb(data, false)

        }

        ms ? $(ms + ' .loading').hide() : helper.hideLoading()
      },

      error: function (xhr, status, error) {

        console.log('validateNewUserDataService > ERROR > ERROR > xhr: ', xhr)

        var parsedXHR = JSON.parse(xhr.responseText)
        ms ? $(ms + ' .loading').hide() : helper.hideLoading()
        $('#modalAlert .modal-title').html(parsedXHR.err.title)
        $('#modalAlert .alertDanger').html(parsedXHR.err.alert)
        $('#modalAlert #errScrollbox').html(parsedXHR.err.message)
        $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
        $('body').data('doNextModal', 'modalAlert')
        $('#currentUserDataPathModal .cancelButton').trigger('click')
        return false

      }
    })
  },


  validateEmailService: function (email, cb) {

    var data = {}
    data['email'] = $.trim(email)

    $('body').data('modalShown') ? null : helper.showLoading()

    data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

    $.ajax({
      rejectUnauthorized: false,
      url: 'https://localhost:3000/api/userprofile',
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      accepts: 'application/json',
      async: true,

      success: function (data, status, xhr) {
        $('body').data('modalShown') ? null : helper.hideLoading()
        if (data.response === 'success') {
          cb(null)
        } else {
          cb('false')
        }
      },
      error: function (xhr, status, error) {
        $('body').data('modalShown') ? null : helper.hideLoading()
        var parsedXHR = JSON.parse(xhr.responseText)
        $('#modalAlert .modal-title').html(parsedXHR.err.title)
        $('#modalAlert .alertDanger').html(parsedXHR.err.alert)
        $('#modalAlert #errScrollbox').html(parsedXHR.err.message)
        $('#modalAlert .alertDanger').addClass('show').removeClass('hide')
        $('#modalAlert').modal({ keyboard: false,backdrop: 'static' })
        cb('error')
      }
    })
  },


// =================================================================================================================================
// =================================================================================================================================


  testUserInput: function (elementID, pattern, err1) {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> testUserInput <<<<<<<<<<<<<<<<<<<<<<<: ', elementID)

    var thisElementValue = $('#' + elementID).val()
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    var patternTestValue = pattern.test(thisElementValue)
    err1 !== undefined && err1.error === 'invalid' ? patternTestValue = false : null

    var charCount = thisElementValue.length
    err1 !== undefined && err1.stringValLength ? charCount = err1.stringValLength : null

    var errorElement = $('#' + elementID + 'Error')
    var title = $('#' + elementID).attr('title')

    if (thisElementValue === '') {
      !interactiveFormValidationEnabled ? errorElement.text('Please fill out this field. ' + title) : null
      err1 !== undefined && interactiveFormValidationEnabled ? errorElement.text('Please fill out this field.') : null

      if ((err1 !== undefined && interactiveFormValidationEnabled) || !interactiveFormValidationEnabled) {
        errorElement.removeClass('hide').addClass('show')
      }
    } else if (charCount < 4) {
      if (elementID.indexOf('confirm') !== -1) {
        !interactiveFormValidationEnabled ? errorElement.text('Invalid input. ' + title) : null
      } else {
        !interactiveFormValidationEnabled ? errorElement.text('Please enter at least 4 character(s). You entered ' + charCount + '. ' + title) : null
      }

      err1 !== undefined && interactiveFormValidationEnabled ? errorElement.text('Please match the requested format. ' + title) : null

      if ((err1 !== undefined && interactiveFormValidationEnabled) || !interactiveFormValidationEnabled) {
        errorElement.removeClass('hide').addClass('show')
      }
    } else if (charCount >= 4) {
      if (!patternTestValue) {
        !interactiveFormValidationEnabled ? errorElement.text('Invalid input. ' + $('#' + elementID).attr('title')) : null
        err1 !== undefined && interactiveFormValidationEnabled ? errorElement.text('Please match the requested format. ' + title) : null

        if ((err1 !== undefined && interactiveFormValidationEnabled) || !interactiveFormValidationEnabled) {
          errorElement.removeClass('hide').addClass('show')
        }

        if (err1 !== undefined && err1.lengthError === 'maxlength') {
          var newVal = helper.validateMaxLengthUserInput($('#' + elementID).val(), err1.stringValLength)
          $('#' + elementID).val(newVal)
        }
      } else {
        errorElement.text('')
        errorElement.removeClass('show').addClass('hide')

        interactiveFormValidationEnabled ? $('#' + elementID).get(0).setCustomValidity('') : null
        $('#' + elementID).off('input')
      }
    }
  },

  validateEmailValue: function (email) {
    var pattern = helper.pattern.email
    var email2 = $.trim(email)
    return pattern.test(email2)
  },


  validateParams: function (thisField, comparedField, err1) {

    var formConfirmType = $('body').data('whichformdataid')
    var comparedFieldTypeEmail = false
    var c = /confirm/
    var comparedFieldLowercase = comparedField.toLowerCase()
    var comparedFieldIsItConfirm = c.test(comparedFieldLowercase)

    formConfirmType === 'email' ? comparedFieldTypeEmail = true : null

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams thisField VAL: ', $('#' + thisField).val())
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams thisField: ', thisField)
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams comparedField: ', comparedField)
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams formConfirmType: ', formConfirmType)
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams comparedFieldIsItConfirm: ', comparedFieldIsItConfirm)
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams err1: ', err1)
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams comparedFieldTypeEmail: ', comparedFieldTypeEmail)
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams interactiveFormValidationEnabled: ', interactiveFormValidationEnabled)

    if ((err1 !== undefined && (err1.error === 'nomatch' || err1.error === 'match')) || $('#' + comparedField).val() !== '') {

      var property1 = document.getElementsByName(thisField)[0]
      var property2 = document.getElementsByName(comparedField)[0]

      if ((err1 !== undefined && err1.error === 'nomatch') || property1.value !== property2.value) {

        if (!interactiveFormValidationEnabled) {

          if (comparedFieldTypeEmail && !comparedFieldIsItConfirm) {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams 11111')

            $('#' + thisField + 'Match').removeClass('hide').addClass('show').html(helper.elementIDtoTitleCase(formConfirmType) + 's don\'t match')

          } else {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams 222222')

            $('#' + comparedField + 'Match').removeClass('hide').addClass('show').html(helper.elementIDtoTitleCase(formConfirmType) + 's don\'t match')
          }

        } else {

          if (err1 !== undefined) {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams 333333')

            $('#' + comparedField + 'Match').removeClass('hide').addClass('show').html(helper.elementIDtoTitleCase(formConfirmType) + 's don\'t match')

          } else {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams 444444')

            $('#' + comparedField).get(0).setCustomValidity(helper.elementIDtoTitleCase(formConfirmType) + 's don\'t match')

          }
        }
        return false

      } else {

        if (!interactiveFormValidationEnabled) {

          if (comparedFieldTypeEmail && !comparedFieldIsItConfirm) {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams 55555')

            $('#' + thisField + 'Match').removeClass('show').addClass('hide')

          } else {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams 666666')

            $('#' + comparedField + 'Match').removeClass('show').addClass('hide')

          }

        } else {

          if (err1 === undefined) {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams 77777')

            $('#' + thisField).get(0).setCustomValidity('')
            $('#' + comparedField).get(0).setCustomValidity('')

          } else {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams 8888')

            $('#' + comparedField + 'Match').removeClass('show').addClass('hide')

          }
        }
        return true
        /*
        if (comparedFieldTypeEmail) {

          var valdata = $('body').data('validatedData')
          var v

          if (valdata) {
            Object.keys(valdata).forEach(function (p) {
              if (p !== 'email' || p !== 'confirmEmail') {
                if (valdata[p].error === 'match' || valdata[p].error === false) {
                  v = true
                }
              }
            })

            v === true ? $('#signUpForm').submit() : null
          }
        }
        */

      }
    }
  },


  testUserInputEmail: function (elementID, err1) {

    var thisElementValue = $('#' + elementID).val()
    var thisErrorElement = $('#' + elementID + 'Error')
    var title = $('#' + elementID).attr('title')
    var isEmailValid

    err1 === undefined ? isEmailValid = helper.validateEmailValue(thisElementValue) : null

    if ((err1 !== undefined && (err1.error === 'false' || err1.error === 'match')) || (err1 === undefined && isEmailValid)) {

      err1 !== undefined || !interactiveFormValidationEnabled ? thisErrorElement.text('') : null
      err1 !== undefined || !interactiveFormValidationEnabled ? thisErrorElement.removeClass('show').addClass('hide') : null
      $('#' + elementID).off('input')

    } else if ((err1 !== undefined && err1.error === 'empty') || thisElementValue === '') {

      err1 !== undefined || !interactiveFormValidationEnabled ? thisErrorElement.text('Please fill out this field. ' + title) : null
      err1 !== undefined || !interactiveFormValidationEnabled ? thisErrorElement.removeClass('hide').addClass('show') : null

    } else if ((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)) {

      err1 !== undefined || !interactiveFormValidationEnabled ? thisErrorElement.text('Please enter an email address. ' + title) : null
      err1 !== undefined || !interactiveFormValidationEnabled ? thisErrorElement.removeClass('hide').addClass('show') : null

    }
  },


  validateEmailField: function (elementVal, thisField, comparedField, err1) {

    var isEmailValid
    err1 === undefined || err1.error === 'false' ? isEmailValid = helper.validateEmailValue(elementVal) : null

        // EMAIL IS VALID +++++++++++++++++++
    if ((err1 !== undefined && (err1.error !== 'invalid' && err1.error !== 'empty')) || isEmailValid) {
      err1 !== undefined || isSafari ? $('#' + thisField + 'Improper').removeClass('show').addClass('hide') : null
      !isSafari ? $('#' + thisField).get(0).setCustomValidity('') : null
      $('#' + thisField).off('input')

      if (isEmailValid) {

        helper.validateEmailService(elementVal, function (err, response) {

          if (err === 'false') {

            isSafari ? $('#' + thisField + 'Registered').removeClass('hide').addClass('show') : null
            !isSafari ? $('#' + thisField).get(0).setCustomValidity('This email address is already in our system. Sign in, or enter a new email address') : null
            err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null

          } else if (err === 'error') {

            isSafari ? $('#' + thisField + 'Registered').removeClass('hide').addClass('show') : null
            !isSafari ? $('#' + thisField).get(0).setCustomValidity('An error occurred, please enter email again') : null
            err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null

          } else {

            isSafari ? $('#' + thisField + 'Registered').removeClass('show').addClass('hide') : null
            helper.validateParams(thisField, comparedField)
            err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null
          }
        })

      } else {
        if (err1 !== undefined && err1.error === 'registered') {
          $('#' + thisField + 'Registered').removeClass('hide').addClass('show')
        } else {
          helper.validateParams(thisField, comparedField, err1)
        }
        err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null
      }

        // EMAIL IS NOT VALID +++++++++++++++++++
    } else if ((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)) {
      if (err1 !== undefined || isSafari) {
        $('#' + thisField + 'Registered').removeClass('show').addClass('hide')
        $('#' + thisField + 'Improper').removeClass('hide').addClass('show')
      } else {
        $('#' + thisField).get(0).setCustomValidity(helper.elementIDtoTitleCase(thisField) + ' is in improper format')
      }

      $('#' + thisField).focus()

      err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null
    } else if (err1 !== undefined && err1.error === 'empty') {
      helper.testUserInputEmail(thisField, err1)
    }
  },


  // =================================================================================================================================
  // =================================================================================================================================
  // =================================================================================================================================
  // =================================================================================================================================
  // =================================================================================================================================
  // =================================================================================================================================


  toggleEditBtn: function(whichTabs,displayTab) {
    var tabID, i, e
    tabID = document.getElementsByClassName(whichTabs)

    for(i=0; i < tabID.length; i++) {
        e = tabID[i]
        if(displayTab){
            e.style.display = 'none'
        }else{
            if(e.style.display == 'none') {
                e.style.display = 'inline'
            } else {
                e.style.display = 'none'
            }
        }
    }
    if(e.style.display === 'inline'){
        whichTabs === 'accountInfo' ? $('#updateAccountBtn').text('Done') : null
        whichTabs === 'personalInfo' ? $('#updatePersonalBtn').text('Done') : null
    }
    if(e.style.display === 'none'){
        whichTabs === 'accountInfo' ? $('#updateAccountBtn').text('Update Account info') : null
        whichTabs === 'personalInfo' ? $('#updatePersonalBtn').text('Update Personal info') : null
    }
  },


  doEditProfileModal: function(editBtnClicked) {
    var editBtnClickedParentElem = $(editBtnClicked).parent()
    var dataID = editBtnClickedParentElem.data('id')

    console.log('doEditProfileModal > editBtnClicked dataID +++++++: ', dataID)

    var elementID = dataID.replace(/-/g, '')
    var previousElementID

    $('#editProfileForm').data('elementID', elementID)
    $('#editProfileForm .form-group .error').attr('id', elementID+'Error')

    var currentFormType = editBtnClickedParentElem.data('formelementtype')
    var labelText = helper.makeTitleFromElementID(dataID)
    var currentFormValue = $('.'+dataID).text()
    currentFormValue = $.trim(currentFormValue)

    console.log('doEditProfileModal > dataID: ', dataID)
    console.log('doEditProfileModal > currentFormType: ', currentFormType)
    console.log('doEditProfileModal > labelText: ', labelText)
    console.log('doEditProfileModal > currentFormValue: ', currentFormValue)

    $('#editProfileInputElementParent').removeClass('show').addClass('hide')
    $('#editProfileSelectElementParent').removeClass('show').addClass('hide')

    var previousElementID = $('#editProfileForm').data('previousElementID')

    if(elementID === 'state'){

        $('#editProfileForm .form-group select').attr('id', elementID)
        $('#editProfileSelectElementParent').removeClass('hide').addClass('show')
        $('#state').find('[option]').focus()

        $('#'+elementID).attr('required', true)
        previousElementID !== undefined && previousElementID !== elementID ? $('#'+previousElementID).attr('required', false) : null

        console.log('doEditProfileModal > STATE > elementID: ', $('#'+elementID))

    }else{

        $('#editProfileForm .form-group input').attr('id', elementID)
        $('#editProfileInputElementParent').removeClass('hide').addClass('show')

        $('#'+elementID).attr('required', true)
        previousElementID !== undefined && previousElementID !== elementID ? $('#'+previousElementID).attr('required', false) : null

        console.log('doEditProfileModal > INPUT elementID: ', $('#'+elementID))

        switch (dataID) {

          case 'first-name':
              $('#firstname').attr({ 
                  type: 'text',
                  pattern: '\\s*^(?=\\s*\\S)(.{1,35})$\\s*',
                  title: 'Please type a valid First Name. Maximum 35 characters',
                  placeholder: 'First Name'
              })
              break

          case 'last-name':
              $('#lastname').attr({ 
                  type: 'text',
                  pattern: '\\s*^(?=\\s*\\S)(.{1,35})$\\s*',
                  title: 'Please type a valid Last Name. Maximum 35 characters',
                  placeholder: 'Last Name'
              })
              break

          case 'city':
              $('#city').attr({ 
                  type: 'text',
                  pattern: '\\s*^(?=\\s*\\S)(.{1,35})$\\s*',
                  title: 'Please type a valid City. Maximum 35 characters',
                  placeholder: 'City'
              })
              break

        }
    }

    $('#editProfileForm').data('previousElementID', elementID)
    $('#editProfileFormLabelCurrent').html('Current ' + labelText + ':')
    $('#editProfileFormLabelUpdated').html('Change your ' + labelText + ':')
    $('#modalFormElementValueCurrent').html(currentFormValue)
    $('body').data('whichformdataid', dataID)

    helper.turnOnSpecificEvents()

    $('#editProfileFormModal').modal({
      keyboard: false,
      backdrop: 'static'
    })
  },


  doUserDataPathChange: function(editBtnClicked) {

    console.log('doUserDataPathChange +++++++++++++++1')

    var editBtnClickedParentElem = $(editBtnClicked).parent()
    var dataID = editBtnClickedParentElem.data('id')
    var labelText = helper.makeTitleFromElementID(dataID)

    $('body').data('whichformdataid', dataID)

    dataID === 'email' ? labelText = labelText + ' Address' : null
    $('body').data('elementID', dataID)
    $('#currentUserDataPathModal').removeData('currentUserEmailVerified')

    console.log('doUserDataPathChange +++++++++++++++2 ', labelText)
    console.log('doUserDataPathChange +++++++++++++++3 ', dataID)

    $('#currentUserDataPath').attr({
        type: 'text',
        pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
        title: 'Please enter a valid Email Address',
        placeholder: 'Current Email Address'
    })

    $('#currentUserDataPathModal .modal-title').html('Change your ' + labelText + ':')
    $('#currentUserDataPathLabel').html('Please Enter Your Current Email Address:')

    $('#currentUserDataPathRegistered').removeClass('show').addClass('hide').html('')
    $('#currentUserDataPath').removeClass('has-error')
    $('#currentUserDataPathError').removeClass('show').addClass('hide')
    $('#currentUserDataPathModal .modalAlertWarning .alert').html('')
    $('#currentUserDataPathModal .modalAlertWarning').removeClass('show').addClass('hide')
    $('body').removeData('doNextModal')

    $('#currentUserDataPathModal').modal({
      keyboard: false,
      backdrop: 'static'
    })

  },


  handleErrorResponse: function(data) {

    // {email: {error: "empty"}, confirmEmail: {error: "registered"}, newUserDataItem: true}
    console.log('### handleErrorResponse +++++++++++ ', data)

    var newUserDataItem
    var q
    var cq

    for (var k in data) {
      if(k === 'newUserDataItem'){
        newUserDataItem = true
        break
      }
    }

    //helper.turnOnSpecificEvents()

    Object.keys(data).forEach(function(p) {

      switch (p) {

        case 'email':
          helper.validateEmailField(null, 'email', 'confirmEmail', data[p])
          break

        case 'confirmEmail':
          helper.validateEmailField(null, 'confirmEmail', 'email', data[p])
          break

        case 'password':
          if (helper.validateParams('password', 'confirmPassword', data[p])) {
            $('#confirmPassword').off('input')
          }
          helper.testUserInput(p, helper.pattern.password, data[p])
          break

        case 'confirmPassword':
          if (helper.validateParams('password', 'confirmPassword', data[p])) {
            $('#password').off('input')
          }
          helper.testUserInput(p, helper.pattern.password, data[p])
          break

        case 'firstname':
        case 'lastname':
        case 'city':
          helper.textElementValidation(p, helper.pattern.basicTextMaxLength, data[p])
          break

        case 'state':
          helper.selectElementValidation(p, data[p])
          break

      }
    })
  }

}

$(function () {
    helper.init()
})
