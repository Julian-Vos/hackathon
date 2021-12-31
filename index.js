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

  const actions = { forward: false, backward: false, left: false, right: false }
  const keys = {
    ArrowUp: 'forward', w: 'forward',
    ArrowDown: 'backward', s: 'backward',
    ArrowLeft: 'left', a: 'left',
    ArrowRight: 'right', d: 'right'
  }

  document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
      actions[keys[event.key]] = true
    }
  })

  document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
      actions[keys[event.key]] = false
    }
  })

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      for (const action in actions) {
        actions[action] = false
      }
    }
  })

  const player = {
    direction: 0.5 * Math.PI,
    speed: 0,
    x: 0,
    y: 0,
    update(delta) {
      this.direction += (actions.left - actions.right) * 0.5 * Math.PI * delta

      this.speed += (actions.forward - actions.backward) * 1000 * delta
      this.speed = Math.min(Math.max(this.speed * Math.pow(0.25, delta), -750), 750)

      this.x = Math.min(Math.max(this.x + Math.cos(this.direction) * this.speed * delta, -1024 * 4), 1024 * 4)
      this.y = Math.min(Math.max(this.y - Math.sin(this.direction) * this.speed * delta, -691 * 4), 691 * 4)
    },
    draw() {
      context.translate(this.x, this.y)
      context.rotate(-this.direction)

      context.fillStyle = 'orange'
      context.fillRect(-100, -50, 200, 100)

      context.rotate(this.direction)
      context.translate(-this.x, -this.y)
    }
  }

  const images = Object.fromEntries([
    'stars1',
    'stars2'
  ].map((filename) => {
    const image = new Image()

    image.src = `images/${filename}.png`

    return [filename, image]
  }))

  let previousTime = performance.now()

  function loop(currentTime) {
    player.update((currentTime - previousTime) / 1000)
    previousTime = currentTime

    const cameraX = Math.min(Math.max(player.x - canvas.width / 2, -1024 * 4), 1024 * 4 - canvas.width)
    const cameraY = Math.min(Math.max(player.y - canvas.height / 2, -691 * 4), 691 * 4 - canvas.height)
    const centerX = cameraX + canvas.width / 2
    const centerY = cameraY + canvas.height / 2

    context.fillStyle = 'black'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.translate(-cameraX, -cameraY)

    context.drawImage(images.stars1, 1024 * 4 / -2 + centerX / 2, 691 * 4 / -2 + centerY / 2, 1024 * 4, 691 * 4)
    context.drawImage(images.stars2, 2992 * 2 / -2 + centerX / 4, 2500 * 2 / -2 + centerY / 4, 2992 * 2, 2500 * 2)

    context.beginPath()
    context.arc(0, 0, 500, 0, 2 * Math.PI)
    context.fillStyle = 'navy'
    context.fill()

    player.draw()

    context.translate(cameraX, cameraY)

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
})()
