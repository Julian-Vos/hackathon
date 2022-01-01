(() => {
  'use strict'

  const notification = document.getElementById('notification')
  const dialogSpan = document.querySelector('.dialog-right > span')

  const canvas = document.getElementsByTagName('canvas')[0]
  const context = canvas.getContext('2d', { alpha: false })

  function fitCanvasToViewPort() {
    canvas.width = innerWidth * devicePixelRatio
    canvas.height = innerHeight * devicePixelRatio

    context.strokeStyle = 'white'
  }

  fitCanvasToViewPort()
  addEventListener('resize', fitCanvasToViewPort)

  const images = Object.fromEntries([
    'PlaneetA',
    'PlaneetCATNIP',
    'PlaneetEVIL',
    'PlaneetMELK',
    'PlaneetPLAKBAND',
    'Ruimteschip1',
    'Ruimteschip2',
    'Ruimteschip3',
    'Ruimteschip4',
    'Ruimteschip5',
    'Ruimteschip6',
    'Sterren1',
    'Sterren2'
  ].map((filename) => {
    const image = new Image()

    image.src = `images/${filename}.png`

    return [filename, image]
  }))

  const sounds = Object.fromEntries([
    ['Engine', 0]
  ].map(([filename, volume]) => {
    const sound = new Audio(`sounds/${filename}.wav`)

    sound.volume = volume

    return [filename, sound]
  }))

  sounds.Engine.addEventListener('timeupdate', () => {
    if (sounds.Engine.currentTime > sounds.Engine.duration - 0.3) {
      sounds.Engine.currentTime = 0
      sounds.Engine.play()
    }
  })

  let engineFadeInterval

  function toggleEngineSound(wasStatic) {
    if (actions.forward === actions.backward) {
      if (!wasStatic) {
        clearInterval(engineFadeInterval)

        engineFadeInterval = setInterval(() => {
          if (sounds.Engine.volume > 0.01) {
            sounds.Engine.volume -= 0.05
          } else {
            clearInterval(engineFadeInterval)

            sounds.Engine.pause()

            player.bubbling = -1
          }
        }, 100)
      }
    } else {
      if (wasStatic) {
        clearInterval(engineFadeInterval)

        engineFadeInterval = setInterval(() => {
          if (sounds.Engine.volume < 0.49) {
            sounds.Engine.volume += 0.05
          } else {
            clearInterval(engineFadeInterval)
          }
        }, 100)

        sounds.Engine.play()

        player.bubbling = sounds.Engine.volume
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

          context.globalAlpha = Math.max(sounds.Engine.volume * 2 - y / (offset + 280), 0)
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
    constructor(image, x, y, dialogs) {
      image.addEventListener('load', () => {
        this.halfWidth = image.width / 2
        this.halfHeight = image.height / 2
      })

      this.image = image
      this.x = x
      this.y = y
      this.dialogs = dialogs
      this.dialog = -1
      this.dialogFunc = () => {
        if (this.dialog + 1 < this.dialogs.length && inventory.use(this.dialogs[this.dialog + 1].requires)) {
          inventory.add(this.dialogs[++this.dialog].receives)
        }

        dialogSpan.innerHTML = `"${this.dialogs[this.dialog].html}"`
        dialogSpan.style.setProperty('--n', dialogSpan.textContent.length)

        notificationFunc()
      }
    }

    update() {
      if (Math.abs(player.x - this.x) <= this.halfWidth && Math.abs(player.y - this.y) <= this.halfHeight) {
        if (!this.visited) {
          this.visited = true

          notification.classList.add('active')
          notification.onclick = this.dialogFunc
        }
      } else {
        if (this.visited) {
          this.visited = false

          notification.classList.remove('active')
          notification.removeAttribute('onclick')
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
        html: 'START TEXT',
      }, {
        requires: ['kitten1', 'kitten2', 'kitten3', 'kitten4', 'kitten5'],
        html: 'END TEXT'
      }
    ]),
    new Planet(images.PlaneetMELK, 2000, 0, []),
    new Planet(images.PlaneetEVIL, -4000, 0, [
      {
        html: "You want to get some MILKYWAY MILK®? Yeah I guess I can help you with that, maybe...<br><br>Why don't you fetch me some of that sweet catnip? And then I'll think about it..."
      }, {
        requires: ['catnip'],
        html: 'YES! Some sweet catnip. Thanks pawl!<br><br>Oh, some milk you said? Alright, the pump is yours.<br><br>Also, is this your kitten? I found her sleeping in my cave. Now keep her close, alright? These are the dark corners of the universe.',
        receives: ['kitten2']
      }
    ]),
    new Planet(images.PlaneetPLAKBAND, 4000, 0, [
      {
        html: "Why hello there, a fellow pawrent! Aren't they just the sweetest?<br><br>You what? Lost your kittens? Oh dear...<br><br>I would help you look for them, but I really have to get these babies some milk.",
      }, {
        requires: ['milk'],
        html: "You got me milk for my babies! You're a great help. Thanks so much! You know how busy it gets...<br><br>Hey, I just counted my babies and I got a +1, he must be yours. On your way now!",
        receives: ['kitten3']
      }, {
        requires: ['box'],
        html: "FIX BOX TEXT"
      }
    ]),
    new Planet(images.PlaneetCATNIP, -2000, 0, [
      {
        html: "Oh finally! You're just on time! I have been trying to get this kitten out of the tree for hours, but she just won't move.<br><br>She is yours? So this is all your fault! You better repay me for my efforts.",
        receives: ['kitten4']
      }, {
        requires: ['flowers'],
        html: 'Hey you! Are you here to lose your kitten again?!<br><br>Wha? You got me flowers? Oh... Thank you so much!<br><br>Sorry for being rude before. It just gets so lonely here you know...'
      }
    ])
  ]

  const inventory = {
    items: [],
    add(items = []) {
      for (const item of items) {
        this.items.push(item)

        // add item's image to UI
      }
    },
    use(items = []) {
      const indices = []

      for (const item of items) {
        indices.unshift(this.items.indexOf(item))

        if (indices[0] === -1) {
          return false
        }
      }

      for (const index of indices) {
        this.items.splice(index, 1)

        // remove item's image from UI
      }

      return true
    }
  }

  let previousTime = performance.now()

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

    player.draw()

    context.translate(cameraX, cameraY)

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
})()
