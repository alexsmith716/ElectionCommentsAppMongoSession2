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

    helper.initializeJqueryEvents()
  },

  testFormValidity: function (theForm, eventListener) {

    var boundEventTypes
    var formElement
    var checkConstraints
    var formValid = null
    var resp = {}

    for( var i = 0; i < theForm.length; i++ ) {

      formElement = $(theForm[i])
      checkConstraints = formElement.get(0).checkValidity()

      //console.log('### testFormValidity > formElement +++++++++++: ', formElement)
      //console.log('### testFormValidity > formElement.validity +++++++++++: ', formElement.validity)
      //console.log('### testFormValidity > checkConstraints ++++++++++++++++++ ', checkConstraints)

      if(!checkConstraints && formValid === null){
        formValid = false
        resp.formValid = false
        resp.focusFirstElement = formElement
        break
      }

      if(eventListener === 'change'){
        boundEventTypes = $._data( formElement[0], 'events' );
        for (var eType in boundEventTypes){
          helper.handleFormEvents(formElement.attr('id'), eType, formElement.val())
        }
      }
      
      if(eventListener === 'focusout'){
        formElement.on('focusout', function(e) {
          helper.handleFormEvents(formElement.attr('id'), 'focusout', formElement.val());
        })
        formElement.trigger('focusout')
      }
    }
    return resp
  },


  initializeJqueryEvents:  function(){

    $('#editProfileFormModal').on('shown.bs.modal', function() {
      $('body').data('modalShown', '#editProfileFormModal')
      var activeElementID = $('body').data('elementID')
      $('#'+activeElementID).focus()
    })

    $('#editProfileFormModal').on('hidden.bs.modal', function () {
      $('body').removeData('modalShown');
      var activeElementID = $('body').data('elementID')
      $('#editProfileForm').get(0).reset()
      $('#editProfileForm').find('.error').removeClass('show ').addClass('hide')
      $('#'+activeElementID+'Error').removeClass('show').html('')
      $('#'+activeElementID).removeClass('has-error')
      $('.modalAlertSuccess').hide()
      $('.modalAlertDanger').hide()
      $('.modalOkayBtn').hide()
      $('.modalCancelSubmitBtns').show()
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#currentUserDataPathModal').on('shown.bs.modal', function () {
      $('body').data('modalShown', '#currentUserDataPathModal')
    })

    $('#currentUserDataPathModal').on('hidden.bs.modal', function () {
      helper.resetNewUserDataItemModals()
      var doNextModal = $('body').data('doNextModal')
      $('body').removeData('doNextModal')

      if(doNextModal){
      //setTimeout(function () {
        $('#'+doNextModal).modal({
          keyboard: false,
          backdrop: 'static'
        })
      //}, 100)
      }
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#userDataEmailPathChangeModal').on('shown.bs.modal', function() {
      $('body').data('modalShown', '#userDataEmailPathChangeModal')
    })

    $('#userDataEmailPathChangeModal').on('hidden.bs.modal', function () {
      helper.resetNewUserDataItemModals()
      var doNextModal = $('body').data('doNextModal')
      $('body').removeData('doNextModal')

      if(doNextModal){
      //setTimeout(function () {
        $('#'+doNextModal).modal({
          keyboard: false,
          backdrop: 'static'
        })
      //}, 100)
      }
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#userDataPasswordPathChangeModal').on('shown.bs.modal', function() {
      $('body').data('modalShown', '#userDataPasswordPathChangeModal')
    })

    $('#userDataPasswordPathChangeModal').on('hidden.bs.modal', function () {
      helper.resetNewUserDataItemModals()
      var doNextModal = $('body').data('doNextModal')
      $('body').removeData('doNextModal')

      if(doNextModal){
      //setTimeout(function () {
        $('#'+doNextModal).modal({
          keyboard: false,
          backdrop: 'static'
        })
      //}, 100)
      }
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

      $('#editProfileForm .formerror').removeClass('show').addClass('hide')

      var elementID = $('#editProfileForm').data('elementID')
      var whichformdataid = $('body').data('whichformdataid')
      var labelText = helper.makeTitleFromElementID(whichformdataid)
      var newVal;
      var s = document.getElementById(elementID)
      elementID === 'state' ? newVal = s.options[s.selectedIndex].text : newVal = $('#'+elementID).val()
      newVal = $.trim(newVal)

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
            $('#editProfileFormModal').modal('hide')
            $('#editProfileModalAlert .alertSuccess').html('You\'re '+labelText+' has been successfully changed!')
            $('#editProfileModalAlert .alertSuccess').addClass('show').removeClass('hide')
            $('#editProfileModalAlert').modal('show')
            $('.'+whichformdataid).text(newVal)

          } else {

            if(data.validatedData){

              console.log('#editProfileForm > ajax > SUCCESS > ERROR > validatedData: ', data.validatedData)
              helper.handleErrorResponse(data.validatedData)

            }else{

              console.log('#editProfileForm > ajax > SUCCESS > ERROR')
              $('#editProfileForm .formerror').removeClass('hide').addClass('show')

            }

            $('.loading').hide()
            return false
          }

        },

        error: function(xhr, status, error) {

          console.log('#editProfileForm > ajax > ERROR > ERROR: ', xhr)

          var parsedXHR = JSON.parse(xhr.responseText)

          location.href = parsedXHR.redirect

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

            $('.loading').hide()
            //$('#userDataEmailPathChangeModal').modal('hide')
            $('#userDataEmailPathChangeModal .cancelButton').trigger('click')
            $('#editProfileModalAlert .alertSuccess').html('You\'re Email has been successfully changed!')
            $('#editProfileModalAlert .alertSuccess').addClass('show').removeClass('hide')
            $('#editProfileModalAlert').modal('show')
            $('.'+whichformdataid).text(newVal)

          } else {

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
              $('#userDataEmailPathChangeForm .formerror').removeClass('hide').addClass('show')
              
            }

            $('.loading').hide()
            return false
          }

        },

        error: function(xhr, status, error) {

          console.log('>>>>>>>>>> userDataEmailPathChangeForm > ajax > ERROR > ERROR <<<<<<<<<<: ', xhr)

          var parsedXHR = JSON.parse(xhr.responseText)

          location.href = parsedXHR.redirect

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

            $('.loading').hide()
            //$('#userDataPasswordPathChangeModal').modal('hide')
            $('#userDataPasswordPathChangeForm .cancelButton').trigger('click')
            $('#editProfileModalAlert .alertSuccess').html('You\'re Password has been successfully changed!')
            $('#editProfileModalAlert .alertSuccess').addClass('show').removeClass('hide')
            $('#editProfileModalAlert').modal('show')

          } else {

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
              $('#userDataPasswordPathChangeForm .cancelButton').trigger('click')
 
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
              $('#userDataPasswordPathChangeForm .formerror').removeClass('hide').addClass('show')
              
            }

            $('.loading').hide()
            return false
          }

        },

        error: function(xhr, status, error) {

          var parsedXHR = JSON.parse(xhr.responseText)

          location.href = parsedXHR.redirect

          return false

        }
      })
    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    $('body').on('mousedown', function (e) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> BODY > MOUSEDOWN <<<<<<<<<<<<<<<<<<<<<<')

      var activeElement = $(document.activeElement)

      if ($(e.target).hasClass('submit')) {
        if (activeElement.is( 'INPUT' )) {
          // $('body').data('activeElement', activeElement.attr('id'))
        }
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> BODY > SUBMIT > MOUSEDOWN <<<<<<<<<<<<<<<<<<<<?: ', $('body').data('activeElement'))
      }

      if (e.target.id === 'newUserDataItemModalCancel' || e.target.id === 'editProfileFormModalCancel') {
        helper.turnOffSpecificEvents()
      }

    })

    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    $('#currentUserDataPathModal .nextButton').on('click', function(e) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>> currentUserDataPathModal .nextButton <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

      var type = $('body').data('elementID')
      var currentUserEmailVerified = $('#currentUserDataPathModal').data('currentUserEmailVerified')
      var data = $('#currentUserDataPath').val()
      var testData = helper.pattern.basictext.test(data)

      if (testData) {

        if (currentUserEmailVerified !== true) {

          helper.validateNewUserDataService(data, 'email', 'true', function (err, response) {

            if (err) {

              $('#currentUserDataPath').addClass('has-error')
              $('#currentUserDataPathError').removeClass('show').addClass('hide')
              $('#currentUserDataPathRegistered').removeClass('hide').addClass('show').html('Please Enter Your '+$('#currentUserDataPath').attr('placeholder'))

            } else {

              $('#currentUserDataPath').removeClass('has-error')
              $('#currentUserDataPathError').removeClass('show').addClass('hide')
              $('#currentUserDataPathRegistered').removeClass('show').addClass('hide')

              if(type === 'email'){

                helper.turnOnSpecificEvents()

                $('body').data('doNextModal', 'userDataEmailPathChangeModal')
                $('#currentUserDataPathModal .cancelButton').trigger('click')

              }

              if(type === 'password'){

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

            helper.validateNewUserDataService(data, type, 'true', function (err, response) {

              if (err) {

                if(err.alertDanger){

                  $('#currentUserDataPath').val('')
                  $('#currentUserDataPathModal').removeData('currentUserEmailVerified')
                  $('#currentUserDataPathModal .modalAlertWarning .alert').html(err.alertDanger);
                  $('#currentUserDataPathModal .modalAlertWarning').show();

                  $('#currentUserDataPathLabel').html('Please Enter Your Current Email Address:')

                  $('#currentUserDataPath').attr({
                      type: 'text',
                      pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
                      title: 'Please enter a valid Email Address',
                      placeholder: 'Current Email Address'
                  })

                }else{

                  $('#currentUserDataPath').addClass('has-error')
                  $('#currentUserDataPathError').removeClass('show').addClass('hide')
                  $('#currentUserDataPathRegistered').removeClass('hide').addClass('show').html('Please Enter Your '+$('#currentUserDataPath').attr('placeholder'))

                }

              } else {

                $('#currentUserDataPath').removeClass('has-error')
                $('#currentUserDataPathError').removeClass('show').addClass('hide')
                $('#currentUserDataPathRegistered').removeClass('show').addClass('hide')
                
                $('#currentUserDataPathModal').data('currentUserEmailVerified', true)

                helper.turnOnSpecificEvents()

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

  resetNewUserDataItemModals: function () {
    $('body').removeData('modalShown')

    $('#currentUserDataPath').val('')
    $('#currentUserDataPath').removeClass('has-error')
    $('#currentUserDataPathModal .modalAlertWarning .alert').html('')
    $('#currentUserDataPathModal .modalAlertWarning').hide()
    $('#currentUserDataPathModal').find('.error').removeClass('show').addClass('hide')
    $('#currentUserDataPathRegistered').html('')

    $('#userDataEmailPathChangeForm').get(0).reset()
    $('#userDataEmailPathChangeModal .modalAlertWarning .alert').html('')
    $('#userDataEmailPathChangeModal .modalAlertWarning').hide()
    $('#userDataEmailPathChangeModal input').removeClass('has-error')
    $('#userDataEmailPathChangeModal').find('.error').removeClass('show').addClass('hide')

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
      //!interactiveFormValidationEnabled ? helper.turnOffSpecificEvents() : null
      $('body').data('elementID', 'email')
      helper.handleFormEvents($(this).attr('id'), e.type, $(this).val())
    })

    $('#confirmEmail').on('change', function (e) {
      //!interactiveFormValidationEnabled ? helper.turnOffSpecificEvents() : null
      $('body').data('elementID', 'email')
      helper.handleFormEvents($(this).attr('id'), e.type, $(this).val())
    })

    $('#password').on('change', function (e) {
      //!interactiveFormValidationEnabled ? helper.turnOffSpecificEvents() : nul
      $('body').data('elementID', 'password')
      helper.handleFormEvents($(this).attr('id'), e.type, $(this).val())
    })

    $('#confirmPassword').on('change', function (e) {
      //!interactiveFormValidationEnabled ? helper.turnOffSpecificEvents() : null
      $('body').data('elementID', 'password')
      helper.handleFormEvents($(this).attr('id'), e.type, $(this).val())
    })

    $('#firstname').on('change', function (e) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> firstname > !!!!!!!! 1 <<<<<<<<<<<<<<<<<<<<<<<<<<<: ')
      var fooob = document.getElementById('firstname')
      // if( helper.handleFormEvents($(this).attr('id'), e.type) ){helper.textElementValidation(elementID, helper.pattern.basictext)
      if( helper.textElementValidation($(this).attr('id'), helper.pattern.basictext) ){
        if (fooob.validity.valid) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> firstname > !!!!!!!! 2aaaaa <<<<<<<<<<<<<<<<<<<<<<<<<<<: ')
        } else {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> firstname > !!!!!!!! 2bbbbbbbb <<<<<<<<<<<<<<<<<<<<<<<<<<<: ')
        }
        //return true
      } else {
        if (fooob.validity.valid) {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> firstname > !!!!!!!! 3aaaaa <<<<<<<<<<<<<<<<<<<<<<<<<<<: ')
          return false
        } else {
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> firstname > !!!!!!!! 3bbbbbbbb <<<<<<<<<<<<<<<<<<<<<<<<<<<: ')
        }
        //return true
      }
      
    })

    if (!interactiveFormValidationEnabled) {

      $('#firstname').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> firstname > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.handleFormEvents($(this).attr('id'), e.type)
      })

      $('#lastname').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> lastname > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.handleFormEvents($(this).attr('id'), e.type)
      })

      $('#city').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> city > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.handleFormEvents($(this).attr('id'), e.type)
      })

      $('#email').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> email > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.handleFormEvents($(this).attr('id'), e.type)
      })

      $('#confirmEmail').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> confirmEmail > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.handleFormEvents($(this).attr('id'), e.type)
      })

      $('#password').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> password > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.handleFormEvents($(this).attr('id'), e.type)
      })

      $('#confirmPassword').on('focusout', function (e) {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> confirmPassword > onFocusout <<<<<<<<<<<<<<<<<<<<<<<<<<<')
        helper.handleFormEvents($(this).attr('id'), e.type)
      })

    }

  },

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  validateNewUserDataService: function (value, type, resp, callback) {

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

          console.log('validateNewUserDataService > SUCCESS: ', data)
          callback(null, true)

        } else {

          console.log('validateNewUserDataService > SUCCESS > ERROR: ', data)
          callback(data, false)
        }

        ms ? $(ms + ' .loading').hide() : helper.hideLoading()

      },

      error: function (xhr, status, error) {

        console.log('validateNewUserDataService > ERROR: ', xhr)
        var parsedXHR = JSON.parse(xhr.responseText)

        location.href = parsedXHR.redirect
      }
    })
  },


  validateEmailService: function (email, callback) {

    var data = {}
    var pathName = 'email'
    var err
    data[pathName] = $.trim(email)
    pathName = 'expectedResponse'
    data[pathName] = 'false'

    $('body').data('modalShown') ? null : helper.showLoading()

    data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

    $.ajax({
      rejectUnauthorized: false,
      url: 'https://localhost:3000/api/evaluateuseremail',
      type: 'POST',
      data: JSON.stringify(data),
      dataType: 'json',
      contentType: 'application/json; charset=utf-8',
      accepts: 'application/json',
      async: true,

      success: function (data, status, xhr) {
        if (data.response === 'success') {
          callback(null, true)
        } else {
          err = new Error('error')
          callback(err, false)
        }

        $('body').data('modalShown') ? null : helper.hideLoading()
      },

      error: function (xhr, status, error) {
        var parsedXHR = JSON.parse(xhr.responseText)

        location.href = parsedXHR.redirect
      }
    })
  },


// =================================================================================================================================
// =================================================================================================================================

  handleFormEvents: function(elementID, eType, elementVal) {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> handleFormEvents <<<<<<<<<<<<<<<<<<<<<<<: ', elementID, ' :: ', eType)

    elementID === 'displayname' ? helper.displaynameElementValidation(elementID) : null

    elementID === 'email' ? helper.emailElementValidation(elementID, 'confirmEmail', eType, elementVal) : null
    elementID === 'confirmEmail' ? helper.emailElementValidation(elementID, 'email', eType, elementVal) : null

    elementID === 'password' ? helper.passwordElementValidation(elementID, 'confirmPassword', eType) : null
    elementID === 'confirmPassword' ? helper.passwordElementValidation(elementID, 'password', eType) : null

    elementID === 'firstname' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null
    elementID === 'lastname' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null
    elementID === 'city' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null
    elementID === 'state' ? helper.selectElementValidation(elementID) : null
  },

  makeTitleFromElementID: function(whichID) {
      whichID = whichID.replace(/-/g, ' ')
      labelText = whichID.replace(/\b\w/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();})
      return labelText
  },

// =================================================================================================================================
// =================================================================================================================================

  pattern: {
    displayname: /^[A-Za-z0-9_]{4,21}$/,
    email: /^\S+@\S+\.\S+/,
    password: /^\S{4,}$/,
    password2: /^[\S]{4,}$/,
    basictextMaxLength: /^(?=\s*\S)(.{1,35})$/,
    basictext: /^(?=\s*\S)(.{1,})$/
  },

  showLoading: function () {
    $('.modal-backdrop').show()
  },

  hideLoading: function () {
    $('.modal-backdrop').hide()
  },

  emailElementValidation: function (elementID, confirmElementID, eType, elementVal) {

    if (eType === 'change') {

      helper.validateEmailField(elementVal, elementID, confirmElementID)
    }

    if (eType === 'focusout') {

      $('#' + elementID).on('input', function () {
        helper.testUserInputEmail(elementID)
      })

      helper.testUserInputEmail(elementID)
    }
  },

  passwordElementValidation: function (elementID, comparedElementID, eType) {

    var c = /confirm/
    var newElement
    var confirmNewElement
    c.test(comparedElementID) ? confirmNewElement = comparedElementID : confirmNewElement = elementID
    !c.test(comparedElementID) ? newElement = comparedElementID : newElement = elementID

    if (eType === 'change') {

      if (helper.validateParams(newElement, confirmNewElement)) {

        !interactiveFormValidationEnabled ? $('#' + comparedElementID).off('input') : null

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


  testUserInput: function (elementID, pattern, err1) {
    console.log('#testUserInput > no err1: ', elementID, ' :: ', pattern);

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

    var formConfirmType = $('body').data('whichformdataid')
    var isEmailValid

    console.log('>>>>>>>>>>>>>>>>>>>>> validateEmailField 0 <<<<<<<<<<<<<<<<<<<<<<<: ', thisField)
    console.log('>>>>>>>>>>>>>>>>>>>>> validateEmailField 00 <<<<<<<<<<<<<<<<<<<<<<<: ', comparedField)
    console.log('>>>>>>>>>>>>>>>>>>>>> validateEmailField 000 <<<<<<<<<<<<<<<<<<<<<<<: ', formConfirmType)

    err1 === undefined || err1.error === 'false' ? isEmailValid = helper.validateEmailValue(elementVal) : null

    // EMAIL IS VALID +++++++++++++++++++
    if ((err1 !== undefined && (err1.error !== 'invalid' && err1.error !== 'empty')) || isEmailValid) {

      // +++++++++++++++++++++++++++++++++++++
      err1 !== undefined || !interactiveFormValidationEnabled ? $('#' + thisField + 'Improper').removeClass('show').addClass('hide') : null
      interactiveFormValidationEnabled ? $('#' + thisField).get(0).setCustomValidity('') : null
      $('#' + thisField).off('input')
      // +++++++++++++++++++++++++++++++++++++

      if (isEmailValid) {

        helper.validateEmailService(elementVal, function (err, response) {

          if (err) {

            !interactiveFormValidationEnabled ? $('#' + thisField + 'Registered').removeClass('hide').addClass('show') : null
            interactiveFormValidationEnabled ? $('#' + thisField).get(0).setCustomValidity('This email address is already in our system. Sign in, or enter a new email address') : null

            err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null
            return false

          } else {

            !interactiveFormValidationEnabled ? $('#' + thisField + 'Registered').removeClass('show').addClass('hide') : null

            if (helper.validateParams(thisField, comparedField)) {
              return true
            } else {
              return false
            }

            err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null

          }
        })

      } else {

        if (err1 !== undefined && err1.error === 'registered') {

          $('#' + thisField + 'Registered').removeClass('hide').addClass('show')
          return false

        } else {

          if (helper.validateParams(thisField, comparedField, err1)) {
            return true
          } else {
            return false
          }

        }
        err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null

      }

    // EMAIL IS NOT VALID +++++++++++++++++++
    } else if ((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)) {

      if (err1 !== undefined || !interactiveFormValidationEnabled) {

        $('#' + thisField + 'Registered').removeClass('show').addClass('hide')
        $('#' + thisField + 'Improper').removeClass('hide').addClass('show')
        return false

      } else {

        $('#' + thisField).get(0).setCustomValidity(helper.elementIDtoTitleCase(thisField) + ' is in improper format')
        return false
      }

      err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null

    } else if (err1 !== undefined && err1.error === 'empty') {

      helper.testUserInputEmail(thisField, err1)

    }
  },



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
                  pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                  title: 'Please type a valid First Name. Maximum 35 characters',
                  placeholder: 'First Name',
                  required: true
              })
              break

          case 'last-name':
              $('#lastname').attr({ 
                  type: 'text',
                  pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                  title: 'Please type a valid Last Name. Maximum 35 characters',
                  placeholder: 'Last Name',
                  required: true
              })
              break

          case 'city':
              $('#city').attr({ 
                  type: 'text',
                  pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                  title: 'Please type a valid City. Maximum 35 characters',
                  placeholder: 'City',
                  required: true
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

    helper.turnOnSpecificEvents()

    Object.keys(data).forEach(function(p) {

      switch (p) {

        case 'email':

          newUserDataItem ? p = 'newUserDataItem' : null
          newUserDataItem ? q = 'confirmNewUserDataItem' : q = 'confirmEmail'

          helper.validateEmailField(null, p, q, data['email'])
          break

        case 'confirmEmail':

          newUserDataItem ? p = 'confirmNewUserDataItem' : null
          newUserDataItem ? q = 'newUserDataItem' : q = 'email'

          helper.validateEmailField(null, p, q, data['confirmEmail'])
          break

        case 'password':

          newUserDataItem ? p = 'newUserDataItem' : null
          newUserDataItem ? q = 'confirmNewUserDataItem' : q = 'confirmPassword'

          if (helper.validateParams(p, p, data['password'])) {
            $('#'+q).off('input')
          }

          helper.testUserInput(p, helper.pattern.password, data['password'])
          break

        case 'confirmPassword':

          newUserDataItem ? p = 'confirmNewUserDataItem' : null
          newUserDataItem ? q = 'newUserDataItem' : q = 'password'

          if (helper.validateParams(p, p, data['confirmPassword'])) {
            $('#'+q).off('input')
          }

          helper.testUserInput(p, helper.pattern.password, data['confirmPassword'])
          break

        case 'firstname':
        case 'lastname':
        case 'city':

          console.log('### handleErrorResponse: ', p, ' :: ', data[p])
          helper.textElementValidation(p, helper.pattern.basictext, data[p])
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
