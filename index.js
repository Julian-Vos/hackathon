(() => {
  'use strict'

  const canvas = document.getElementsByTagName('canvas')[0]
  const context = canvas.getContext('2d', { alpha: false })

  function fitCanvasToViewPort() {
    canvas.width = innerWidth * devicePixelRatio
    canvas.height = innerHeight * devicePixelRatio
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
    boxes: 0,
    update(delta) {
      this.direction += (actions.left - actions.right) * 0.5 * Math.PI * delta

      this.speed += (actions.forward - actions.backward) * 500 * delta
      this.speed = Math.min(Math.max(this.speed * Math.pow(0.25, delta), -500), 500)

      this.x = Math.min(Math.max(this.x + Math.cos(this.direction) * this.speed * delta, -7200), 7200)
      this.y = Math.min(Math.max(this.y - Math.sin(this.direction) * this.speed * delta, -4500), 4500)
    },
    draw() {
      context.translate(this.x, this.y)
      context.rotate(0.5 * Math.PI - this.direction)

      const image = images[`Ruimteschip${this.boxes + 1}`]

      context.drawImage(image, -image.width / 2, -image.height / 2)

      context.rotate(this.direction - 0.5 * Math.PI)
      context.translate(-this.x, -this.y)
    }
  }

  class Planet {
    constructor(image, x, y) {
      image.addEventListener('load', () => {
        this.halfWidth = image.width / 2
        this.halfHeight = image.height / 2
      })

      this.image = image
      this.x = x
      this.y = y
      this.visited = false
    }

    update() {
      if (Math.abs(player.x - this.x) > this.halfWidth || Math.abs(player.y - this.y) > this.halfHeight) {
        this.visited = false
      } else if (!this.visited) {
        this.visited = true

        console.log('puss notification')

        var notification = document.getElementById("notification");
        notification.classList.toggle("active");
      }
    }

    draw() {
      context.drawImage(this.image, this.x - this.halfWidth, this.y - this.halfHeight)
    }
  }

  const planets = [
    new Planet(images.PlaneetEVIL, -4000, 0),
    new Planet(images.PlaneetCATNIP, -2000, 0),
    new Planet(images.PlaneetA, 0, 0),
    new Planet(images.PlaneetMELK, 2000, 0),
    new Planet(images.PlaneetPLAKBAND, 4000, 0)
  ]

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
