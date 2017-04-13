
var helper = {

    init: function() {

        window.showLoading = function() {
            $('.modal-backdrop').show();
        };
        window.hideLoading = function() {
            $('.modal-backdrop').hide();
        };

        showLoading(); 

        $('[name="inputElement"]').prop('required', true);
        $('[name="state"]').prop('required', true);

        setTimeout(function() { hideLoading(); }, 500);

        helper.initializeJqueryEvents();
    },

    initializeJqueryEvents:  function(){

        $('#editProfileFormModal').on('shown.bs.modal', function() {
            console.log('#editProfileFormModal > shown.bs.modal ++++');
          $(this).find('[autofocus]').focus();
          //var hasFocus = $('#state').is(':focus');
          //var hasFocus = $('#inputElement').is(':focus');
        });

        $('#editProfileFormModal').on('hidden.bs.modal', function () {
            console.log('#editProfileFormModal > hidden.bs.modal ++++');
            $('.editProfileFormError').removeClass('show');
            //$('#editProfileInputElement').removeClass('has-error');
            $('.editProfileFormError').html('');
            $('#editProfileInputElement').val('');
            $('#state').val('').trigger('change');
            $('.modalAlertSuccess').hide();
            $('.modalAlertDanger').hide();
            $('.modalOkayBtn').hide();
            $('.modalCancelSubmitBtns').show();
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
            helper.doEditProfileModal('editProfileFormModal', 'editProfileForm', this);
        });

        $('#editProfileForm').on('submit', function(e) {

            console.log('#editProfileForm > SUBMIT +++');

            e.preventDefault();

            var data = {};
            var activeElem;
            var serviceUrl = $(this).attr('action');

            var whichformdataid = $('#editProfileForm').data('whichformdataid');
            var whichFormDataType = $('#editProfileForm').data('whichformdatatype');
            var labelText = helper.makeTitleFromElementID(whichformdataid);

            whichFormDataType === 'select' ? activeElem = $('#state') : activeElem = $('#editProfileInputElement');

            var userInput = helper.evaluateInput(whichformdataid, whichFormDataType);
            var pathName = whichformdataid.replace(/-/g, '');
            var checkConstraints = $('#'+activeElem)[0].checkValidity();
            console.log('#editProfileForm > checkConstraints: ', activeElem, ' :: ', checkConstraints);
            
            if(!checkConstraints){

                console.log('#editProfileForm > BAD FORM: ', checkConstraints);
                return false;

            }

            console.log('#editProfileForm > GOOD FORM');

            console.log('#editProfileForm > GOOD FORM> pathName: ', pathName);
            console.log('#editProfileForm > GOOD FORM> userInput: ', userInput);

            console.log('#editProfileForm > GOOD FORM> whichformdataid: ', whichformdataid);
            console.log('#editProfileForm > GOOD FORM> whichFormDataType: ', whichFormDataType);
            console.log('#editProfileForm > GOOD FORM> labelText: ', labelText);

            $('.loading').show();

            data[pathName] = userInput;
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

                        console.log('#editProfileForm > ajax > SUCCESS > SUCCESS');

                        $('.loading').hide();
                        $('#editProfileFormModal').modal('hide');
                        $('#editProfileModalAlert .editProfileModalAlertSuccess strong').html('You\'re '+labelText+' has been successfully edited!');
                        $('#editProfileModalAlert .editProfileModalAlertSuccess').addClass('show');
                        $('#editProfileModalAlert').modal('show');
                        $('.'+whichformdataid).text(userInput);

                    } else {

                        console.log('#editProfileForm > ajax > SUCCESS > ERROR');

                        if(data.validatedData){

                            $('.editProfileFormError').html('Could not edit your '+labelText+'.');
 
                            helper.handleErrorResponse(data.validatedData);

                        }else{

                            $('.editProfileFormError').html('Could not edit your '+labelText+'.');

                        }
                        
                        $('.editProfileFormError').addClass('show');
                        $(activeElem).addClass('has-error');

                        $('.loading').hide();
                        return false;
                    }

                },
                error: function(xhr, status, error) {

                    var parsedXHR = JSON.parse(xhr.responseText);

                    location.href = parsedXHR.redirect;

                    return false;

                }
            });

        });

    },


    pattern: {
        email: /^\S+@\S+\.\S+/,
        password: /^\S{4,}$/,
        basictext: /^(?=\s*\S)(.{1,35})$/
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


    evaluateInput: function(whichID, whichType) {
        console.log('evaluateInput +++++')
        var emailPattern = /\S+@\S+\.\S+/;
        var passwordPattern = /^\S{4,}$/;
        var whichFormElementType;
        var isThisElementValueValid;
        var pattern;

        if(whichType === 'select'){
            whichFormElementType = $('#state');
        }else{
            whichFormElementType = $('#editProfileInputElement');
        }

        console.log('evaluateInput > whichFormElementType:', whichFormElementType)

        var s = document.getElementById('state');

        var whichTypeVal = whichFormElementType.val();
        
        whichType === 'select' ? whichTypeVal = s.options[s.selectedIndex].text : null;

        whichTypeVal = whichTypeVal.trim();
        var elementTitle = whichFormElementType.attr('title');
        
        if(whichID === 'email' || whichID === 'password'){

            whichID === 'email' ? pattern = emailPattern : pattern = passwordPattern;
            isThisElementValueValid = pattern.test(whichTypeVal);

            if(isThisElementValueValid){
                console.log()
                $('.editProfileFormError').text(''); 
                $('.editProfileFormError').removeClass('show').addClass('hide');
                return whichTypeVal;
            }else{
                $('.editProfileFormError').text(elementTitle);
                $('.editProfileFormError').removeClass('hide').addClass('show');
                return false;
            }
 
        }else{
        
            if(whichTypeVal && whichTypeVal !== ''){
                $('.editProfileFormError').text(''); 
                $('.editProfileFormError').removeClass('show').addClass('hide');
                return whichTypeVal;
            }else{
                $('.editProfileFormError').text(elementTitle);
                $('.editProfileFormError').removeClass('hide').addClass('show');
                return false;
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

    doEditProfileModal: function(editProfileFormModalID, editProfileFormID, editBtnClicked) {
        console.log('doEditProfileModal ++++++++');

        var editBtnClickedParentElem = $(editBtnClicked).parent();
        var dataID = editBtnClickedParentElem.data('id');
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
        $('#editProfileInputElement').prop('disabled', true);
        $('#state').prop('disabled', true);


        if(currentFormType === 'select'){
            $('#editProfileSelectElementParent').removeClass('hide').addClass('show');
            $('#state').prop( 'disabled', false );
            $('#state').find('[option]').focus();

        }else{
            $('#editProfileInputElementParent').removeClass('hide').addClass('show');
            $('#editProfileInputElement').prop( 'disabled', false );
            $('#editProfileInputElement').attr({ 
                placeholder: labelText,
                type: currentFormType
            });

            switch (dataID) {

                case 'first-name':
                    $('#editProfileInputElement').attr({ 
                        pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                        title: 'Please type a valid First Name. Maximum 35 characters'
                    });
                    break;

                case 'last-name':
                    $('#editProfileInputElement').attr({ 
                        pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                        title: 'Please type a valid Last Name. Maximum 35 characters'
                    });
                    break;

                case 'city':
                    $('#editProfileInputElement').attr({ 
                        pattern: '\\s*(?=\\s*\\S)(.{1,35})\\s*',
                        title: 'Please type a valid City. Maximum 35 characters'
                    });
                    break;

            }
        }

        $('#editProfileFormLabelCurrent').html('Current ' + labelText + ':');

        $('#editProfileFormLabelUpdated').html('Change your ' + labelText + ':');

        $('#modalFormElementValueCurrent').html(currentFormValue);
        
        $('#'+editProfileFormID).data('whichformdataid', dataID);
        $('#'+editProfileFormID).data('whichformdatatype', currentFormType);
        
        $('#'+editProfileFormModalID).modal({
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
                    break;

                case 'state':
                    console.log('### handleErrorResponse: ', p, ' :: ', data[p]);
                    break;
            }
        });
    },

}

$(function () {
    helper.init();
});

