(() => {
  'use strict'

  const canvas = document.getElementsByTagName('canvas')[0]
  const context = canvas.getContext('2d')

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
      this.speed = Math.min(Math.max(this.speed * Math.pow(0.15, delta), -750), 750)

      this.x += Math.cos(this.direction) * this.speed * delta
      this.y -= Math.sin(this.direction) * this.speed * delta
    },
    draw(camera) {
      context.translate(this.x - camera.x, this.y - camera.y)
      context.rotate(-this.direction)
      context.fillRect(-100, -50, 200, 100)
      context.rotate(this.direction)
      context.translate(-this.x + camera.x, -this.y + camera.y)
    }
  }

  let previousTime = performance.now()

  function loop(currentTime) {
    player.update((currentTime - previousTime) / 1000)
    previousTime = currentTime

    const camera = { x: player.x - canvas.width / 2, y: player.y - canvas.height / 2 }

    context.clearRect(0, 0, canvas.width, canvas.height)
    player.draw(camera)

    context.translate(-camera.x, -camera.y)
    context.fillRect(-25, -25, 50, 50)
    context.translate(camera.x, camera.y)

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
})()
