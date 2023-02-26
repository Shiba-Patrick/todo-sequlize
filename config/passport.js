const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')

//載入User model
const db = require('../models')
const User = db.User

module.exports = app => {
  //初始化設定
  app.use(passport.initialize())
  app.use(passport.session())

  //本地化策略
  passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
    User.findOne({ where: { email } }) //使用where查詢特定email的User
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered!' })
        }
        return bcrypt.compare(password, user.password).then(isMatch => {
          if (!isMatch) {
            return done(null, false, { message: 'Email or Password incorrect.' })
          }
          return done(null, user)
        })
      })
      .catch(err => done(err, false))
  }))

  //序列化 反序列化
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findByPk(id) //findByPk查詢特定id的User
      .then((user) => { //將物件轉乘plain object 回傳給req繼續使用
        user = user.toJSON()  
        done(null, user)
      }).catch(err => done(err, null))
  })
}