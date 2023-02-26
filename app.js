const express = require('express')
const session = require('express-session')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const bcrypt = require('bcryptjs')
const passport = require('passport')// 引用 passport

// 載入設定檔，要寫在 express-session 以後
const usePassport = require('./config/passport')

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

// 加入 middleware，驗證 reqest 登入狀態
app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

app.get('/users/register', (req, res) => {
  res.render('register')
})

//將註冊資料寫進資料庫: 運用where的sequelize語法
app.post('/users/register', (req, res) => {
  const { name, email, password , confirmPassword} = req.body
  User.findOne({ where: { email } }).then(user => {
    if (user) {
      console.log('User already exists')
      return res.render('register', {
        name,
        email,
        password,
        confirmPassword
      })
    }
    return bcrypt
      .genSalt(10)
      .then(salt => bcrypt.hash(password, salt))
      .then(hash => User.create({
        name,
        email,
        password: hash
      }))
      .then(() => res.redirect('/'))
      .catch(err => console.log(err))
  })
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

// 呼叫 Passport 函式並傳入 app，這條要寫在路由之前
usePassport(app)
app.use(session({
  secret: 'ThisIsMySecret',
  resave: false,
  saveUninitialized: true
}))

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})