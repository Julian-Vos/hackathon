'use strict'

const welcomeContainer = document.getElementById('welcome-container')
const kittenSpan = document.getElementById('kitten-span')
const notification = document.getElementById('notification')
const inventoryContainer = document.getElementById('inventory')
const dialogImg = document.querySelector('.dialog-left > img')
const dialogSpan = document.querySelector('.dialog-right > span')
const dialogNext = document.querySelector('.dialog-right > div')
const itemSlots = document.getElementsByClassName('item-slot')

const canvas = document.getElementsByTagName('canvas')[0]
const context = canvas.getContext('2d', { alpha: false })

function fitCanvasToViewPort() {
  canvas.width = innerWidth * devicePixelRatio
  canvas.height = innerHeight * devicePixelRatio

  context.strokeStyle = 'white'
}

fitCanvasToViewPort()
addEventListener('resize', fitCanvasToViewPort)

let assetsToDownload = 0

const images = Object.fromEntries([
  'Doos',
  'PlaneetA',
  'PlaneetCATNIP',
  'PlaneetEVIL',
  'PlaneetMELK',
  'PlaneetPLAKBAND',
  'PlaneetWOL',
  'PortretCATNIP',
  'PortretCRIMINEEL',
  'PortretHOARDER',
  'PortretKATSTRONAUT',
  'PortretMOEDER',
  'PortretTANK',
  'Ruimteschip1',
  'Ruimteschip2',
  'Ruimteschip3',
  'Ruimteschip4',
  'Ruimteschip5',
  'Ruimteschip6',
  'Sterren1',
  'Sterren2'
].map((filename) => {
  assetsToDownload++

  const image = new Image()

  image.addEventListener('load', startableWhenReady, { once: true })
  image.src = `images/${filename}.png`

  return [filename, image]
}))

images.Doos.addEventListener('load', () => {
  Box.halfWidth = images.Doos.width / 2
  Box.halfHeight = images.Doos.height / 2
}, { once: true })

const sounds = Object.fromEntries([
  ['catstronaut_theme', 0.6, 'mp3'],
  ['criminal_cat_meow', 0.7],
  ['engine', 0],
  ['game_complete_purring', 1, 'mp3'],
  ['item_received', 1],
  ['kitten_collected', 1],
  ['menu_close', 1],
  ['menu_open', 1],
  ['mouse_over_effect_short', 1],
  ['no_space_for_kitten', 1],
  ['notification', 0.8],
  ['ship_upgrade', 1],
  ['starting_game', 0.9],
  ['typewriter', 1]
].map(([filename, volume, extension = 'wav']) => {
  assetsToDownload++

  const sound = new Audio(`sounds/${filename}.${extension}`)

  sound.addEventListener('canplaythrough', startableWhenReady, { once: true })
  sound.volume = volume

  return [filename, sound]
}))

sounds.engine.addEventListener('timeupdate', () => {
  if (sounds.engine.currentTime > sounds.engine.duration - 0.5) {
    sounds.engine.currentTime = 0
    sounds.engine.play()
  }
})

let engineFadeInterval

function toggleEngineSound(wasStatic) {
  if (actions.forward === actions.backward) {
    if (!wasStatic) {
      clearInterval(engineFadeInterval)

      engineFadeInterval = setInterval(() => {
        if (sounds.engine.volume > 0.01) {
          sounds.engine.volume -= 0.05
        } else {
          clearInterval(engineFadeInterval)

          sounds.engine.pause()

          player.bubbling = -1
        }
      }, 100)
    }
  } else {
    if (wasStatic) {
      clearInterval(engineFadeInterval)

      engineFadeInterval = setInterval(() => {
        if (sounds.engine.volume < 0.49) {
          sounds.engine.volume += 0.05
        } else {
          clearInterval(engineFadeInterval)
        }
      }, 100)

      sounds.engine.play()

      player.bubbling = sounds.engine.volume * 2
    }
  }
}

const actions = { forward: false, backward: false, left: false, right: false }
const keys = {
  ArrowUp: 'forward', w: 'forward',
  ArrowDown: 'backward', s: 'backward',
  ArrowLeft: 'left', a: 'left',
  ArrowRight: 'right', d: 'right'
}

document.addEventListener('keydown', (event) => {
  if (!event.repeat && keys.hasOwnProperty(event.key)) {
    const wasStatic = actions.forward === actions.backward

    actions[keys[event.key]] = true

    toggleEngineSound(wasStatic)
  }
})

document.addEventListener('keyup', (event) => {
  if (!event.repeat && keys.hasOwnProperty(event.key)) {
    const wasStatic = actions.forward === actions.backward

    actions[keys[event.key]] = false

    toggleEngineSound(wasStatic)
  }
})

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    const wasStatic = actions.forward === actions.backward

    for (const action in actions) {
      actions[action] = false
    }

    toggleEngineSound(wasStatic)
  }
})

const player = {
  direction: 0.5 * Math.PI,
  speed: 0,
  x: 0,
  y: 0,
  bubbling: -1,
  boxes: 0,
  update(delta) {
    this.direction += (actions.left - actions.right) * 0.5 * Math.PI * delta

    this.speed += (actions.forward - actions.backward) * 500 * delta
    this.speed = Math.min(Math.max(this.speed * Math.pow(0.25, delta), -500), 500)

    this.x = Math.min(Math.max(this.x + Math.cos(this.direction) * this.speed * delta, -7200), 7200)
    this.y = Math.min(Math.max(this.y - Math.sin(this.direction) * this.speed * delta, -4500), 4500)

    if (this.bubbling >= 1) {
      this.bubbling -= 0.2
    } else if (this.bubbling >= 0) {
      this.bubbling += delta
    }
  },
  draw() {
    context.translate(this.x, this.y)
    context.rotate(0.5 * Math.PI - this.direction)

    if (this.bubbling >= 0) {
      const offset = this.boxes === 0 ? -95 : 32

      for (let i = 0; i < 5; i++) {
        const y = offset + this.bubbling * 160 + i * 30

        context.globalAlpha = Math.max(sounds.engine.volume * 2 - y / (offset + 280), 0)
        context.beginPath()
        context.arc(0, y, 10, 0, 2 * Math.PI)
        context.stroke()
        context.globalAlpha = 1
      }
    }

    const image = images[`Ruimteschip${this.boxes + 1}`]

    context.drawImage(image, -image.width / 2, -image.height / 2)

    context.rotate(this.direction - 0.5 * Math.PI)
    context.translate(-this.x, -this.y)
  }
}

class Planet {
  constructor(image, x, y, dialogs, portrait) {
    image.addEventListener('load', () => {
      this.halfWidth = image.width / 2
      this.halfHeight = image.height / 2
    }, { once: true })

    this.image = image
    this.x = x
    this.y = y

    let current = -1

    const hasBoxForTape = () => {
      return image === images.PlaneetPLAKBAND && current === 1 && inventory.items.includes('box')
    }

    const fixTapeAfterKitten = () => {
      if (hasBoxForTape()) {
        dialogs[2].receives = () => {
          player.boxes++

          sounds.ship_upgrade.play()

          inventory.add(['kitten3'])
        }

        delete dialogs[1].receives

        return true
      }
    }

    const showNextButton = () => {
      return (
        (!dialogs[current].hasOwnProperty('receives') || hasBoxForTape())
        && current + 1 < dialogs.length
        && dialogs[current + 1].hasOwnProperty('requires')
        && dialogs[current + 1].requires.every((item) => inventory.items.includes(item))
      )
    }

    this.dialogFunc = () => {
      if (
        (current === -1 || !dialogs[current].hasOwnProperty('receives') || fixTapeAfterKitten())
        && current + 1 < dialogs.length
        && inventory.use(dialogs[current + 1].requires)
      ) {
        current++
      }

      const dialog = dialogs[current]
      let warning = ''

      if (dialog.hasOwnProperty('receives')) {
        if (Array.isArray(dialog.receives)) {
          if (dialog.receives.some((item) => item.startsWith('kitten')) && kittens === player.boxes) {
            warning = "<br><br><i>(This kitten won't fit in your spaceship. Maybe we can expand?)</i>"

            sounds.no_space_for_kitten.play()
          } else {
            inventory.add(dialog.receives)

            delete dialog.receives
          }
        } else {
          dialog.receives()

          delete dialog.receives
        }
      }

      dialogImg.src = portrait.src
      dialogSpan.innerHTML = `"${dialog.html}"${warning}`
      dialogSpan.style.setProperty('--n', dialogSpan.textContent.length)
      dialogNext.classList.toggle('show', showNextButton())

      notificationFunc()
    }
  }

  update() {
    if (Math.abs(player.x - this.x) <= this.halfWidth && Math.abs(player.y - this.y) <= this.halfHeight) {
      if (!this.visited) {
        this.visited = true

        notification.addEventListener('click', this.dialogFunc)
        notification.classList.add('active', 'openable')

        sounds.notification.play()
      }
    } else {
      if (this.visited) {
        this.visited = false

        notification.removeEventListener('click', this.dialogFunc)
        notification.classList.remove('active', 'openable')
      }
    }
  }

  draw() {
    context.drawImage(this.image, this.x - this.halfWidth, this.y - this.halfHeight)
  }
}

const planets = [
  new Planet(images.PlaneetA, 0, 0, [
    {
      html: 'Oh no! One, two, three, four... all FIVE of your kittens are missing?!<br><br>Where could those little rascals be hiding?<br><br>Better find them right meow!'
    }, {
      requires: ['kitten1', 'kitten2', 'kitten3', 'kitten4', 'kitten5'],
      html: 'Alright: one, two, three, four... Five! The litter is complete again.<br><br>Cat-astrophe averted! We did it!',
      receives() {
        sounds.game_complete_purring.play()
      }
    }
  ], images.PortretKATSTRONAUT),
  new Planet(images.PlaneetWOL, 0, -2000, [
    {
      html: "What? A kitten? No haven't seen any. But then again, I constantly lose everything on this planet...<br><br>I do have this antique box though. What a treasure!",
      receives: ['box']
    }, {
      html: "Ah, you're back! Turns out your kitten was here after all. He was asleep in the yarn. Here you go!",
      receives: ['kitten1']
    }
  ], images.PortretHOARDER),
  new Planet(images.PlaneetMELK, 2000, 0, [
    {
      html: "MILKYWAY MILK™ station. This looks like the purrfect place to get some milk! But there's no one to operate the pump..."
    }, {
      requires: ['worker'],
      html: 'Ah the pump is now operative! Better get some milk for those hungry kittens.',
      receives: ['milk']
    }
  ], images.PortretTANK),
  new Planet(images.PlaneetEVIL, -4000, 0, [
    {
      html: "You want to get some MILKYWAY MILK™? Yeah I guess I can help you with that, maybe...<br><br>Why don't you fetch me some of that sweet catnip? And then I'll think about it..."
    }, {
      requires: ['catnip'],
      html: 'YES! Some sweet catnip. Thanks pawl!<br><br>Oh, some milk you said? Alright, the pump is yours.<br><br>Also, is this your kitten? I found her sleeping in my cave. Now keep her close, alright? These are the dark corners of the universe.',
      receives: ['worker', 'kitten2']
    }
  ], images.PortretCRIMINEEL),
  new Planet(images.PlaneetPLAKBAND, 4000, 0, [
    {
      html: "Why hello there, a fellow pawrent! Aren't they just the sweetest?<br><br>You what? Lost your kittens? Oh dear...<br><br>I would help you look for them, but I really have to get these babies some milk.",
    }, {
      requires: ['milk'],
      html: "You got me milk for my babies! You're a great help. Thanks so much! You know how busy it gets...<br><br>Hey, I just counted my babies and I got a +1, he must be yours.<br><br>Come back to tape-planet anytime you want!",
      receives: ['kitten3']
    }, {
      requires: ['box'],
      html: 'Number 1 rule on our planet: FTFF - free tape for felines! Your cardboard box is as good as new.',
      receives() {
        player.boxes++

        sounds.ship_upgrade.play()
      }
    }
  ], images.PortretMOEDER),
  new Planet(images.PlaneetCATNIP, -2000, 0, [
    {
      html: "Oh finally! You're just on time! I have been trying to get this kitten out of the tree for hours, but she just won't move.<br><br>She is yours? So this is all your fault! You better repay me for my efforts.",
      receives: ['kitten4']
    }, {
      requires: ['flowers'],
      html: 'Hey you! Are you here to lose your kitten again?!<br><br>Wha? You got me flowers? Oh... Thank you so much!<br><br>Sorry for being rude before. It just gets so lonely here you know...<br><br>Here, have some herbs. It will make you feel better in stressful times.',
      receives: ['catnip']
    }
  ], images.PortretCATNIP)
]

class Box {
  constructor(x, y) {
    this.x = x
    this.y = y
  }

  update() {
    if (Math.abs(player.x - this.x) <= Box.halfWidth && Math.abs(player.y - this.y) <= Box.halfHeight) {
      player.boxes++

      sounds.ship_upgrade.play()

      if (boxes.length === 3) {
        inventory.add(['flowers'])
      } else if (boxes.length === 1) {
        inventory.add(['kitten5'])
      }

      return true
    }
  }

  draw() {
    context.drawImage(images.Doos, this.x - Box.halfWidth, this.y - Box.halfHeight)
  }
}

const boxes = [
  new Box(0, 1000),
  new Box(0, 1500),
  new Box(0, 2000),
  new Box(0, 2500)
]

const inventory = {
  items: [],
  add(items) {
    for (const item of items) {
      if (item.startsWith('kitten')) {
        kittenSpan.textContent = ++kittens

        sounds.kitten_collected.play()
      } else if (item !== 'worker') {
        sounds.item_received.play()

        inventoryContainer.classList.add('wiggle')
        itemSlots[['milk', 'box', 'catnip', 'flowers'].indexOf(item)].classList.add('show')
      }

      this.items.push(item)
    }
  },
  use(items = []) {
    const indices = []

    for (const item of items) {
      indices.unshift([this.items.indexOf(item), item])

      if (indices[0][0] === -1) {
        return false
      }
    }

    for (const [index, item] of indices) {
      if (!item.startsWith('kitten') && item !== 'worker') {
        itemSlots[['milk', 'box', 'catnip', 'flowers'].indexOf(item)].classList.remove('show')

        this.items.splice(index, 1)
      }
    }

    return true
  }
}

let kittens = 0
let previousTime

function loop(currentTime) {
  player.update((currentTime - previousTime) / 1000)
  previousTime = currentTime

  const cameraX = Math.min(Math.max(player.x - canvas.width / 2, -7200), 7200 - canvas.width)
  const cameraY = Math.min(Math.max(player.y - canvas.height / 2, -4500), 4500 - canvas.height)
  const centerX = cameraX + canvas.width / 2
  const centerY = cameraY + canvas.height / 2

  context.fillStyle = '#000522'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.translate(-cameraX, -cameraY)

  context.drawImage(images.Sterren1, centerX / 1.6 - 3600, centerY / 1.6 - 2250, 7200, 4500)
  context.drawImage(images.Sterren2, centerX / 6 - 7200, centerY / 6 - 4500, 14400, 9000)

  for (const planet of planets) {
    planet.update()
    planet.draw()
  }

  for (let i = boxes.length - 1; i >= 0; i--) {
    if (boxes[i].update()) {
      boxes.splice(i, 1)
    } else {
      boxes[i].draw()
    }
  }

  player.draw()

  context.translate(cameraX, cameraY)

  requestAnimationFrame(loop)
}

function startableWhenReady() {
  if (--assetsToDownload === 0) {
    welcomeContainer.classList.add('loaded')

    document.getElementsByClassName('start-btn')[0].addEventListener('click', (event) => {
      welcomeContainer.classList.add('hide')

      previousTime = event.timeStamp

      requestAnimationFrame(loop)

      setTimeout(() => {
        sounds.catstronaut_theme.loop = true
        sounds.catstronaut_theme.play()
      }, 2000)
    }, { once: true })
  }
}
