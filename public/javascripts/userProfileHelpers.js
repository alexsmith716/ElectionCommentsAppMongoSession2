/* global $ */
/* global isSafari */
/* global location */
var helper = {

  init: function() {
    helper.showLoading()

    $('#state').attr('required', false)

    setTimeout(function () { helper.hideLoading() }, 500)

    helper.initializeJqueryEvents()
  },

  testFormValidity: function (theForm, eventListener) {

    var boundEventTypes
    var formElement
    var checkConstraints
    var formValid = null
    var resp = {}

    // checkValidity method on form element returns true if element has valid data
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
      $('body').data('modalShown', true)
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

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#editProfileEmailPassModal').on('shown.bs.modal', function() {
      $('body').data('modalShown', true)
      var evts = $._data( $('#currentEmailPass').get(0), 'events' )
      // console.log('#editProfileEmailPassModal > shown.bs.modal evts: ', evts)
      $.each( evts, function(i,exists) {
        // console.log('#editProfileEmailPassModal > shown.bs.modal evts i: ', i, ' :: ', exists)
      })
      setTimeout(function() {
        isSafari ? helper.handleSpecificEvents() : null
      }, 150);
    })

    $('#editProfileEmailPassModal').on('hidden.bs.modal', function () {
      console.log('##### editProfileEmailPassModal > ON hidden.bs.modal +++++++++')

      $('body').removeData('modalShown');
      $('#currentEmailPass').off('focusout')
      $('#newEmailPass').off('focusout')
      $('#confirmEmailPass').off('focusout')
      $('body').off('click')

      $('#changeEmailPassForm').get(0).reset()
      $('#changeEmailPassForm').find('.error').removeClass('show ').addClass('hide')
      $('#currentEmailPassError').removeClass('show').html('')
      $('#newEmailPassImproper').removeClass('show').html('')
      $('#newEmailPassRegistered').removeClass('show').html('')
      $('#newEmailPassRegistered').removeClass('show').html('')
      $('#confirmEmailPassImproper').removeClass('show').html('')
      $('#confirmEmailPassRegistered').removeClass('show').html('')
      $('#confirmEmailPassMatch').removeClass('show').html('')
      $('#confirmEmailPassImproper').removeClass('show').html('')
      $('#currentEmailPass').removeClass('has-error')
      $('#newEmailPass').removeClass('has-error')
      $('#confirmEmailPass').removeClass('has-error')
      $('.modalAlertSuccess').hide()
      $('.modalAlertDanger').hide()
      $('.modalOkayBtn').hide()
      $('.modalCancelSubmitBtns').show()
    })


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
      newVal = newVal.trim()

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


    $('#changeEmailPassForm').on('submit', function(e) {

      var elementID = $('body').data('elementID')

      console.log('#changeEmailPassForm > SUBMIT 1+++', elementID)
      console.log('#changeEmailPassForm > SUBMIT 2+++', $('#currentEmailPass').val())
      console.log('#changeEmailPassForm > SUBMIT 3+++', $('#newEmailPass').val())
      console.log('#changeEmailPassForm > SUBMIT 4+++', $('#confirmEmailPass').val())

      // required & regex pattern will handle client validation for currentEmailPass  ( pattern="\\s*(?=\\s*\\S)(.{1,35})\\s*" )
      // ++++++++++++++++++++++++++++++++++++++++++
      // EMAIL: required, type = email & script will handle client validation for newEmailPass
      // EMAIL: required, type = email & script will handle client validation for confirmEmailPass
      // ++++++++++++++++++++++++++++++++++++++++++
      // PASSWORD: required, regex pattern & script will handle client validation for newEmailPass     ( pattern="[\\S]{4,}" )
      // PASSWORD: required, regex pattern & script will handle client validation for confirmEmailPass ( pattern="[\\S]{4,}" )

      e.preventDefault()
      $('.loading').show()
      $('#changeEmailPassForm .formerror').removeClass('show').addClass('hide')

      var data = {}
      var serviceUrl = $(this).attr('action')
      var constrainedFormElements = document.getElementById('changeEmailPassForm').querySelectorAll('[placeholder]')

      if(isSafari){
        var testFocusout = helper.testFormValidity(constrainedFormElements, 'focusout')
        if (testFocusout.formValid !== undefined){
          console.log('+++++++++++ BAD FORM !!!!!!!!!!!')
          testFocusout.focusFirstElement.focus()
          $('.loading').hide()
          return false
        }
      }

      console.log('+++++++++++ GOOD FORM !!!!!!!!!!!')
      /*
      var data = {
        type: elementID,
        currentEmailPass: $('#currentEmailPass').val(),
        newEmailPass: $('#newEmailPass').val(),
        confirmEmailPass: $('#confirmEmailPass').val()
      }

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

            console.log('#changeEmailPassForm > ajax > SUCCESS > SUCCESS: ', data)

            $('.loading').hide()

          } else {

            if(data.validatedData){

              console.log('#changeEmailPassForm > ajax > SUCCESS > ERROR > validatedData: ', data.validatedData)
              helper.handleErrorResponse(data.validatedData)

            }else{

              console.log('#changeEmailPassForm > ajax > SUCCESS > ERROR')
              $('#changeEmailPassForm .formerror').removeClass('hide').addClass('show')

            }

            $('.loading').hide()
            return false
          }

        },

        error: function(xhr, status, error) {

          console.log('#changeEmailPassForm > ajax > ERROR > ERROR: ', xhr)

          var parsedXHR = JSON.parse(xhr.responseText)

          location.href = parsedXHR.redirect

          return false

        }
      })
      */
    })

    $('#personalInfoToggle').click(function(){
      helper.toggleEditBtn('personalInfo', true);
    })

    $('#personalInfoUpdate').click(function(){
      helper.toggleEditBtn('personalInfo', false);
    })

    $('#accountInfoToggle').click(function(){
      helper.toggleEditBtn('accountInfo', true);
    })

    $('#accountInfoUpdate').click(function(){
      helper.toggleEditBtn('accountInfo', false);
    })

    $('.editFormElement').click(function(){
      helper.doEditProfileModal(this);
    })

    $('.editFormEmailPassElement').click(function(){
      helper.doEditProfileEmailPassModal(this);
    })

    // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    $('#currentEmailPass').on('change', function (e) {
      helper.handleFormEvents($(this).attr('id'), e.type, $(this).val())
    })

    $('#newEmailPass').on('change', function (e) {
      helper.handleFormEvents($(this).attr('id'), e.type, $(this).val())
    })

    $('#confirmEmailPass').on('change', function (e) {
      helper.handleFormEvents($(this).attr('id'), e.type, $(this).val())
    })

    $('#state').on('change', function(e) {
      helper.handleFormEvents($(this).attr('id'))
    })

    $('#submitChangeEmailPassForm').on('click', function(e) {
      $('body').off('click')
    })

  },

  handleSpecificEvents: function(){

    $('#editProfileEmailPassModal').removeData('activeInputElement');

    $('body').on('click', function(e) {
      // e.stopPropagation()

      var activeInputElement = $('#editProfileEmailPassModal').data('activeInputElement');

      if(activeInputElement !== undefined && (e.target.nodeName === 'INPUT')){
        
        helper.handleFormEvents(activeInputElement, 'focusout', $('#'+activeInputElement).val())

      }

    })

    $('#currentEmailPass').on('focusout', function(e) {
      $('#editProfileEmailPassModal').data('activeInputElement', 'currentEmailPass')
    })

    $('#newEmailPass').on('focusout', function(e) {
      $('#editProfileEmailPassModal').data('activeInputElement', 'newEmailPass')
    })

    $('#confirmEmailPass').on('focusout', function(e) {
      $('#editProfileEmailPassModal').data('activeInputElement', 'confirmEmailPass')
    })

  },

// =================================================================================================================================
// =================================================================================================================================
// =================================================================================================================================
// =================================================================================================================================
// =================================================================================================================================

  handleFormEvents: function(elementID, eType, elementVal) {

    console.log('##### handleFormEvents +++++++++: ', elementID, ' :: ', eType)

    if($('body').data('elementID') === 'email'){
      elementID === 'newEmailPass' ? helper.emailElementValidation(elementID, 'confirmEmailPass', eType, elementVal) : null
      elementID === 'confirmEmailPass' ? helper.emailElementValidation(elementID, 'newEmailPass', eType, elementVal) : null
    }

    if($('body').data('elementID') === 'password'){
      elementID === 'newEmailPass' ? helper.passwordElementValidation(elementID, 'confirmEmailPass', eType) : null
      elementID === 'confirmEmailPass' ? helper.passwordElementValidation(elementID, 'newEmailPass', eType) : null
    }

    elementID === 'currentEmailPass' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null
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
// =================================================================================================================================
// =================================================================================================================================
// =================================================================================================================================

  pattern: {
    displayname: /^[A-Za-z0-9_]{4,21}$/,
    email: /^\S+@\S+\.\S+/,
    password: /^\S{4,}$/,
    password2: /^[\S]{4,}$/,
    basictext: /^(?=\s*\S)(.{1,35})$/
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
    val = val.trim()
    var newVal = (val.length) - maxlen
    newVal = (val.length) - newVal
    newVal = val.slice(0, newVal)
    return newVal
  },

  textElementValidation: function (elementID, pattern, err1) {
    var thisElementValue = $('#' + elementID).val().trim()
    var title = $('#' + elementID).attr('title')
    err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null

    var patternTestValue = pattern.test(thisElementValue)
    err1 !== undefined && err1.lengthError === 'maxlength' ? patternTestValue = false : null

    if (err1 !== undefined) {
      // console.log('textElementValidation > err1: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue, ' || ', err1)
    } else {
      console.log('textElementValidation > no err1: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue)
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
      console.log('#selectElementValidation > no err1:', elementID, ' :: ', thisElementValue);
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
      console.log('#testUserInput > no err1: ', elementID, ' :: ', pattern);
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
    console.log('validateEmailValue >>: ', email, ' :: ', pattern.test(email))
    return pattern.test(email)
  },

  validateParams: function (thisField, comparedField, err1) {

    var formConfirmType = $('body').data('elementID')
    var comparedFieldTypeEmail = false
    var c = /confirm/
    var comparedFieldLowercase = comparedField.toLowerCase()
    var comparedFieldIsItConfirm = c.test(comparedFieldLowercase)

    formConfirmType === 'email' ? comparedFieldTypeEmail = true : null

    console.log('##>>>>>>>>> validateParams > thisField: ', thisField, ' > comparedField: ', comparedField)
    console.log('##>>>>>>>>> validateParams > formConfirmType: ', formConfirmType)
    console.log('##>>>>>>>>> validateParams > comparedFieldLowercase: ', comparedFieldLowercase)
    console.log('##>>>>>>>>> validateParams > comparedFieldIsItConfirm: ', comparedFieldIsItConfirm)
    console.log('##>>>>>>>>> validateParams > comparedFieldTypeEmail: ', comparedFieldTypeEmail)

    if (err1 !== undefined) {
      // console.log('## validateParams > err1: ', thisField, ' || ', comparedField, ' || ', err1)
    } else {
      console.log('## validateParams > no err1: ', thisField, ' || ', comparedField)
    }

    if ((err1 !== undefined && (err1.error === 'nomatch' || err1.error === 'match')) || $('#' + comparedField).val() !== '') {
      var property1 = document.getElementsByName(thisField)[0]
      var property2 = document.getElementsByName(comparedField)[0]

      if ((err1 !== undefined && err1.error === 'nomatch') || property1.value !== property2.value) {
        if (isSafari) {
          if (comparedFieldTypeEmail && !comparedFieldIsItConfirm) {
            $('#' + thisField + 'Match').removeClass('hide').addClass('show')
          } else {
            $('#' + comparedField + 'Match').removeClass('hide').addClass('show')
          }
        } else {
          if (err1 !== undefined) {
            $('#' + comparedField + 'Match').removeClass('hide').addClass('show')
          } else {
            $('#' + comparedField).get(0).setCustomValidity(helper.elementIDtoTitleCase(thisField) + 's don\'t match')
          }
        }
      } else {
        if (isSafari) {
          if (comparedFieldTypeEmail && !comparedFieldIsItConfirm) {
            $('#' + thisField + 'Match').removeClass('show').addClass('hide')
          } else {
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
      }
    }
  },

  testUserInputEmail: function (elementID, err1) {

    if (err1 !== undefined) {
      // console.log('#testUserInputEmail > err1: ', elementID, ' :: ', err1)
    } else {
      console.log('#testUserInputEmail > no err1: ', elementID)
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

  validateEmailService: function (email, callback) {
    var data = {}
    var pathName = 'email'
    var err
    data[pathName] = email
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

  validateEmailField: function (elementVal, thisField, comparedField, err1) {

    if (err1 !== undefined) {
      // console.log('#validateEmailField > err1: ', thisField, ' :: ', err1)
    } else {
      console.log('#validateEmailField > no err1: ', elementVal, ' :: ', thisField, ' :: ', comparedField)
    }

    var isEmailValid

    err1 === undefined || err1.error === 'false' ? isEmailValid = helper.validateEmailValue(elementVal) : null

        // EMAIL IS VALID +++++++++++++++++++
    if ((err1 !== undefined && (err1.error !== 'invalid' && err1.error !== 'empty')) || isEmailValid) {
      err1 !== undefined || isSafari ? $('#' + thisField + 'Improper').removeClass('show').addClass('hide') : null
      !isSafari ? $('#' + thisField).get(0).setCustomValidity('') : null
      $('#' + thisField).off('input')

      if (isEmailValid) {
        helper.validateEmailService(elementVal, function (err, response) {
          if (err) {
            isSafari ? $('#' + thisField + 'Registered').removeClass('hide').addClass('show') : null
            !isSafari ? $('#' + thisField).get(0).setCustomValidity('This email address is already in our system. Sign in, or enter a new email address') : null

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

    isSafari ? helper.handleSpecificEvents() : null
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
    currentFormValue = currentFormValue.trim()

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
    
    $('#editProfileFormModal').modal({
      keyboard: false,
      backdrop: 'static'
    })
  },


  doEditProfileEmailPassModal: function(editBtnClicked) {

    //isSafari ? helper.handleSpecificEvents() : null
    var editBtnClickedParentElem = $(editBtnClicked).parent()
    var dataID = editBtnClickedParentElem.data('id')
    var labelText = helper.makeTitleFromElementID(dataID)
    dataID === 'email' ? labelText = labelText + ' Address' : null
    dataID === 'email' ? $('#confirmEmailPassMatch').html('Emails don\'t match') : $('#confirmEmailPassMatch').html('Passwords don\'t match')
    $('body').data('elementID', dataID)

    console.log('doEditProfileEmailPassModal > dataID +++++++++++++++++++ : ', dataID)
    console.log('doEditProfileEmailPassModal > labelText +++++++++++++++++: ', labelText)

    $('#editProfileEmailPassModal .modal-title').html('Change your ' + labelText + ':')
    $('#currentEmailPassLabel').html('Current ' + labelText + ':')
    $('#newEmailPassLabel').html('New ' + labelText + ':')
    $('#confirmEmailPassLabel').html('Confirm new ' + labelText + ':')

    if(dataID === 'email'){

      $('#currentEmailPass').attr({
        type: 'text',
        title: 'Please enter a valid Email Address',
        placeholder: 'Current Email Address'
      })

      $('#newEmailPass').attr({
        type: 'text',
        title: 'Please type a valid Email Address',
        placeholder: 'New Email Address'
      })

      $('#confirmEmailPass').attr({
        type: 'text',
        title: 'Please type a valid Email Address',
        placeholder: 'Confirm New Email Address'
      })

    }else{

      $('#currentEmailPass').attr({ 
        type: 'text',
        title: 'Please enter your Password',
        placeholder: 'Current Password'
      })

      $('#newEmailPass').attr({ 
        type: 'text',
        title: 'Password must be at least 4 characters long. No whitespace allowed',
        placeholder: 'New Password'
      })

      $('#confirmEmailPass').attr({ 
        type: 'text',
        title: 'Password must be at least 4 characters long. No whitespace allowed',
        placeholder: 'Confirm New Password'
      })

    }
    /*
    if(dataID === 'email'){

        $('#currentEmailPass').attr({
            type: 'text',
            title: 'Please enter a valid Email Address',
            placeholder: 'Current Email Address'
        })

        $('#newEmailPass').attr({
            type: 'email',
            title: 'Please type a valid Email Address',
            placeholder: 'New Email Address'
        })
        
        $('#confirmEmailPass').attr({
            type: 'email',
            title: 'Please type a valid Email Address',
            placeholder: 'Confirm New Email Address'
        })

    }else{

        $('#currentEmailPass').attr({ 
            type: 'password',
            title: 'Please enter your Password',
            placeholder: 'Current Password'
        })

        $('#newEmailPass').attr({ 
            type: 'password',
            pattern: '[\\S]{4,}',
            title: 'Password must be at least 4 characters long. No whitespace allowed',
            placeholder: 'New Password'
        })
        
        $('#confirmEmailPass').attr({ 
            type: 'password',
            pattern: '[\\S]{4,}',
            title: 'Password must be at least 4 characters long. No whitespace allowed',
            placeholder: 'Confirm New Password'
        })

    }
    */

    $(':input').each(function (i) { $(this).attr('tabindex', i + 1); })

    $('#editProfileEmailPassModal').modal({
      keyboard: false,
      backdrop: 'static'
    })
  },

  handleErrorResponse: function(data) {

    Object.keys(data).forEach(function(p) {

        switch (p) {
            
            case 'email':
                console.log('### handleErrorResponse: ', p, ' :: ', data[p])
                break

            case 'confirmEmail':
                console.log('### handleErrorResponse: ', p, ' :: ', data[p])
                break
    
            case 'password':
                console.log('### handleErrorResponse: ', p, ' :: ', data[p])
                break

            case 'confirmPassword':
                console.log('### handleErrorResponse: ', p, ' :: ', data[p])
                break
    
            case 'firstname':
            case 'lastname':
            case 'city':
                console.log('### handleErrorResponse: ', p, ' :: ', data[p])
                helper.textElementValidation(p, helper.pattern.basictext, data[p])
                break

            case 'state':
                console.log('### handleErrorResponse: ', p, ' :: ', data[p])
                helper.selectElementValidation(p, data[p])
                break
        }
    })
  },

}

$(function () {
    helper.init()
})
