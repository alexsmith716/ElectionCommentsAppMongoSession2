
var helper = {

    init: function() {

        window.showLoading = function() {
            $('.modal-backdrop').show();
        };
        window.hideLoading = function() {
            $('.modal-backdrop').hide();
        };

        $('#state').attr('required', false);

        showLoading(); 

        setTimeout(function() { hideLoading(); }, 500);

        helper.initializeJqueryEvents();
    },

    testFormValidity: function (theForm, eventListener) {

        var boundEventTypes;
        var formElement;
        var checkConstraints;
        var formValid = null;
        var resp = {};

        for( var i = 0; i < theForm.length; i++ ) {

            formElement = $(theForm[i]);
            checkConstraints = formElement.get(0).checkValidity();
            
            if(!checkConstraints && formValid === null){
                formValid = false;
                resp.formValid = false;
                resp.focusFirstElement = formElement;
            }

            if(eventListener === 'change'){
                boundEventTypes = $._data( formElement[0], 'events' );
                for (var eType in boundEventTypes){
                  helper.handleFormEvents(formElement.attr('id'), eType, formElement.val());
                }
            }
            
            if(eventListener === 'focusout'){
                formElement.on('focusout', function(e) {
                    helper.handleFormEvents(formElement.attr('id'), 'focusout', formElement.val());
                })
                formElement.trigger('focusout');
            }

        }
        return resp;
    },

    initializeJqueryEvents:  function(){

        $('#editProfileFormModal').on('shown.bs.modal', function() {
          // $(this).find('[autofocus]').focus();
          //var hasFocus = $('#editProfileForm').data('elementID').is(':focus');
        });

        $('#editProfileFormModal').on('hidden.bs.modal', function () {

            var activeElementID = $('#editProfileForm').data('elementID');

            $('#editProfileForm').get(0).reset();

            $('#'+activeElementID+'Error').removeClass('show').html('');
            $('#'+activeElementID).removeClass('has-error');

            $('.modalAlertSuccess').hide();
            $('.modalAlertDanger').hide();
            $('.modalOkayBtn').hide();
            $('.modalCancelSubmitBtns').show();

        });


        $('#editProfileForm').on('submit', function(e) {

            console.log('#editProfileForm > SUBMIT +++');

            e.preventDefault();
            $('.loading').show();

            $('#editProfileForm .formerror').removeClass('show').addClass('hide');
            $('#editProfileForm .formerror').removeClass('show').addClass('hide');

            var elementID = $('#editProfileForm').data('elementID');
            var whichformdataid = $('#editProfileForm').data('whichformdataid');
            var labelText = helper.makeTitleFromElementID(whichformdataid);
            var newVal;
            var s = document.getElementById(elementID);
            elementID === 'state' ? newVal = s.options[s.selectedIndex].text : newVal = $('#'+elementID).val();
            newVal = newVal.trim();

            var data = {};
            var serviceUrl = $(this).attr('action');


            var constrainedFormElements = document.getElementById('editProfileForm').querySelectorAll('[required]');

            if(is_safari){

                var testFocusout = helper.testFormValidity(constrainedFormElements, 'focusout');

                if (testFocusout.formValid !== undefined){

                    console.log('+++++++++++ BAD FORM !!!!!!!!!!!');
                    testFocusout.focusFirstElement.focus();
                    $('.loading').hide();
                    return false;

                }
            }

            // console.log('#editProfileForm > GOOD FORM');
            // console.log('#editProfileForm > GOOD FORM> labelText: ', labelText);
            // console.log('#editProfileForm > GOOD FORM> newVal: ', newVal);
            // console.log('#editProfileForm > GOOD FORM> ID TEXT: ', $('#'+elementID).val());
            // console.log('#editProfileForm > GOOD FORM> whichformdataid: ', whichformdataid);

            data[elementID] = $('#'+elementID).val();

            data['_csrf'] = $('meta[name="csrf-token"]').attr('content');

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

                        console.log('#editProfileForm > ajax > SUCCESS > SUCCESS: ');

                        $('.loading').hide();
                        $('#editProfileFormModal').modal('hide');
                        $('#editProfileModalAlert .editProfileModalAlertSuccess strong').html('You\'re '+labelText+' has been successfully edited!');
                        $('#editProfileModalAlert .editProfileModalAlertSuccess').addClass('show');
                        $('#editProfileModalAlert').modal('show');
                        $('.'+whichformdataid).text(newVal);

                    } else {

                        if(data.validatedData){

                            console.log('#editProfileForm > ajax > SUCCESS > ERROR > validatedData: ', data.validatedData);
                            helper.handleErrorResponse(data.validatedData);

                        }else{

                            console.log('#editProfileForm > ajax > SUCCESS > ERROR');
                            $('#editProfileForm .formerror').removeClass('hide').addClass('show');

                        }

                        $('.loading').hide();
                        return false;
                    }

                },
                error: function(xhr, status, error) {

                    console.log('#editProfileForm > ajax > ERROR > ERROR: ', xhr);

                    var parsedXHR = JSON.parse(xhr.responseText);

                    location.href = parsedXHR.redirect;

                    return false;

                }
            });
   

        });

        $('#personalInfoToggle').click(function(){
            helper.toggleEditBtn('personalInfo', true);
        });

        $('#personalInfoUpdate').click(function(){
            helper.toggleEditBtn('personalInfo', false);
        });

        $('#accountInfoToggle').click(function(){
            helper.toggleEditBtn('accountInfo', true);
        });

        $('#accountInfoUpdate').click(function(){
            helper.toggleEditBtn('accountInfo', false);
        });

        $('.editFormElement').click(function(){
            helper.doEditProfileModal(this);
        });

        // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

        if(is_safari){

            $('#editProfileForm').on('focusin', '#required-fields .form-control', function() {

                var ve = $('#signUpForm').data('validateElement');

                if(ve === undefined){

                    $('#editProfileForm').data('validateElement', $(document.activeElement).attr('id'));

                }else{

                    helper.handleFormEvents(ve, 'focusout', $('#'+ve).val());
                    $('#editProfileForm').data('validateElement', $(document.activeElement).attr('id'));

                }
            });
        };

        $('#state').on('change', function(e) {
            helper.handleFormEvents($(this).attr('id'));
        });

    },


    pattern: {
        email: /^\S+@\S+\.\S+/,
        password: /^\S{4,}$/,
        basictext: /^(?=\s*\S)(.{1,35})$/
    },

    handleFormEvents: function(elementID, eType, elementVal) {

        //elementID === 'email' ? helper.emailElementValidation(elementID, 'confirmEmail', eType, elementVal) : null;
        //elementID === 'confirmEmail' ? helper.emailElementValidation(elementID, 'email', eType, elementVal) : null;
        //elementID === 'password' ? helper.passwordElementValidation(elementID, 'confirmPassword', eType) : null;
        //elementID === 'confirmPassword' ? helper.passwordElementValidation(elementID, 'password', eType) : null;

        elementID === 'firstname' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null;
        elementID === 'lastname' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null;
        elementID === 'city' ? helper.textElementValidation(elementID, helper.pattern.basictext) : null;
        elementID === 'state' ? helper.selectElementValidation(elementID) : null;
    },


    makeTitleFromElementID: function(whichID) {
        whichID = whichID.replace(/-/g, ' ');
        labelText = whichID.replace(/\b\w/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        return labelText;
    },


    validateEmailValue: function(email) {
        var pattern = helper.pattern.email;
        return pattern.test(email);
    },



    // AbcdefghijklmnopqrstUvwxyzabcdefghIjklmnopqrstuvwxyz
    validateMaxLengthUserInput: function (val,maxlen) {
        val = val.trim();
        var newVal = (val.length) - maxlen;
        newVal = (val.length) - newVal;
        newVal = val.slice(0,newVal);
        return newVal;
    },

    textElementValidation: function(elementID, pattern, err1) {

        var thisElementValue = $('#'+elementID).val().trim();
        var title = $('#'+elementID).attr('title');
        err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null;

        var patternTestValue = pattern.test(thisElementValue);
        err1 !== undefined && err1.lengthError === 'maxlength' ? patternTestValue = false : null;

        if(err1 !== undefined){
            //console.log('textElementValidation > err1: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue, ' || ', err1)
        }else{
            //console.log('textElementValidation > no err1: ', elementID, ' || ', thisElementValue, ' || ', patternTestValue)
        }

        if(thisElementValue !== ''){

            if(!patternTestValue){

                is_safari ? $('#'+elementID+'Error').text('Invalid input. '+$('#'+elementID).attr('title')) : null;
                err1 !== undefined && !is_safari ? $('#'+elementID+'Error').text('Please match the requested format. '+ title) : null;
    
                if((err1 !== undefined && !is_safari) ||  is_safari){

                    $('#'+elementID+'Error').removeClass('hide').addClass('show');

                }

                if(err1 !== undefined &&  err1.lengthError === 'maxlength'){

                    var newVal = helper.validateMaxLengthUserInput($('#'+elementID).val(), err1.stringValLength);
                    $('#'+elementID).val(newVal);
                }

            }else{

                is_safari ? $('#'+elementID+'Error').text('') : null;
                is_safari ? $('#'+elementID+'Error').removeClass('show').addClass('hide') : null;
                $('#'+elementID).get(0).setCustomValidity('')

            }

        }else{

            is_safari ? $('#'+elementID+'Error').text('Please fill out this field. ' + $('#'+elementID).attr('title')) : null;
            err1 !== undefined && !is_safari ? $('#'+elementID+'Error').text('Please fill out this field.') : null;

            if((err1 !== undefined && !is_safari) ||  is_safari){

                $('#'+elementID+'Error').removeClass('hide').addClass('show')

            }

        }
    },

    selectElementValidation: function(elementID, err1) {

        var thisElementValue = $('#'+elementID).val();

        err1 !== undefined && err1.error === 'empty' ? thisElementValue = '' : null;

        if(err1 !== undefined){
            //console.log('#selectElementValidation > err1:', elementID, ' :: ', err1, ' :: ', thisElementValue);
        }else{
            //console.log('#selectElementValidation > no err1:', elementID, ' :: ', thisElementValue);
        }
        
        if(thisElementValue !== ''){

            $('#'+elementID+'Error').text('');
            $('#'+elementID+'Error').removeClass('show').addClass('hide');

            !is_safari ? $('#'+elementID).get(0).setCustomValidity('') : null;

        }else{

            is_safari ? $('#'+elementID+'Error').text('Please select an option. ' + $('#'+elementID).attr('title')) : null;

            err1 !== undefined && !is_safari ? $('#'+elementID+'Error').text('Please select an item in the list.') : null;

            if((err1 !== undefined && !is_safari) ||  is_safari){

                $('#'+elementID+'Error').removeClass('hide').addClass('show')

            }
        }
    },

    toggleEditBtn: function(whichTabs,displayTab) {
        var tabID, i, e;
        tabID = document.getElementsByClassName(whichTabs);

        for(i=0; i < tabID.length; i++) {
            e = tabID[i]; 
            if(displayTab){
                e.style.display = 'none';
            }else{
                if(e.style.display == 'none') {
                    e.style.display = 'inline';
                } else {
                    e.style.display = 'none';
                }
            }
        }
        if(e.style.display === 'inline'){
            whichTabs === 'accountInfo' ? $('#updateAccountBtn').text('Done') : null;
            whichTabs === 'personalInfo' ? $('#updatePersonalBtn').text('Done') : null;
        }
        if(e.style.display === 'none'){
            whichTabs === 'accountInfo' ? $('#updateAccountBtn').text('Update Account info') : null;
            whichTabs === 'personalInfo' ? $('#updatePersonalBtn').text('Update Personal info') : null;
        }
    },



    doEditProfileModal: function(editBtnClicked) {

        var editBtnClickedParentElem = $(editBtnClicked).parent();
        var dataID = editBtnClickedParentElem.data('id');

        console.log('doEditProfileModal > editBtnClicked dataID: ', dataID);

        var elementID = dataID.replace(/-/g, '');
        var previousElementID;

        $('#editProfileForm').data('elementID', elementID);
        $('#editProfileForm .form-group .error').attr('id', elementID+'Error');

        var currentFormType = editBtnClickedParentElem.data('formelementtype');
        var labelText = helper.makeTitleFromElementID(dataID);
        var currentFormValue = $('.'+dataID).text();
        currentFormValue = currentFormValue.trim();

        console.log('doEditProfileModal > dataID: ', dataID);
        console.log('doEditProfileModal > currentFormType: ', currentFormType);
        console.log('doEditProfileModal > labelText: ', labelText);
        console.log('doEditProfileModal > currentFormValue: ', currentFormValue);

        $('#editProfileInputElementParent').removeClass('show').addClass('hide');
        $('#editProfileSelectElementParent').removeClass('show').addClass('hide');

        var previousElementID = $('#editProfileForm').data('previousElementID');

        if(elementID === 'state'){

            $('#editProfileForm .form-group select').attr('id', elementID);
            $('#editProfileSelectElementParent').removeClass('hide').addClass('show');
            $('#state').find('[option]').focus();

            $('#'+elementID).attr('required', true);
            previousElementID !== undefined && previousElementID !== elementID ? $('#'+previousElementID).attr('required', false) : null;

        }else{

            $('#editProfileForm .form-group input').attr('id', elementID);
            $('#editProfileInputElementParent').removeClass('hide').addClass('show');

            $('#'+elementID).attr('required', true);
            previousElementID !== undefined && previousElementID !== elementID ? $('#'+previousElementID).attr('required', false) : null;

            $('#editProfileInputElement').attr({ 
                placeholder: labelText,
                type: currentFormType
            });

            switch (dataID) {

                case 'first-name':
                    $('#firstname').attr({ 
                        pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                        title: 'Please type a valid First Name. Maximum 35 characters'
                    });
                    break;

                case 'last-name':
                    $('#lastname').attr({ 
                        pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                        title: 'Please type a valid Last Name. Maximum 35 characters'
                    });
                    break;

                case 'city':
                    $('#city').attr({ 
                        pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                        title: 'Please type a valid City. Maximum 35 characters'
                    });
                    break;

            }
        }

        $('#editProfileForm').data('previousElementID', elementID);

        $('#editProfileFormLabelCurrent').html('Current ' + labelText + ':');

        $('#editProfileFormLabelUpdated').html('Change your ' + labelText + ':');

        $('#modalFormElementValueCurrent').html(currentFormValue);
        
        $('#editProfileForm').data('whichformdataid', dataID);
        
        $('#editProfileFormModal').modal({
          keyboard: false,
          backdrop: 'static'
        })
    },

    handleErrorResponse: function(data) {

        Object.keys(data).forEach(function(p) {

            switch (p) {
                
                case 'email':
                    console.log('### handleErrorResponse: ', p, ' :: ', data[p]);
                    break;

                case 'confirmEmail':
                    console.log('### handleErrorResponse: ', p, ' :: ', data[p]);
                    break;
   
                case 'password':
                    console.log('### handleErrorResponse: ', p, ' :: ', data[p]);
                    break;

                case 'confirmPassword':
                    console.log('### handleErrorResponse: ', p, ' :: ', data[p]);
                    break;
       
                case 'firstname':
                case 'lastname':
                case 'city':
                    console.log('### handleErrorResponse: ', p, ' :: ', data[p]);
                    helper.textElementValidation(p, helper.pattern.basictext, data[p]);
                    break;

                case 'state':
                    console.log('### handleErrorResponse: ', p, ' :: ', data[p]);
                    helper.selectElementValidation(p, data[p]);
                    break;
            }
        });
    },

}

$(function () {
    helper.init();
});

