const deleteButtons = document.querySelectorAll('.deleteBtn')
const addButtons = document.querySelectorAll('.addBtn')
const calculateButton = document.getElementById('calcBtn')
const resultTable = document.getElementById('resultTable')
const leftTable = document.getElementById('leftTable')
const rightTable = document.getElementById('rightTable')

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

//Инициализация таблиц значениями из LS, если locasstorage не пуст
if (
  localStorage.getItem('coords-left') ||
  localStorage.getItem('coords-right')
) {
  createTables()

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

//Проходим по всем кнопкам для удаления строки и вешаем обработчики на них
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

  //Вешаем обработчик на кнопку удаления строки
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

  //Проходим по циклу rowCount раз, создавая новые строки и вычисляя значения
  for (let i = 0; i < rowCount; i++) {
    //Создаем строку и добавляем ее в DOM
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
    resultTable.querySelector('tbody').append(newRow)
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
