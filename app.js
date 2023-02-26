const express = require('express')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const app = express()
const PORT = 3000

//載入 Model 設定檔
const db = require('./models')
const Todo = db.Todo
const User = db.User

//handlebars
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

//body-parser + method-override
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

//homepage
app.get('/', (req, res) => {
  return Todo.findAll({
    raw: true,
    nest: true
  })
    .then((todos) => { return res.render('index', { todos: todos }) })
    .catch((error) => { return res.status(422).json(error) })
})

app.get('/users/login', (req, res) => {
  res.render('login')
})

app.post('/users/login', (req, res) => {
  res.send('login')
})

app.get('/users/register', (req, res) => {
  res.render('register')
})

//將註冊資料寫進資料庫
app.post('/users/register', (req, res) => {
  const { name, email, password , confirmPassword} = req.body
  User.create({ name, email, password })
  .then(user => res.redirect('/') )
})

app.get('/users/logout', (req, res) => {
  res.send('logout')
})

//show one todo:
//查詢單筆資料：res.render時在物件實例串上toJSON:資料轉換成 plain object 的方法
//
app.get('/todos/:id', (req, res) => {
  const id = req.params.id
  return Todo.findByPk(id) //尚未使用User關聯
    .then(todo => res.render('detail', { todo: todo.toJSON() }))
    .catch(error => console.log(error))
})

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})