function validator(options) {
    var formElements = document.querySelector(options.form);

    var selectorRule = {};
    
    function validate (inputElement,rule) {
        var errorMessage
        var errorParent = inputElement.closest(options.formSelector);
        var errorElement = errorParent.querySelector(options.errorSelector);

        // lấy ra các rules của selector
        var rules = selectorRule[rule.selector]
        // lặp qua các rules và kiểm tra
        for(var i = 0; i < rules.length; ++i) {

            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage = rules[i](
                        formElements.querySelector(rule.selector + ':checked')
                    );
                break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            
            if (errorMessage) break;
        }

            if (errorMessage) {
                errorElement.innerText = errorMessage
                errorParent.classList.add('invalid')
            } else {
                errorElement.innerText = '';
                errorParent.classList.remove('invalid')
            }
        return !errorMessage
    }



    // hàm lấy element trong form 
    if(formElements) {

        formElements.onsubmit = function (e) {
            e.preventDefault();
            
            isFormvalid = true;

            // lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElements.querySelectorAll(rule.selector)

                isFormvalid = true

                var isValid = validate(inputElement,rule)

                if (!isValid) {
                    isFormvalid = false;
                }
            })

            
            if(isFormvalid) {

                if (typeof options.onSubmit === 'function') {  // chú ý kiểm tra kiểu dl options.onSubmit tránh lỗi onSubmit is not a function
                    var enableInputs = formElements.querySelectorAll('[name]') // :not([disable])

                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        switch (input.type) {
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values  
                                } 
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = []
                                }    
                                values[input.name].push(input.value)
                                break;
                            case 'radio':
                                values[input.name] = formElements.querySelector('input[name="' + input.name + '"]:checked').value;  //input.value;
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                            values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
            }
        }

        // xử lí logic các thao tác của người dùng
        options.rules.forEach(function(rule) {
            var inputElement = formElements.querySelectorAll(rule.selector)
            

            Array.from(inputElement).forEach(function(inputElement) {
                // onblur 
                inputElement.onblur = function() {
                    validate(inputElement,rule)
                }

                // kiểm tra email
                inputElement.oninput = function() {
                    var errorParent = inputElement.closest(options.formSelector);
                    var errorElement = errorParent.querySelector(options.errorSelector)
                
                    errorElement.innerText = '';
                    errorParent.classList.remove('invalid')
                }

                // // onchange
                // inputElement.onchange = function() {
                //     var errorParent = inputElement.closest(options.formSelector);
                //     var errorElement = errorParent.querySelector(options.errorSelector)
                
                //     errorElement.innerText = '';
                //     errorParent.classList.remove('invalid')
                // }
            })

            if (Array.isArray(selectorRule[rule.selector])) {
                selectorRule[rule.selector].push(rule.test)
            } else {
                selectorRule[rule.selector] = [rule.test]
            }

        })

    }
}


// nguyên tắc của rules
// 1. khi có lỗi trả về message
// 2. khi hợp lệ trả về undefined    

validator.isRequired = function(selector,message) {
    return {
        selector,
        test: function(value) {
            return value ? undefined : message || 'Vui lòng nhập trường này'  // .trim() logic kiểm tra password
        }       
    }
}

validator.isEmail = function(selector) {
    return {
        selector,
        test: function(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : 'Trường này phải là email'
        }       
    }
}

validator.isMinlength = function(selector,min) {
    return {
        selector,
        test: function(value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`
        }       
    }
}

validator.isConfirm = function(selector,getInformation,message) {
    return {
        selector,
        test: function(value) {
            return value === getInformation() ? undefined : message || 'Giá trị nhập vào không chính xác'
        }
    }
}