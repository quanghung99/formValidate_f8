function validator(formSelector) {
    
    var formRules = {};

/** Quy ước
 * có lỗi => `error message`
 * không có lỗi => undefined
 *  */  

    var validatorRules = {
        required: function(value) {
            return value.trim() ? undefined : 'vui lòng nhập trường này';
        },

        email: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'vui lòng nhập email';
        },

        min: function(min) {
            return function(value) {
                return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} kí tự`;
            }
        }
    };
    // lấy form trong DOM theo formSelector
    var formElements = document.querySelector(formSelector);
    
    // nếu có formSelector mới xử lý
    if (formSelector) {
        var inputElement = formElements.querySelectorAll('[name][rules]');
        var ruleInfo
        for (var input of inputElement) {
            var rules = input.getAttribute('rules').split('|');
            console.log(rules)
            for (var rule of rules) {

                isRuleHasValue = rule.includes(':')
                if (isRuleHasValue) {
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }
                
                ruleFunc = validatorRules[rule]
                if (isRuleHasValue) {
                    ruleFunc = ruleFunc(ruleInfo[1])
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {

                    formRules[input.name] = [ruleFunc];
                }
            }


            // lắng nghe sự kiện để validate (blur, change, input..)
            input.onblur = handleValidate;
            input.oninput = handleValidateClear;
        }

        // hàm thực hiện validated
        function handleValidate(e) {
            console.log(e)
        
            var rules = formRules[e.target.name];
            var errorMessage;
            
            for (var rule of rules) {
                errorMessage = rule(e.target.value);
                if (errorMessage) break;
            }

            if (errorMessage) {
                parentElement = e.target.closest('.form-group');
                errorElement = parentElement.querySelector('.form-message');

                errorElement.innerText = errorMessage;
                parentElement.classList.add('invalid');
                
            } else {
                errorElement.innerText = '';
                parentElement.classList.remove('invalid');
            }
            
        }

        function handleValidateClear(e) {
            
            parentElement = e.target.closest('.form-group');
            errorElement = parentElement.querySelector('.form-message');
            
            errorElement.innerText = '';
            parentElement.classList.remove('invalid');
        }

        formElements.onsubmit = function handleSubmit(e) {
             e.preventDefault();

             var isValid = true
             for (var input of inputElement) {
                 if (!handleValidate ({ target: input})) {
                     isValid = false;
                 }
             }

        }

    }

}