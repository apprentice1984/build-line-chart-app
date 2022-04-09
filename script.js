const deleteButtons = document.querySelectorAll('.deleteBtn')
const addButtons = document.querySelectorAll('.addBtn')
const calculateButton = document.getElementById('calcBtn')
const resultTable = document.getElementById('resultTable')
const leftTable = document.getElementById('leftTable')
const rightTable = document.getElementById('rightTable')

//Навешивааем обработчики, которые будут обновлять  LS при вводе значений в поля
let tables = [leftTable, rightTable]

for (let table of tables) {
  table.querySelectorAll("input[type='number']").forEach((input) =>
    input.addEventListener('input', (e) => {
      updateLS()
    })
  )
}

//Инициализация таблиц значениями из LS, если locasstorage не пуст
if (
  localStorage.getItem('coords-left') ||
  localStorage.getItem('coords-right')
) {
  //Создаем таблицы на основе значений, хранящихся в LS
  createTables()

  //Навешиваем обработчики на кнопки в строках таблицы
  leftTable.querySelectorAll("input[type='number']").forEach((input) =>
    input.addEventListener('input', (e) => {
      updateLS()
    })
  )
  rightTable.querySelectorAll("input[type='number']").forEach((input) =>
    input.addEventListener('input', (e) => {
      updateLS()
    })
  )
}

//Проходим по всем кнопкам для удаления строк и вешаем обработчики на них
deleteButtons.forEach((deleteButton) => {
  deleteButton.addEventListener('click', deleteThisRow)
})

//Проходим по всем кнопкам Add и вешаем обработчики клика
addButtons.forEach((addButton) => {
  addButton.addEventListener('click', (e) => {
    e.preventDefault()
    let newRow = createNewRow()
    addButton.closest('tfoot').previousElementSibling.append(newRow)

    //Обновляем localstorage
    updateLS()
  })
})

//Функция для удаления строки из таблицы
function deleteThisRow(e) {
  e.preventDefault()

  //Удаляем заданную строку из DOM
  e.target.closest('tr').remove()

  //Обновляем localstorage
  updateLS()
}

//Функция для создания новой строки
function createNewRow() {
  let newRow = document.createElement('tr')
  newRow.innerHTML = `
              <td><input type="number" value="1" step="0.5" /></td>
              <td><input type="number" value="1" step="0.5" /></td>
              <td><button class="btn deleteBtn">Delete</button></td>`

  //Вешаем обработчики на кнопку удаления строки
  newRow.querySelector('.deleteBtn').addEventListener('click', deleteThisRow)
  newRow.querySelectorAll("input[type='number']").forEach((input) =>
    input.addEventListener('input', (e) => {
      updateLS()
    })
  )

  //Возвращаем новую строку
  return newRow
}

//Обработчик для расчета значений финальной(результирующей) таблицы
calculateButton.addEventListener('click', (e) => {
  e.preventDefault()

  //Выбираем таблицу с наименьшим количеством строк, кладем это значение в переменную
  let rowCount =
    leftTable.querySelectorAll('tbody>tr').length >
    rightTable.querySelectorAll('tbody>tr').length
      ? rightTable.querySelectorAll('tbody>tr').length
      : leftTable.querySelectorAll('tbody>tr').length

  //Очистим все строки в результирующей таблице
  resultTable.querySelector('tbody').innerHTML = ''

  //Проходим по циклу rowCount раз, создавая новые строки и вычисляя значения для расчетной таблицы
  for (let i = 0; i < rowCount; i++) {
    //Создаем строку и разметку для нее
    let newRow = document.createElement('tr')
    newRow.innerHTML = `
              <td><input type="number" value="${
                (+leftTable
                  .querySelectorAll('tbody>tr')
                  [i].querySelector('td>input').value +
                  +rightTable
                    .querySelectorAll('tbody>tr')
                    [i].querySelector('td>input').value) /
                2
              }" step="0.5" /></td>
              <td><input type="number" value="${
                (+leftTable
                  .querySelectorAll('tbody>tr')
                  [i].querySelector('td:nth-of-type(2)>input').value +
                  +rightTable
                    .querySelectorAll('tbody>tr')
                    [i].querySelector('td:nth-of-type(2)>input').value) /
                2
              }" step="0.5" /></td>`

    //добавляем созданную строку в таблицу
    resultTable.querySelector('tbody').append(newRow)
  }

  //Строим линейные графики для всех таблиц
  let chart1 = new LineChart({ data: [] })
  let chart2 = new LineChart({ data: [], canvas: 'canvas2' })
  let chart3 = new LineChart({ data: [], canvas: 'canvas3' })

  let charts = [chart1, chart2, chart3]

  //Здесь получаем значения для графиков и кладем их в переменные
  let yCoords1 = localStorage
    .getItem('coords-left')
    .split(',')
    .filter((_, idx) => idx % 2 !== 0)

  let yCoords2 = localStorage
    .getItem('coords-right')
    .split(',')
    .filter((_, idx) => idx % 2 !== 0)

  let yCoords3 = [...resultTable.querySelectorAll('input')].map(
    (item) => item.value
  )
  yCoords3 = yCoords3.filter((item, idx) => idx % 2 !== 0)

  let yCoords = [yCoords1, yCoords2, yCoords3]

  for (let i = 0; i < charts.length; i++) {
    reset()

    charts[i].start()

    function append() {
      charts[i].append([
        { label: 'Rnd', value: 500 + Math.random() * 500, future: true },
      ])
    }

    function restart() {
      charts[i].restart()
    }

    function reset() {
      charts[i].populate(
        yCoords[i].map((item) => {
          return { label: 'Y', value: item }
        })
      )
    }
  }
})

//Функция обновления localstorage
function updateLS() {
  //Создаем 2 записи в LS - для левой и правой таблиц
  localStorage.setItem('coords-left', getCoordsFromTables(leftTable))
  localStorage.setItem('coords-right', getCoordsFromTables(rightTable))
}

//Собрать координаты из таблиц 1 и 2
function getCoordsFromTables(table) {
  let coordsArr = []

  table.querySelectorAll("input[type='number']").forEach((input) => {
    coordsArr.push(input.value)
  })

  return coordsArr
}

//Функция, которая создает таблицы на основе
function createTables() {
  leftTable.querySelector('tbody').innerHTML = ''
  rightTable.querySelector('tbody').innerHTML = ''

  let coordsLeft = localStorage.getItem('coords-left').split(',')
  let coordsRight = localStorage.getItem('coords-right').split(',')

  for (let i = 0; i < coordsLeft.length; ) {
    let newRow = document.createElement('tr')
    newRow.innerHTML = `
              <td><input type="number" value="${
                coordsLeft[i]
              }" step="0.5" /></td>
              <td><input type="number" value="${
                coordsLeft[i + 1]
              }" step="0.5" /></td>
              <td><button class="btn deleteBtn">Delete</button></td>`
    newRow.querySelector('.deleteBtn').addEventListener('click', deleteThisRow)
    leftTable.querySelector('tbody').append(newRow)
    i = i + 2
  }

  for (let i = 0; i < coordsRight.length; ) {
    let newRow = document.createElement('tr')
    newRow.innerHTML = `
              <td><input type="number" value="${
                coordsRight[i]
              }" step="0.5" /></td>
              <td><input type="number" value="${
                coordsRight[i + 1]
              }" step="0.5" /></td>
              <td><button class="btn deleteBtn">Delete</button></td>`
    newRow.querySelector('.deleteBtn').addEventListener('click', deleteThisRow)
    rightTable.querySelector('tbody').append(newRow)
    i = i + 2
  }
}

// ЗДЕСЬ УЖЕ ИДЕТ РАБОТА С ПОСТРОЕНИЕМ ЛИНЕЙНОГО ГРАФИКА

//Создаем объект для инициализации построения линейного графика
const LineChart = function (options) {
  let data = options.data
  let canvas = document.getElementById(options.canvas ?? 'canvas1')
  let context = canvas.getContext('2d')

  let rendering = false,
    paddingX = 80,
    paddingY = 80,
    width = 700,
    height = 500,
    progress = 0

  canvas.width = width
  canvas.height = height

  let maxValue, minValue

  let y1 = 10,
    y2 = 11,
    y3 = 12

  format()
  render()

  function format(force) {
    maxValue = 0
    minValue = Number.MAX_VALUE

    data.forEach(function (point) {
      maxValue = Math.max(maxValue, point.value)
      minValue = Math.min(minValue, point.value)
    })

    data.forEach(function (point, i) {
      point.targetX =
        paddingX + (i / (data.length - 1)) * (width - paddingX * 2)
      point.targetY =
        paddingY +
        ((point.value - minValue) / (maxValue - minValue)) *
          (height - paddingY * 2)
      point.targetY = height - point.targetY

      if (force || (!point.x && !point.y)) {
        point.x = point.targetX + 30
        point.y = point.targetY
        point.speed = 0.04 + (1 - i / data.length) * 0.05
      }
    })
  }

  function render() {
    if (!rendering) {
      requestAnimationFrame(render)
      return
    }

    context.font = '20px sans-serif'
    context.clearRect(0, 0, width, height)

    context.fillStyle = '#222'
    context.fillRect(paddingX, y1, width - paddingX * 2, 1)
    context.fillRect(paddingX, y2, width - paddingX * 2, 1)
    context.fillRect(paddingX, y3, width - paddingX * 2, 1)

    if (options.yAxisLabel) {
      context.save()
      context.globalAlpha = progress
      context.translate(paddingX - 15, height - paddingY - 10)
      context.rotate(-Math.PI / 2)
      context.fillStyle = '#fff'
      context.fillText(options.yAxisLabel, 0, 0)
      context.restore()
    }

    let progressDots = Math.floor(progress * data.length)
    let progressFragment =
      progress * data.length - Math.floor(progress * data.length)

    data.forEach(function (point, i) {
      if (i <= progressDots) {
        point.x += (point.targetX - point.x) * point.speed
        point.y += (point.targetY - point.y) * point.speed

        context.save()

        let wordWidth = context.measureText(point.label).width
        context.globalAlpha = i === progressDots ? progressFragment : 1
        context.fillStyle = point.future ? '#aaa' : '#fff'
        context.fillText(point.label, point.x - wordWidth / 2, height - 22)

        if (i < progressDots && !point.future) {
          context.beginPath()
          context.arc(point.x, point.y, 8, 0, Math.PI * 2)
          context.fillStyle = '#1baee1'
          context.fill()
        }

        context.restore()
      }
    })

    context.save()
    context.beginPath()
    context.strokeStyle = '#1baee1'
    context.lineWidth = 4

    let futureStarted = false

    data.forEach(function (point, i) {
      if (i <= progressDots) {
        let px = i === 0 ? data[0].x : data[i - 1].x,
          py = i === 0 ? data[0].y : data[i - 1].y

        let x = point.x,
          y = point.y

        if (i === progressDots) {
          x = px + (x - px) * progressFragment
          y = py + (y - py) * progressFragment
        }

        if (point.future && !futureStarted) {
          futureStarted = true
          context.lineWidth = 4

          context.stroke()
          context.beginPath()
          context.moveTo(px, py)
          context.strokeStyle = '#aaa'

          if (typeof context.setLineDash === 'function') {
            context.setLineDash([4, 8])
          }
        }

        if (i === 0) {
          context.moveTo(x, y)
        } else {
          context.lineTo(x, y)
        }
      }
    })

    context.stroke()
    context.restore()

    progress += (1 - progress) * 0.02

    requestAnimationFrame(render)
  }

  this.start = function () {
    rendering = true
  }

  this.stop = function () {
    rendering = false
    progress = 0
    format(true)
  }

  this.restart = function () {
    this.stop()
    this.start()
  }

  this.append = function (points) {
    progress -= points.length / data.length
    data = data.concat(points)

    format()
  }

  this.populate = function (points) {
    progress = 0
    data = points

    format()
  }
}
