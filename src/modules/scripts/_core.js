import IMask from 'imask'
import UIkit from 'uikit'
import validate from 'validate.js'

class App {
    constructor() {
        this.isMobile = {
            Android: () => navigator.userAgent.match(/Android/i),
            BlackBerry: () => navigator.userAgent.match(/BlackBerry/i),
            iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
            Opera: () => navigator.userAgent.match(/Opera Mini/i),
            Windows: () => navigator.userAgent.match(/IEMobile/i),
            any: () => (this.isMobile.Android() || this.isMobile.BlackBerry() || this.isMobile.iOS() || this.isMobile.Opera() || this.isMobile.Windows())
        }
        
        this.md = 768
        this.lg = 1150

        this._apiBase = '/api/';  
    }

    init() {
        // FORM
        const form = new Form()
        form.init()

    }

    // plural(number, ['год', 'года', 'лет'])
    plural(number, titles) {
        const cases = [2, 0, 1, 1, 1, 2]
        return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]]
    }
    // параллакс на элемент, должен иметь класс и data-parallax-k="10xx"
    mouseMove(mouseMoveItemSelector = '.mouse-parallax') {

        window.addEventListener('mousemove', function(e) {
            let x = e.clientX / window.innerWidth
            let y = e.clientY / window.innerHeight
            document.querySelectorAll(mouseMoveItemSelector).forEach(e => {
                e.style.transform = `translate(${-x * e.getAttribute('data-parallax-k')}px, ${-y * e.getAttribute('data-parallax-k')}px)`
            })
        })
    }
    matchMediaListener(breakpoint, callbackLessThan, callbackBiggerThan) {
        const mediaQuery = window.matchMedia(`(min-width: ${breakpoint}px)`)
        function handleBreakpointCross(e) {
            // Check if the media query is true
            if (e.matches) {
                callbackBiggerThan()
            } else {
                callbackLessThan()
            }
        }
        // Register event listener
        mediaQuery.addListener(handleBreakpointCross)

        // Initial check
        handleBreakpointCross(mediaQuery)
    }
    // меняют класс акстивности в сетах
    changeActivitySet(set, index, activeClass = `active`) {
        set.forEach(e => e.classList.remove(activeClass))
        set[index].classList.add(activeClass)
    }
    changeActivityElement(el, activeClass = `active`) {
        el.parentElement.childNodes.forEach(e => e.classList.remove(activeClass))
        el.parentElement.children[this.showIndex(el, el.parentElement.children)].classList.add(activeClass)
    }

    // возвр. индекс элемента в сете
    indexOfElements(el, set) {
        return [...set].indexOf(el)
    }
    
    // при любом изменении слайда возвращает его индекс в CB функцию
    sliderSpy(slider, callback = (index) => {}) {
        document.querySelectorAll(`${slider} .uk-slider-items > li`).forEach((el, idx) => {
            el.addEventListener(`beforeitemshow`, (event) => {
                const target = event.target
                callback([...target.parentElement.children].indexOf(target))
            })
        })
    }
}

class Quiz extends App {
    constructor({
        selector,
        autoMoveDelay = 0,
        activeClass = `quiz-active`,
        startSlide = 0
    } = {}) {
        super()
        this.selector = selector
        this.autoMoveDelay = autoMoveDelay
        this.activeClass = activeClass

        this.currentSlide = startSlide

        this.setOfSlides = document.querySelectorAll(`${selector} .quiz-slide`)
        this.numberOfSlides = this.setOfSlides.length
        this.lastIndex = this.numberOfSlides - 1
        this.quiz = document.querySelector(this.selector)

    }

    create () {
        this.toSlide(this.currentSlide)

        this.quiz.querySelectorAll(`.quiz-radio`).forEach( (elem, idx, parent) => {
            elem.addEventListener(`click`, (event) => {
                const target = event.currentTarget
                target.closest(`.quiz-radio-wrap`).querySelectorAll(`.quiz-radio`).forEach(e => e.classList.remove(this.activeClass))
                target.classList.add(this.activeClass)
                // setTimeout( () => this.toNextSlide(), this.autoMoveDelay)
                this.toNextSlide()
            })
        })

        // bind action on buttons prev/next
        this.quiz.querySelector(`.quiz-btn-prev`).addEventListener(`click`, ev => {
            this.toPrevSlide()
        })
        this.quiz.querySelector(`.quiz-btn-next`).addEventListener(`click`, ev => {
            this.toNextSlide()
        })
        
    }

    refreshValues() {
        this.quiz.querySelector(`.quiz-progress-bar`).style.cssText = `width: ${100 / (this.numberOfSlides - 1) * this.currentSlide}%`
        this.quiz.querySelector(`.quiz-progress-num`).innerText = this.currentSlide + 1

        if (this.currentSlide === this.lastIndex) {
            // финальный слайд
            this.onFinalSlideShow()
            this.quiz.querySelectorAll(`.quiz-final-hide`).forEach(el => el.classList.add(`hidden`))
            this.quiz.querySelectorAll(`.quiz-final-show`).forEach(el => el.classList.remove(`hidden`))

            if (window.innerWidth < this.lg) {
                //изменение высот
                // this.quiz.querySelector(`.quiz-slide-wrap`).style.cssText = `height: 27rem`
            }
            
        } else {
            // остальные слайды
            this.quiz.querySelectorAll(`.quiz-final-hide`).forEach(el => el.classList.remove(`hidden`))
            this.quiz.querySelectorAll(`.quiz-final-show`).forEach(el => el.classList.add(`hidden`))

            if (window.innerWidth < this.lg) {
                //изменение высот
                // this.quiz.querySelector(`.quiz-slide-wrap`).style.cssText = `
                // height: ${this.quiz.querySelector(`.quiz-slide.${this.activeClass} .quiz-radio-wrap`).clientHeight + this.quiz.querySelector(`.quiz-slide.${this.activeClass} h3`).clientHeight + 30}px`
            }
            
        }
        
    }

    toNextSlide() {
        if (this.currentSlide < this.lastIndex) {
            this.toSlide(this.currentSlide + 1)
        } else {
            console.error(`Error in Quiz.toNextSlide(): last slide cannot be passed`)
        }
        
    }

    toPrevSlide() {
        if (this.currentSlide > 0) {
            this.toSlide(this.currentSlide - 1)
        } else {
            console.error(`Error in Quiz.toPrevSlide(): first slide cannot be passed`)
        }
    }

    toSlide(position) {
        if (position >= 0 && position <= this.lastIndex) {
            this.setOfSlides[this.currentSlide].classList.remove(this.activeClass)
            this.currentSlide = position
            this.setOfSlides[this.currentSlide].classList.add(this.activeClass)

            this.refreshValues()
        } else {
            console.error(`Error in Quiz.toSlide(): position is invalid`)
        }
    }

    onFinalSlideShow() {
        this.quiz.querySelector(`form .values`).innerHTML = ``
        this.quiz.querySelectorAll(`.quiz-slide`).forEach((el) => {
            let list = []
            el.querySelectorAll(`.${this.activeClass}`).forEach(e => list.push(e.getAttribute("data-value")))
            this.quiz.querySelector(`form .values`).insertAdjacentHTML('beforeend', `<input type="hidden" name="${el.getAttribute(`data-title`)}" value="${list.join(`, `)}">`)
        })
        
    }

    reset() {
        this.toSlide(0)
    }


}

class Form extends App {
    constructor() {
        super()
        this.selectorMessages = `.messages`
        this.classHasError = `has-error`
        this.classHasSuccess = `has-success`
        this.formInput = `.input-wrap`
        this.disableIMask = false,
        this.disableMessages = true,
        this.removeErrorOnFocus = true,
        this.constraints = {
            email: {
              // Email is required
              presence: true,
              // and must be an email (duh)
              email: true
            },
            password: {
              // Password is also required
              presence: true,
              // And must be at least 5 characters long
              length: {
                minimum: 5
              }
            },
            "confirm-password": {
              // You need to confirm your password
              presence: true,
              // and it needs to be equal to the other password
              equality: {
                attribute: "password",
                message: "^The passwords does not match"
              }
            },
            "Имя": {
              // You need to pick a username too
              presence: true,
              // And it must be between 3 and 20 characters long
              length: {
                minimum: 3,
                maximum: 20
              },
              format: {
                // We don't allow anything that a-z and 0-9
                pattern: "[А-яA-z ]+",
                // but we don't care if the username is uppercase or lowercase
                flags: "i",
                message: "Только русские буквы"
              }
            },
            // birthdate: {
            //   // The user needs to give a birthday
            //   presence: true,
            //   // and must be born at least 18 years ago
            //   date: {
            //     latest: moment().subtract(18, "years"),
            //     message: "^You must be at least 18 years old to use this service"
            //   }
            // },
            country: {
              // You also need to input where you live
              presence: true,
              // And we restrict the countries supported to Sweden
              inclusion: {
                within: ["SE"],
                // The ^ prevents the field name from being prepended to the error
                message: "^Sorry, this service is for Sweden only"
              }
            },
            zip: {
              // Zip is optional but if specified it must be a 5 digit long number
              format: {
                pattern: "\\d{5}"
              }
            },
            "number-of-children": {
              presence: true,
              // Number of children has to be an integer >= 0
              numericality: {
                onlyInteger: true,
                greaterThanOrEqualTo: 0
              }
            },
            "Телефон": {
                presence: true
            }
        }
    }

    init(form = `form`) {
        this.disableIMask || this.phoneMask(form)

        // Hook up the form so we can prevent it from being posted
        document.querySelectorAll(form).forEach(el => {
            el.addEventListener(`submit`, ev => {
                ev.preventDefault();
                this.handleFormSubmit(el)
            });
        });

        // Hook up the inputs to validate on the fly
        document.querySelectorAll(`${form} input, ${form} textarea, ${form} select`).forEach((el) => {
            el.addEventListener("change", ev => {

                const target = ev.target
                const currentForm = target.closest(form)
                const errors = validate(currentForm, this.formConstraints(currentForm)) || {}
                this.showErrorsForInput(target, errors[target.name])
            });
            if (this.removeErrorOnFocus) {
                el.addEventListener('focus', ev => {
                    ev.target.closest(this.formInput).classList.remove(this.classHasError)
                });
            }
        })

    }


    phoneMask(form) {
        let mask
        document.querySelectorAll(`${form} input.phone`).forEach((e) => {
            e.addEventListener(`focusin`, () => {
                mask = IMask(
                    e, {
                        mask: `+7 (000) 000-00-00`,
                        startsWith: `7`,
                        lazy: false,
                        country: `Russia`
                    })
            })
            e.addEventListener(`focusout`, () => {
                if (mask.value.match(/_/g) != null) {
                    e.value = null
                    e.parentElement.classList.remove(`complete`)
                } else {
                    e.parentElement.classList.add(`complete`)
                }
                mask.destroy()

                e.classList.remove(`focus`)
                e.parentElement.classList.remove(`focus`)
            })
        })
    }

    handleFormSubmit(form, input) {
        // validate the form against the constraints
        
        let errors = validate(form, this.formConstraints(form));
        // then we update the form to reflect the results
        this.showErrors(form, errors || {});
        if (!errors) {
            this.showSuccess(form);
        }
    }

    // Updates the inputs with the validation errors
    showErrors(form, errors) {
        // We loop through all the inputs and show the errors for that input
          // Since the errors can be null if no errors were found we need to handle
          // that
        form.querySelectorAll("input[name], select[name]").forEach(input => this.showErrorsForInput(input, errors && errors[input.name]))
    }

      // Shows the errors for a specific input
    showErrorsForInput(input, errors) {
        // This is the root of the input
        let formGroup = input.closest(this.formInput)
          // Find where the error messages will be insert into
        let messages = null
        if (formGroup != null) {
            if (!this.disableMessages) {
                messages = formGroup.querySelector(this.selectorMessages)
            }
            // First we remove any old messages and resets the classes
            this.resetFormGroup(formGroup);
            // If we have errors
            if (errors) {
              // we first mark the group has having errors
              formGroup.classList.add(this.classHasError);
              // then we append all the errors
              errors.forEach(error => this.addError(error, messages))
            } else {
              // otherwise we simply mark it as success
              formGroup.classList.add(this.classHasSuccess);
            }
        }
    }

    

    resetFormGroup(formGroup) {
        // Remove the success and error classes
        formGroup.classList.remove(this.classHasError);
        formGroup.classList.remove(this.classHasSuccess);
        // and remove any old messages
        formGroup.querySelectorAll(".help-block.error").forEach(el => el.parentNode.removeChild(el))
    }

      // Adds the specified error with the following markup
      // <p class="help-block error">[message]</p>
    addError(error, messages) {
        const block = document.createElement("p");
        block.classList.add("help-block");
        block.classList.add("error");
        block.innerText = error;
        if (!this.disableMessages && messages != null) {
            messages.appendChild(block);
        }
        
    }

    showSuccess(form) {
        const formData = new FormData(form)
        
        // if (form.classList.contains(`form-quiz`)) {
        //     ym(71270149,'reachGoal','quiz')
        // } else {
        //     ym(71270149,'reachGoal','form')
        // }
        UIkit.modal(`#thanks`).show();

        fetch(`${this._apiBase}mail.php`, {
            method: 'post',
            body: formData,
            mode: 'no-cors'
        }).then(response => {
            // console.log(response)
            return response.text()
        }).then(text => {
            // console.log(text)
        }).catch(error => {
            console.error(error)
        })
    }

    formConstraints(form) {
        let localConstraints = {}
        form.querySelectorAll(`input[name], select[name]`).forEach(e => {
            if (this.constraints[e.name] != undefined) {
                localConstraints[e.name] = this.constraints[e.name]
            }
            
        })
        return localConstraints
    }
    
}



export { App, Quiz, Form }
