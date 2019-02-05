const TITLE = 'Simon Says'
const LIGHT = 'light'
const HIDE = 'hide'
const CANCELED = -1

const lightBlue = document.getElementById('lightBlue')
const violet = document.getElementById('violet')
const orange = document.getElementById('orange')
const green = document.getElementById('green')
const btnStart = document.getElementById('btnStart')

const gameOpts = {
    buttons: {
        cancel: 'Cancel',
        easy: { text: 'Easy', value: 'easy' },
        normal: { text: 'Normal', value: 'normal' },
        hard: { text: 'Hard', value: 'hard' },
        easy: true
    }
}

window.wins = 0
window.loses = 0

class Game {
    constructor(difficult, onSuccess, onFailure) {
        this.level = 1
        this.subLevel = 0
        this.difficult = difficult
        this.onSuccess = onSuccess
        this.onFailure = onFailure
        this.sequence = this.generateSequence()
        this.colors = { lightBlue, violet, orange, green }
        this.colorsKeys = Object.keys(this.colors)

        this.nextLevel = this.nextLevel.bind(this)
        this.onColorUp = this.onColorUp.bind(this)
        this.onColorDown = this.onColorDown.bind(this)
        this.onColorLeave = this.onColorLeave.bind(this)
    }

    start() {
        this.nextLevel()
    }

    generateSequence() {
        return new Array(this.difficult)
            .fill(0)
            .map(() => Math.floor(Math.random() * 4))
            .map(this.toColor)
    }

    nextLevel() {
        this.subLevel = 0
        this.illuminateSequence()
    }

    toColor(color) {
        switch (color) {
            case 0: return 'lightBlue'
            case 1: return 'violet'
            case 2: return 'orange'
            case 3: return 'green'
        }
    }

    illuminateSequence(index = 0) {
        if (index < this.level) {
            const color = this.sequence[index]
            return setTimeout(() => {
                this.illuminateColor(color)
                this.illuminateSequence(index + 1)
            }, 1000)
        }

        this.addEvents()
    }

    illuminateColor(color) {
        this.colors[color].classList.add(LIGHT)
        setTimeout(() => this.shutdownColor(color), 350)
    }

    shutdownColor(color) {
        this.colors[color].classList.remove(LIGHT)
    }

    addEvents() {
        this.colorsKeys.forEach(colorName => {
            const color = this.colors[colorName]

            color.addEventListener('mouseup', this.onColorUp)
            color.addEventListener('mousedown', this.onColorDown)
            color.addEventListener('mouseleave', this.onColorLeave)
        })
    }

    removeEvents() {
        this.colorsKeys.forEach(colorName => {
            const color = this.colors[colorName]

            color.removeEventListener('mouseup', this.onColorUp)
            color.removeEventListener('mousedown', this.onColorDown)
            color.removeEventListener('mouseleave', this.onColorLeave)
        })
    }

    onColorDown(ev) {
        const color = ev.target.dataset.color
        this.colors[color].classList.add(LIGHT)
    }

    onColorLeave(ev) {
        const color = ev.target.dataset.color

        if (this.colors[color].classList.contains(LIGHT)) {
            this.shutdownColor(color)
        }
    }

    onColorUp(ev) {
        const color = ev.target.dataset.color
        this.shutdownColor(color)

        if (color !== this.sequence[this.subLevel]) {
            this.removeEvents()
            return this.onFailure()
        }

        this.subLevel++
        if (this.subLevel === this.level) {
            this.level++

            this.removeEvents()

            if (this.level === (this.difficult + 1)) {
                return this.onSuccess()
            }

            setTimeout(this.nextLevel, 350)
        }
    }
}

function play() {
    showAlert(`Please choose the difficulty`, gameOpts).then(startGame)
}

function startGame(userChoose) {
    const difficult = difficultMode(userChoose)

    if (difficult != CANCELED) {
        window.hideStartBtn()
        window.game = new Game(difficult, onSuccess, onFailure)
        window.game.start()
        return;
    }
}

function difficultMode(userChoose) {
    switch (userChoose) {
        case 'easy': return 5
        case 'normal': return 10
        case 'hard': return 20
        default: return CANCELED
    }
}

function onSuccess() {
    window.wins += 1
    showAlert(`Cool, This is your win number ${window.wins}!`, 'success').then(() => showStartBtn())
}

function onFailure() {
    window.loses += 1
    showAlert(`Ouch, This is your Lose number ${window.loses}!`, 'error').then(() => showStartBtn())
}

function showAlert(message, opts) {
    return swal(TITLE, message, opts)
}

function hideStartBtn() {
    btnStart.classList.add(HIDE)
}

function showStartBtn() {
    btnStart.classList.remove(HIDE)
}