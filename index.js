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
    x: canvas.width / 2,
    y: canvas.height / 2,
    update(delta) {
      this.x += (actions.right - actions.left) * 500 * delta
      this.y += (actions.backward - actions.forward) * 500 * delta
    },
    draw() {
      context.fillRect(this.x - 50, this.y - 100, 100, 200)
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
