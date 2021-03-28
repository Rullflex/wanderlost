import 'lazysizes'
import UIkit from 'uikit'
import { App } from '../../modules/scripts/_core'


document.addEventListener(`DOMContentLoaded`, function () {
    const app = new App()
    app.init()
    UIkit.scrollspy(`#video`)
    document.querySelector(`#video`).addEventListener(`inview`, (event) => {
        document.querySelector(`#video .popup__body`).insertAdjacentHTML(`beforeend`, `<iframe class="embed-responsive-item" src="https://www.youtube-nocookie.com/embed/0I7rYotTip4" frameborder="0" allowfullscreen="true" data-uk-video data-uk-responsive"></iframe>`)
    })
})
