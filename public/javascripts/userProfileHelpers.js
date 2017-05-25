/* global $ */
/* global isSafari */
/* global location */
var helper = {

  init: function() {
    helper.showLoading()

    $('#state').attr('required', false)

    setTimeout(function () { helper.hideLoading() }, 500)

    console.log('### userProfileHelpers > interactiveFormValidationEnabled: ', interactiveFormValidationEnabled)

    helper.initializeJqueryEvents()
  },

  testFormValidity: function (theForm, eventListener) {

    console.log('### testFormValidity > interactiveFormValidationEnabled: ', theForm)

    var boundEventTypes
    var formElement
    var checkConstraints
    var formValid = null
    var resp = {}

    // checkValidity method on form element returns true if element has valid data (according to constraint(s))
    // safari 10.1
    // webkit 603.1.30
    for( var i = 0; i < theForm.length; i++ ) {

      formElement = $(theForm[i])
      checkConstraints = formElement.get(0).checkValidity()

      if(!checkConstraints && formValid === null){
        formValid = false
        resp.formValid = false
        resp.focusFirstElement = formElement
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

    // $('#aModal').hasClass('in')
    $('#editProfileFormModal').on('shown.bs.modal', function() {
      $('body').data('modalShown', '#editProfileFormModal')
      var activeElementID = $('#editProfileForm').data('elementID')
      $('#'+activeElementID).focus()
    })

    $('#editProfileFormModal').on('hidden.bs.modal', function () {
      $('body').removeData('modalShown');
      var activeElementID = $('#editProfileForm').data('elementID')
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

    $('#newUserDataItemModal').on('shown.bs.modal', function() {
      $('body').data('modalShown', '#newUserDataItemModal')
      var evts = $._data( $('#currentUserDataItem').get(0), 'events' )
      // console.log('#newUserDataItemModal > shown.bs.modal evts: ', evts)
      $.each( evts, function(i,exists) {
        // console.log('#newUserDataItemModal > shown.bs.modal evts i: ', i, ' :: ', exists)
      })
      setTimeout(function() {
        // isSafari ? helper.handleSpecificEvents() : null
      }, 150)
    })


    $('#newUserDataItemModal').on('hidden.bs.modal', function () {
      setTimeout(function() {
        helper.resetNewUserDataItemModal()
      }, 150)
    })


    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    $('#editProfileForm').on('submit', function(e) {

      console.log('#editProfileForm > SUBMIT +++')

      e.preventDefault()
      $('.loading').show()

      $('#editProfileForm .formerror').removeClass('show').addClass('hide')

      var elementID = $('#editProfileForm').data('elementID')
      var whichformdataid = $('#editProfileForm').data('whichformdataid')
      var labelText = helper.makeTitleFromElementID(whichformdataid)
      var newVal;
      var s = document.getElementById(elementID)
      elementID === 'state' ? newVal = s.options[s.selectedIndex].text : newVal = $('#'+elementID).val()
      newVal = $.trim(newVal)

      var data = {}
      var serviceUrl = $(this).attr('action')
      var constrainedFormElements = document.getElementById('editProfileForm').querySelectorAll('[required]')

      if(isSafari){

        var testFocusout = helper.testFormValidity(constrainedFormElements, 'focusout')

        if (testFocusout.formValid !== undefined){
          console.log('+++++++++++ BAD FORM !!!!!!!!!!!')
          testFocusout.focusFirstElement.focus()
          $('.loading').hide()
          return false
        }
      }

      // console.log('#editProfileForm > GOOD FORM');
      // console.log('#editProfileForm > GOOD FORM> labelText: ', labelText);
      // console.log('#editProfileForm > GOOD FORM> newVal: ', newVal);
      // console.log('#editProfileForm > GOOD FORM> ID TEXT: ', $('#'+elementID).val());
      // console.log('#editProfileForm > GOOD FORM> whichformdataid: ', whichformdataid);

      data[elementID] = $('#'+elementID).val()

      data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

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
            $('#editProfileModalAlert .editProfileModalAlertSuccess strong').html('You\'re '+labelText+' has been successfully edited!')
            $('#editProfileModalAlert .editProfileModalAlertSuccess').addClass('show')
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


    $('#newUserDataItemForm').on('submit', function(e) {

      var elementID = $('body').data('elementID')

      console.log('#newUserDataItemForm > SUBMIT 1+++', elementID)
      console.log('#newUserDataItemForm > SUBMIT 2+++', $('#currentUserDataItem').val())
      console.log('#newUserDataItemForm > SUBMIT 3+++', $('#newUserDataItem').val())
      console.log('#newUserDataItemForm > SUBMIT 4+++', $('#confirmNewUserDataItem').val())

      e.preventDefault()
      $('.loading').show()
      $('#newUserDataItemForm .formerror').removeClass('show').addClass('hide')

      var data = {}
      var serviceUrl = $(this).attr('action')
      var constrainedFormElements = document.getElementById('newUserDataItemForm').querySelectorAll('[placeholder]')

      if(interactiveFormValidationEnabled){
        var testFocusout = helper.testFormValidity(constrainedFormElements, 'focusout')

        if (testFocusout.formValid !== undefined){
          console.log('+++++++++++ BAD FORM !!!!!!!!!!!')
          testFocusout.focusFirstElement.focus()
          $('.loading').hide()
          return false
        }
      }

      console.log('+++++++++++ GOOD / UNCONSTRAINED FORM !!!!!!!!!!!')

      var data = {
        type: elementID,
        data: $('#currentUserDataItem').val(),
        newUserDataItem: $('#newUserDataItem').val(),
        confirmNewUserDataItem: $('#confirmNewUserDataItem').val()
      }

      data['_csrf'] = $('meta[name="csrf-token"]').attr('content')

      console.log('+++++++++++ GOOD / UNCONSTRAINED FORM !!!!!!!!!!! > DATA: ', data)

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

            console.log('#newUserDataItemForm > ajax > SUCCESS > SUCCESS: ', data)

            $('.loading').hide()

          } else {

            if (data.alertDanger) {

              console.log('#newUserDataItemForm > ajax > SUCCESS > ERROR 1: ', data)
              
              $('#newUserDataItemModal .modalAlertWarning .alert').html(data.alertDanger);
              $('#newUserDataItemModal .modalAlertWarning').show();
              $('#newUserDataItemModal').find('.error').removeClass('show').addClass('hide')
              $('#newUserDataItemModal input').removeClass('has-error')

              $('#currentUserDataItem').val('')
              $('#newUserDataItemForm').removeData('currentUserDataItemVerified')
              $('#newUserDataItemForm').removeData('currentUserEmailVerified')

              $('#currentUserDataItemLabel').html('Please Enter Your Current Email Address:')
      
              $('#currentUserDataItem').attr({
                type: 'text',
                title: 'Please enter a valid Email Address',
                placeholder: 'Current Email Address'
              })
   
              /*
              $('#currentUserDataItem').attr({
                  type: 'text',
                  pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
                  title: 'Please enter a valid Email Address',
                  placeholder: 'Current Email Address'
              })
              */

              $('#hideCurrentUserData').removeClass('hideClass')
              $('#hideCurrentUserData').css( 'display', '' )
              $('#hideNewUserData').addClass('hideClass')
              $('#hideNewUserData').css( 'display', 'none' )
              $('#nextSubmitNewUserDataItemForm').html('Next')

              $('#currentUserDataItem').off('focusout')
              $('#newUserDataItem').off('focusout')
              $('#confirmNewUserDataItem').off('focusout')
              $('body').off('click')

            } else if (data.validatedData) {

              console.log('#newUserDataItemForm > ajax > SUCCESS > ERROR 2: ', data)
              $('body').data('validatedData', data.validatedData)
              helper.handleErrorResponse(data.validatedData)

            } else {

              console.log('#newUserDataItemForm > ajax > SUCCESS > ERROR 3: ', data)

              $('#currentUserDataItem').addClass('has-error')
              $('#currentUserDataItemError').removeClass('show').addClass('hide')
              $('#currentUserDataItemRegistered').removeClass('hide').addClass('show').html('Please Enter Your '+$('#currentUserDataItem').attr('placeholder'))
              // $('#newUserDataItemForm .formerror').removeClass('hide').addClass('show')
              
            }

            $('.loading').hide()
            return false
          }

        },

        error: function(xhr, status, error) {

          console.log('#newUserDataItemForm > ajax > ERROR > ERROR: ', xhr)

          var parsedXHR = JSON.parse(xhr.responseText)

          location.href = parsedXHR.redirect

          return false

        }
      })
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
      helper.doNewUserDataItemModal(this);
    })


    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    // +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


    $('#nextSubmitNewUserDataItemForm').on('click', function(e) {

      console.log('nextSubmitNewUserDataItemForm > ON > CLICK ++++++++++++?: ', currentUserEmailVerified)

      e.preventDefault()

      var type = $('body').data('elementID')

      var currentUserDataItemVerified = $('#newUserDataItemForm').data('currentUserDataItemVerified')
      var currentUserEmailVerified = $('#newUserDataItemForm').data('currentUserEmailVerified')

      $('#newUserDataItemModal .modalAlertWarning .alert').html('');
      $('#newUserDataItemModal .modalAlertWarning').hide();

      var data = $('#currentUserDataItem').val()
      var testData = helper.pattern.basictext.test(data)

      console.log('nextSubmitNewUserDataItemForm > type: ', type)
      console.log('nextSubmitNewUserDataItemForm > currentUserDataItemVerified: ', currentUserDataItemVerified)
      console.log('nextSubmitNewUserDataItemForm > currentUserEmailVerified 1: ', currentUserEmailVerified)

      if (currentUserDataItemVerified) {

        console.log('### nextSubmitNewUserDataItemForm > currentUserDataItemVerified > SUBMIT THE FORM !!!')

        $('#newUserDataItemForm').submit()

      } else {

        if (testData) {

          if (currentUserEmailVerified !== true) {

            console.log('$$$$$$$$$$$$$$$$$$$$$#########%%%%%%%%%%%%%#########@@@@@@@@@@@@@@@^^^^^^^^^')

            helper.validateNewUserDataService(data, 'email', 'true', function (err, response) {

              if (err) {

                $('#currentUserDataItem').addClass('has-error')
                $('#currentUserDataItemError').removeClass('show').addClass('hide')
                $('#currentUserDataItemRegistered').removeClass('hide').addClass('show').html('Please Enter Your '+$('#currentUserDataItem').attr('placeholder'))

              } else {

                $('#currentUserDataItem').removeClass('has-error')
                $('#currentUserDataItemError').removeClass('show').addClass('hide')
                $('#currentUserDataItemRegistered').removeClass('show').addClass('hide')

                if(type === 'email'){

                  $('#newUserDataItemForm').data('currentUserDataItemVerified', true)

                  $('#hideCurrentUserData').addClass('hideClass')
                  $('#hideCurrentUserData').css( 'display', 'none' )

                  $('#hideNewUserData').removeClass('hideClass')
                  $('#hideNewUserData').css( 'display', '' )

                  isSafari ? helper.handleSpecificEvents() : null
                  $('#nextSubmitNewUserDataItemForm').html('Submit')
                }


                if(type === 'password'){

                  $('#newUserDataItemForm').data('currentUserEmailVerified', true)

                  $('#currentUserDataItemLabel').html('Please Enter Your Current Password:')
                  $('#currentUserDataItem').val('')

                  $('#currentUserDataItem').attr({ 
                    type: 'password',
                    title: 'Please enter your Password',
                    placeholder: 'Current Password'
                  })

                  /*
                  $('#currentUserDataItem').attr({ 
                    type: 'password',
                    pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
                    title: 'Please enter your Password',
                    placeholder: 'Current Password'
                  })
                  */
                }
                
              }
            })

          } else {

            if (type === 'password') {

              helper.validateNewUserDataService(data, type, 'true', function (err, response) {

                if (err) {

                  if(err.alertDanger){

                    $('#currentUserDataItem').val('')
                    $('#newUserDataItemForm').removeData('currentUserEmailVerified')
                    $('#newUserDataItemModal .modalAlertWarning .alert').html(err.alertDanger);
                    $('#newUserDataItemModal .modalAlertWarning').show();

                    $('#currentUserDataItemLabel').html('Please Enter Your Current Email Address:')

                    $('#currentUserDataItem').attr({
                      type: 'text',
                      title: 'Please enter a valid Email Address',
                      placeholder: 'Current Email Address'
                    })

                    /*
                    $('#currentUserDataItem').attr({
                        type: 'text',
                        pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
                        title: 'Please enter a valid Email Address',
                        placeholder: 'Current Email Address'
                    })
                    */

                  }else{

                    $('#currentUserDataItem').addClass('has-error')
                    $('#currentUserDataItemError').removeClass('show').addClass('hide')
                    $('#currentUserDataItemRegistered').removeClass('hide').addClass('show').html('Please Enter Your '+$('#currentUserDataItem').attr('placeholder'))
                    
                  }

                } else {

                  $('#currentUserDataItemError').removeClass('show').addClass('hide')
                  $('#currentUserDataItemRegistered').removeClass('show').addClass('hide')
                  $('#currentUserDataItem').removeClass('has-error')

                  $('#newUserDataItemForm').data('currentUserDataItemVerified', true)
                  $('#newUserDataItemForm').data('currentUserEmailVerified', true)

                  $('#hideCurrentUserData').addClass('hideClass')
                  $('#hideCurrentUserData').css( 'display', 'none' )

                  $('#hideNewUserData').removeClass('hideClass')
                  $('#hideNewUserData').css( 'display', '' )

                  $('#newUserDataItem').attr({ 
                      type: 'password',
                      title: 'Password must be at least 4 characters long. No whitespace allowed',
                      placeholder: 'New Password'
                  })

                  $('#confirmNewUserDataItem').attr({ 
                      type: 'password',
                      title: 'Password must be at least 4 characters long. No whitespace allowed',
                      placeholder: 'Confirm New Password'
                  })
                  /*
                  $('#newUserDataItem').attr({ 
                      type: 'password',
                      pattern: '[\\S]{4,}',
                      title: 'Password must be at least 4 characters long. No whitespace allowed',
                      placeholder: 'New Password'
                  })

                  $('#confirmNewUserDataItem').attr({ 
                      type: 'password',
                      pattern: '[\\S]{4,}',
                      title: 'Password must be at least 4 characters long. No whitespace allowed',
                      placeholder: 'Confirm New Password'
                  })
                  */

                  isSafari ? helper.handleSpecificEvents() : null
                  $('#nextSubmitNewUserDataItemForm').html('Submit')

                }

              })

            }

          }

        } else {

          console.log('nextSubmitNewUserDataItemForm > testData > BAD: ', testData)
          $('#currentUserDataItem').addClass('has-error')
          $('#currentUserDataItemError').removeClass('hide').addClass('show')

        }
      }

    })

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
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailService <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')
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

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


  resetNewUserDataItemModal: function () {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> resetNewUserDataItemModal <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

    $('body').removeData('modalShown')
    $('#newUserDataItemModal .modalAlertWarning').hide();

    $('#newUserDataItemForm').get(0).reset()
    $('#newUserDataItemModal input').val('')

    $('#hideNewUserData').attr('class', 'hideClass')
    $('#hideNewUserData').attr('style', 'display:none')
    
    $('#newUserDataItemModal').find('.error').removeClass('show').addClass('hide')

    $('#newUserDataItemModal input').removeClass('has-error')
  },


  turnOffEvents: function () {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> turnOffEvents <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

    $('#newUserDataItem').off('change')
    $('#confirmNewUserDataItem').off('change')

    $('#newUserDataItem').off('focusout')
    $('#confirmNewUserDataItem').off('focusout')


    $('body').off('mousedown')
    $('body').off('change')
    $('body').off('focusout')
  },


// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  handleSpecificEvents: function () {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> handleSpecificEvents <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<')

    $('body').on('mousedown', function (e) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> handleSpecificEvents > body > onMousedown: ', e.target.id)

      if (e.target.id === 'newUserDataItemModalCancel' || e.target.id === 'editProfileFormModalCancel' || e.target.outerText === 'Submit') {

        helper.turnOffEvents()
      }

    })

    $('body').on('change', function (e) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> handleSpecificEvents > body > onChange: ', e.target.id)

      if (e.target.nodeName === 'SELECT') {
        helper.handleFormEvents(e.target.id)

      } else if (e.target.id === 'newUserDataItem' || e.target.id === 'confirmNewUserDataItem') {
        helper.handleFormEvents(e.target.id, e.type, $('#'+e.target.id).val())

      }
    })

    $('body').on('focusout', function (e) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> handleSpecificEvents > body > onFocusout: ', e.target.id)

      if (e.target.id === 'newUserDataItem' || e.target.id === 'confirmNewUserDataItem') {
        helper.handleFormEvents(e.target.id, e.type, $('#'+e.target.id).val())

      }
    })

  },

// =================================================================================================================================
// =================================================================================================================================

  handleFormEvents: function(elementID, eType, elementVal) {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> handleFormEvents <<<<<<<<<<<<<<<<<<<<<<<: ', elementID, ' :: ', eType)


    if($('body').data('elementID') === 'email'){
      elementID === 'newUserDataItem' ? helper.emailElementValidation(elementID, 'confirmNewUserDataItem', eType, elementVal) : null
      elementID === 'confirmNewUserDataItem' ? helper.emailElementValidation(elementID, 'newUserDataItem', eType, elementVal) : null
    }

    if($('body').data('elementID') === 'password'){
      elementID === 'newUserDataItem' ? helper.passwordElementValidation(elementID, 'confirmNewUserDataItem', eType) : null
      elementID === 'confirmNewUserDataItem' ? helper.passwordElementValidation(elementID, 'newUserDataItem', eType) : null
    }

    elementID === 'currentUserDataItem' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null
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

        isSafari ? $('#' + comparedElementID).off('input') : null

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

  textElementValidation: function (elementID, pattern, err1) {
    var thisElementValue = $.trim($('#' + elementID).val())
    var title = $('#' + elementID).attr('title')
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    var patternTestValue = pattern.test(thisElementValue)
    err1 !== undefined && err1.lengthError === 'maxlength' ? patternTestValue = false : null

    if (err1 !== undefined) {
      // console.log('textElementValidation > err1: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue, ' || ', err1)
    } else {
      // console.log('textElementValidation > no err1: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue)
    }

    if (thisElementValue !== '') {
      if (!patternTestValue) {
        isSafari ? $('#' + elementID + 'Error').text('Invalid input. ' + $('#' + elementID).attr('title')) : null
        err1 !== undefined && !isSafari ? $('#' + elementID + 'Error').text('Please match the requested format. ' + title) : null

        if ((err1 !== undefined && !isSafari) || isSafari) {
          $('#' + elementID + 'Error').removeClass('hide').addClass('show')
        }

        if (err1 !== undefined && err1.lengthError === 'maxlength') {
          var newVal = helper.validateMaxLengthUserInput($('#' + elementID).val(), err1.stringValLength)
          $('#' + elementID).val(newVal)
        }
      } else {
        isSafari ? $('#' + elementID + 'Error').text('') : null
        isSafari ? $('#' + elementID + 'Error').removeClass('show').addClass('hide') : null
        $('#' + elementID).get(0).setCustomValidity('')
      }
    } else {
      isSafari ? $('#' + elementID + 'Error').text('Please fill out this field. ' + $('#' + elementID).attr('title')) : null
      err1 !== undefined && !isSafari ? $('#' + elementID + 'Error').text('Please fill out this field.') : null

      if ((err1 !== undefined && !isSafari) || isSafari) {
        $('#' + elementID + 'Error').removeClass('hide').addClass('show')
      }
    }
  },

  selectElementValidation: function (elementID, err1) {
    var thisElementValue = $('#' + elementID).val()
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    if (err1 !== undefined) {
      // console.log('#selectElementValidation > err1:', elementID, ' :: ', err1, ' :: ', thisElementValue);
    } else {
      // console.log('#selectElementValidation > no err1:', elementID, ' :: ', thisElementValue);
    }

    if (thisElementValue !== '') {
      if (isSafari) {
        // ++++
      }

      $('#' + elementID + 'Error').text('')
      $('#' + elementID + 'Error').removeClass('show').addClass('hide')

      !isSafari ? $('#' + elementID).get(0).setCustomValidity('') : null
    } else {
      isSafari ? $('#' + elementID + 'Error').text('Please select an option. ' + $('#' + elementID).attr('title')) : null

      err1 !== undefined && !isSafari ? $('#' + elementID + 'Error').text('Please select an item in the list.') : null

      if ((err1 !== undefined && !isSafari) || isSafari) {
        $('#' + elementID + 'Error').removeClass('hide').addClass('show')
      }
    }
  },

  elementIDtoTitleCase: function (whichID) {
    whichID = whichID.replace(/([A-Z])/g, ' $1')
    var labelText = whichID.replace(/^./, function (str) { return str.toUpperCase() })
    return labelText
  },

  testUserInput: function (elementID, pattern, err1) {
    console.log('#testUserInput > no err1: ', elementID, ' :: ', pattern);
    if (err1 !== undefined) {
      // console.log('#testUserInput > err1: ', elementID, ' :: ', pattern, ' :: ', err1);
    } else {
      // console.log('#testUserInput > no err1: ', elementID, ' :: ', pattern);
    }

    var thisElementValue = $('#' + elementID).val()
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    var patternTestValue = pattern.test(thisElementValue)
    err1 !== undefined && err1.error === 'invalid' ? patternTestValue = false : null

    var charCount = thisElementValue.length
    err1 !== undefined && err1.stringValLength ? charCount = err1.stringValLength : null

    var errorElement = $('#' + elementID + 'Error')
    var title = $('#' + elementID).attr('title')

    if (thisElementValue === '') {
      isSafari ? errorElement.text('Please fill out this field. ' + title) : null
      err1 !== undefined && !isSafari ? errorElement.text('Please fill out this field.') : null

      if ((err1 !== undefined && !isSafari) || isSafari) {
        errorElement.removeClass('hide').addClass('show')
      }
    } else if (charCount < 4) {
      if (elementID.indexOf('confirm') !== -1) {
        isSafari ? errorElement.text('Invalid input. ' + title) : null
      } else {
        isSafari ? errorElement.text('Please enter at least 4 character(s). You entered ' + charCount + '. ' + title) : null
      }

      err1 !== undefined && !isSafari ? errorElement.text('Please match the requested format. ' + title) : null

      if ((err1 !== undefined && !isSafari) || isSafari) {
        errorElement.removeClass('hide').addClass('show')
      }
    } else if (charCount >= 4) {
      if (!patternTestValue) {
        isSafari ? errorElement.text('Invalid input. ' + $('#' + elementID).attr('title')) : null
        err1 !== undefined && !isSafari ? errorElement.text('Please match the requested format. ' + title) : null

        if ((err1 !== undefined && !isSafari) || isSafari) {
          errorElement.removeClass('hide').addClass('show')
        }

        if (err1 !== undefined && err1.lengthError === 'maxlength') {
          var newVal = helper.validateMaxLengthUserInput($('#' + elementID).val(), err1.stringValLength)
          $('#' + elementID).val(newVal)
        }
      } else {
        errorElement.text('')
        errorElement.removeClass('show').addClass('hide')

        !isSafari ? $('#' + elementID).get(0).setCustomValidity('') : null
        $('#' + elementID).off('input')
      }
    }
  },

  validateEmailValue: function (email) {
    var pattern = helper.pattern.email
    var email2 = $.trim(email)
    return pattern.test(email2)
  },









  validateParamsXXX: function (thisField, comparedField, err1) {

    var formConfirmType = $('body').data('elementID')
    var comparedFieldTypeEmail = false
    var c = /confirm/
    var comparedFieldLowercase = comparedField.toLowerCase()
    var comparedFieldIsItConfirm = c.test(comparedFieldLowercase)

    formConfirmType === 'email' ? comparedFieldTypeEmail = true : null

    /*
    console.log('##>>>>>>>>> validateParams > thisField: ', thisField, ' > comparedField: ', comparedField)
    console.log('##>>>>>>>>> validateParams > formConfirmType: ', formConfirmType)
    console.log('##>>>>>>>>> validateParams > comparedFieldLowercase: ', comparedFieldLowercase)
    console.log('##>>>>>>>>> validateParams > comparedFieldIsItConfirm: ', comparedFieldIsItConfirm)
    console.log('##>>>>>>>>> validateParams > comparedFieldTypeEmail: ', comparedFieldTypeEmail)
    */


    if (err1 !== undefined) {
      // console.log('## validateParams > err1: ', thisField, ' || ', comparedField, ' || ', err1)
    } else {
      // console.log('## validateParams > no err1: ', thisField, ' || ', comparedField)
    }


    if ((err1 !== undefined && (err1.error === 'nomatch' || err1.error === 'match')) || $('#' + comparedField).val() !== '') {

      var property1 = document.getElementsByName(thisField)[0]
      var property2 = document.getElementsByName(comparedField)[0]


      if ((err1 !== undefined && err1.error === 'nomatch') || property1.value !== property2.value) {

        // Non Safari Browsers && Safari Browsers 10.1/603.1 and Higher
        if (interactiveFormValidationEnabled) {


        // Safari Browsers 10.1/603.1 and Lower
        } else {



        }

      } else {

        // Non Safari Browsers && Safari Browsers 10.1/603.1 and Higher
        if (interactiveFormValidationEnabled) {


        // Safari Browsers 10.1/603.1 and Lower
        } else {



        }

      }
    }
  },


  validateParams: function (thisField, comparedField, err1) {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams <<<<<<<<<<<<<<<<<<<<<<<<<<<<')

    var formConfirmType = $('body').data('elementID')
    var comparedFieldTypeEmail = false
    var c = /confirm/
    var comparedFieldLowercase = comparedField.toLowerCase()
    var comparedFieldIsItConfirm = c.test(comparedFieldLowercase)

    formConfirmType === 'email' ? comparedFieldTypeEmail = true : null

    /*console.log('##>>>>>>>>> validateParams > thisField: ', thisField, ' > comparedField: ', comparedField)
    console.log('##>>>>>>>>> validateParams > formConfirmType: ', formConfirmType)
    console.log('##>>>>>>>>> validateParams > comparedFieldLowercase: ', comparedFieldLowercase)
    console.log('##>>>>>>>>> validateParams > comparedFieldIsItConfirm: ', comparedFieldIsItConfirm)
    console.log('##>>>>>>>>> validateParams > comparedFieldTypeEmail: ', comparedFieldTypeEmail)*/

    if (err1 !== undefined) {
      // console.log('## validateParams > err1: ', thisField, ' || ', comparedField, ' || ', err1)
    } else {
      // console.log('## validateParams > no err1: ', thisField, ' || ', comparedField)
    }

    if ((err1 !== undefined && (err1.error === 'nomatch' || err1.error === 'match')) || $('#' + comparedField).val() !== '') {

      var property1 = document.getElementsByName(thisField)[0]
      var property2 = document.getElementsByName(comparedField)[0]

      //console.log('## validateParams 11111: ', property1.value, ' :: ', property2.value)


      if ((err1 !== undefined && err1.error === 'nomatch') || property1.value !== property2.value) {

        //console.log('## validateParams 22222222')

        if (isSafari) {

          //console.log('## validateParams 333333333')

          if (comparedFieldTypeEmail && !comparedFieldIsItConfirm) {

            console.log('## validateParams 44444444: ', $('#' + thisField + 'Match'))

            $('#' + thisField).get(0).setCustomValidity(helper.elementIDtoTitleCase(formConfirmType) + 's don\'t match')

            $('#' + thisField + 'Match').removeClass('hide').addClass('show').html(helper.elementIDtoTitleCase(formConfirmType) + 's don\'t match')

          } else {

            console.log('## validateParams 55555555: ', comparedField, ' ::: ', $('#' + comparedField + 'Match'))

            $('#' + comparedField).get(0).setCustomValidity(helper.elementIDtoTitleCase(formConfirmType) + 's don\'t match')

            $('#' + comparedField + 'Match').removeClass('hide').addClass('show').html(helper.elementIDtoTitleCase(formConfirmType) + 's don\'t match')

          }

        } else {

          //console.log('## validateParams 6666666')

          if (err1 !== undefined) {

            $('#' + comparedField + 'Match').removeClass('hide').addClass('show').html(helper.elementIDtoTitleCase(formConfirmType) + 's don\'t match')

          } else {

            $('#' + comparedField).get(0).setCustomValidity(helper.elementIDtoTitleCase(thisField) + 's don\'t match')

          }

        }


      } else {

        if (isSafari) {

          if (comparedFieldTypeEmail && !comparedFieldIsItConfirm) {

            $('#' + thisField).get(0).setCustomValidity('')

            $('#' + thisField + 'Match').removeClass('show').addClass('hide')

          } else {

            $('#' + comparedField).get(0).setCustomValidity('')

            $('#' + comparedField + 'Match').removeClass('show').addClass('hide')
          }

        } else {

          if (err1 === undefined) {

            $('#' + thisField).get(0).setCustomValidity('')
            $('#' + comparedField).get(0).setCustomValidity('')

          } else {

            $('#' + comparedField + 'Match').removeClass('show').addClass('hide')

          }

        }

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateParams > GOOD <<<<<<<<<<<<<<<<<<<<<<<<<<<<')
        //var af = $('body').data('activeForm')
        //$('#'+af).submit()

        //if (comparedFieldTypeEmail) {

          var valdata = $('body').data('validatedData')
          var v
          console.log('>>>>>>>>>>>>>>>>>>>>>>>> validateParams > GOOD > valdata <<<<<<<<<<<<<<<<<<<<<<<<<<<<: ', valdata)

          if (valdata) {
            Object.keys(valdata).forEach(function (p) {
              if (p !== 'email' || p !== 'confirmEmail') {
                if (valdata[p].error === 'match' || valdata[p].error === false) {
                  v = true
                }
              }
            })
            var af = $('body').data('activeForm')
            v === true ? $('#'+af).submit() : null
          }

          $('#' + thisField).get(0).setCustomValidity('')

          $('#' + comparedField).get(0).setCustomValidity('')
        //}

      }
    }
  },


  testUserInputEmail: function (elementID, err1) {

    if (err1 !== undefined) {
      // console.log('#testUserInputEmail > err1: ', elementID, ' :: ', err1)
    } else {
      console.log('#################### testUserInputEmail > no err1: ', elementID)
    }

    var thisElementValue = $('#' + elementID).val()
    var thisErrorElement = $('#' + elementID + 'Error')
    var title = $('#' + elementID).attr('title')
    var isEmailValid

    err1 === undefined ? isEmailValid = helper.validateEmailValue(thisElementValue) : null

    if ((err1 !== undefined && (err1.error === 'false' || err1.error === 'match')) || (err1 === undefined && isEmailValid)) {
      err1 !== undefined || isSafari ? thisErrorElement.text('') : null
      err1 !== undefined || isSafari ? thisErrorElement.removeClass('show').addClass('hide') : null
      $('#' + elementID).off('input')
    } else if ((err1 !== undefined && err1.error === 'empty') || thisElementValue === '') {
      err1 !== undefined || isSafari ? thisErrorElement.text('Please fill out this field. ' + title) : null
      err1 !== undefined || isSafari ? thisErrorElement.removeClass('hide').addClass('show') : null
    } else if ((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)) {
      err1 !== undefined || isSafari ? thisErrorElement.text('Please enter an email address. ' + title) : null
      err1 !== undefined || isSafari ? thisErrorElement.removeClass('hide').addClass('show') : null
    }
  },


  validateEmailField: function (elementVal, thisField, comparedField, err1) {

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField <<<<<<<<<<<<<<<<<: ', thisField)

    if (err1 !== undefined) {
      // console.log('#validateEmailField > err1: ', thisField, ' :: ', err1)
    } else {
      // console.log('#validateEmailField > no err1: ', elementVal, ' :: ', thisField, ' :: ', comparedField)
    }

    var isEmailValid

    err1 === undefined || err1.error === 'false' ? isEmailValid = helper.validateEmailValue(elementVal) : null


    // EMAIL IS VALID +++++++++++++++++++
    if ((err1 !== undefined && (err1.error !== 'invalid' && err1.error !== 'empty')) || isEmailValid) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 1 <<<<<<<<<<<<<<<<<<<<<<<<<')

      err1 !== undefined || isSafari ? $('#' + thisField + 'Improper').removeClass('show').addClass('hide') : null

      !isSafari ? $('#' + thisField).get(0).setCustomValidity('') : null

      $('#' + thisField).off('input')

      if (isEmailValid) {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 2 <<<<<<<<<<<<<<<<<<<<<<<<<')

        helper.validateEmailService(elementVal, function (err, response) {

          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 3 <<<<<<<<<<<<<<<<<<<<<<<<<')

          if (err) {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 4 <<<<<<<<<<<<<<<<<<<<<<<<<')

            isSafari ? $('#' + thisField + 'Registered').removeClass('hide').addClass('show') : null

            !isSafari ? $('#' + thisField).get(0).setCustomValidity('This email address is already in our system. Sign in, or enter a new email address') : null

            err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null

          } else {

            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 5 <<<<<<<<<<<<<<<<<<<<<<<<<')

            isSafari ? $('#' + thisField + 'Registered').removeClass('show').addClass('hide') : null

            helper.validateParams(thisField, comparedField)

            err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null
          }

        })

      } else {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 6 <<<<<<<<<<<<<<<<<<<<<<<<<')

        if (err1 !== undefined && err1.error === 'registered') {

          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 7 <<<<<<<<<<<<<<<<<<<<<<<<<')

          $('#' + thisField + 'Registered').removeClass('hide').addClass('show')

        } else {

          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 8 <<<<<<<<<<<<<<<<<<<<<<<<<')

          helper.validateParams(thisField, comparedField, err1)

        }

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 9 <<<<<<<<<<<<<<<<<<<<<<<<<')

        err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null

      }


    // EMAIL IS NOT VALID +++++++++++++++++++
    } else if ((err1 !== undefined && err1.error === 'invalid') || (err1 === undefined && !isEmailValid)) {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 10 <<<<<<<<<<<<<<<<<<<<<<<<<')


      if (err1 !== undefined || isSafari) {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 11 <<<<<<<<<<<<<<<<<<<<<<<<<')

        $('#' + thisField + 'Registered').removeClass('show').addClass('hide')
        $('#' + thisField + 'Improper').removeClass('hide').addClass('show')

      } else {

        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 12 <<<<<<<<<<<<<<<<<<<<<<<<<')

        $('#' + thisField).get(0).setCustomValidity(helper.elementIDtoTitleCase(thisField) + ' is in improper format')

      }

      //$('#' + thisField).focus()

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 13 <<<<<<<<<<<<<<<<<<<<<<<<<')

      err1 !== undefined ? helper.testUserInputEmail(thisField, err1) : null



    } else if (err1 !== undefined && err1.error === 'empty') {

      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> validateEmailField 14 <<<<<<<<<<<<<<<<<<<<<<<<<')

      helper.testUserInputEmail(thisField, err1)

    }

  },



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
                    pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                    title: 'Please type a valid First Name. Maximum 35 characters',
                    placeholder: 'First Name'
                })
                break

            case 'last-name':
                $('#lastname').attr({ 
                    type: 'text',
                    pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                    title: 'Please type a valid Last Name. Maximum 35 characters',
                    placeholder: 'Last Name'
                })
                break

            case 'city':
                $('#city').attr({ 
                    type: 'text',
                    pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
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
    $('#editProfileForm').data('whichformdataid', dataID)

    isSafari ? helper.handleSpecificEvents() : null
    $('#editProfileFormModal').modal({
      keyboard: false,
      backdrop: 'static'
    })
  },



  doNewUserDataItemModal: function(editBtnClicked) {
    var editBtnClickedParentElem = $(editBtnClicked).parent()
    var dataID = editBtnClickedParentElem.data('id')
    var labelText = helper.makeTitleFromElementID(dataID)

    dataID === 'email' ? labelText = labelText + ' Address' : null
    $('body').data('elementID', dataID)
    $('#newUserDataItemForm').removeData('currentUserDataItemVerified')
    $('#newUserDataItemForm').removeData('currentUserEmailVerified')

    console.log('doNewUserDataItemModal > dataID +++++++++++++++++++ : ', dataID)
    console.log('doNewUserDataItemModal > labelText +++++++++++++++++: ', labelText)

    $('#newUserDataItemModal .modal-title').html('Change your ' + labelText + ':')

    $('#currentUserDataItemLabel').html('Please Enter Your Current Email Address:')
    $('#newUserDataItemLabel').html('Enter Your New ' + labelText + ':')
    $('#confirmNewUserDataItemLabel').html('Confirm The New ' + labelText + ':')


    $('#currentUserDataItem').attr({
      type: 'text',
      title: 'Please enter a valid Email Address',
      placeholder: 'Current Email Address'
    })
    
    $('#newUserDataItem').attr({
      type: 'text',
      title: 'Please type a valid Email Address',
      placeholder: 'New Email Address'
    })
    
    $('#confirmNewUserDataItem').attr({
      type: 'text',
      title: 'Please type a valid Email Address',
      placeholder: 'Confirm New Email Address'
    })

    /*
    $('#currentUserDataItem').attr({
        type: 'text',
        pattern: '\\s*(?=\\s*\\S)(.{1,})\\s*',
        title: 'Please enter a valid Email Address',
        placeholder: 'Current Email Address'
    })

    $('#newUserDataItem').attr({
        type: 'email',
        title: 'Please type a valid Email Address',
        placeholder: 'New Email Address'
    })
    
    $('#confirmNewUserDataItem').attr({
        type: 'email',
        title: 'Please type a valid Email Address',
        placeholder: 'Confirm New Email Address'
    })
    */

    $('#hideCurrentUserData').removeClass('hideClass')
    $('#hideCurrentUserData').css( 'display', '' )
    $('#hideNewUserData').addClass('hideClass')
    $('#hideNewUserData').css( 'display', 'none' )

    $('#nextSubmitNewUserDataItemForm').html('Next')

    $('#newUserDataItemModal').modal({
      keyboard: false,
      backdrop: 'static'
    })

  },


  handleErrorResponse: function(data) {

    // {email: {error: "empty"}, confirmEmail: {error: "registered"}, newUserDataItem: true}
    console.log('### handleErrorResponse +++++++++++ ', data)

    var newUserDataItem
    var q

    for (var k in data) {
      if(k === 'newUserDataItem'){
        newUserDataItem = true
        //break
      }
    }

    Object.keys(data).forEach(function(p) {

      switch (p) {

        case 'email':

          newUserDataItem ? p = 'newUserDataItem' : null
          newUserDataItem ? q = 'confirmNewUserDataItem' : q = 'confirmEmail'

          console.log('### handleErrorResponse1: ', p, ' :: ', q, ' :: ', data[p])

          helper.validateEmailField(null, p, q, data[p])
          break

        case 'confirmEmail':

          newUserDataItem ? p = 'confirmNewUserDataItem' : null
          newUserDataItem ? q = 'newUserDataItem' : q = 'email'

          console.log('### handleErrorResponse2: ', p, ' :: ', q, ' :: ', data[p])

          helper.validateEmailField(null, p, q, data[p])
          break

        case 'password':

          console.log('### handleErrorResponse: ', p, ' :: ', data[p])
          if (helper.validateParams('password', 'confirmPassword', data[p])) {
            $('#confirmPassword').off('input')
          }
          helper.testUserInput(p, helper.pattern.password, data[p])
          break

        case 'confirmPassword':

          console.log('### handleErrorResponse: ', p, ' :: ', data[p])
          if (helper.validateParams('password', 'confirmPassword', data[p])) {
            $('#password').off('input')
          }
          helper.testUserInput(p, helper.pattern.password, data[p])
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
