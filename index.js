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
    x: canvas.width / 2,
    y: canvas.height / 2,
    update(delta) {
      this.direction += (actions.left - actions.right) * 0.5 * Math.PI * delta

      this.speed += (actions.forward - actions.backward) * 1000 * delta
      this.speed = Math.min(Math.max(this.speed * Math.pow(0.15, delta), -750), 750)

      this.x += Math.cos(this.direction) * this.speed * delta
      this.y -= Math.sin(this.direction) * this.speed * delta
    },
    draw() {
      context.translate(this.x, this.y)
      context.rotate(-this.direction)
      context.fillRect(-100, -50, 200, 100)
      context.resetTransform()
    }
  }

  let previousTime = performance.now()

  function loop(currentTime) {
    player.update((currentTime - previousTime) / 1000)
    previousTime = currentTime

    context.clearRect(0, 0, canvas.width, canvas.height)
    player.draw()

    requestAnimationFrame(loop)
  }

  requestAnimationFrame(loop)
})()
