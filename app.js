const express = require('express')
const  AppError = require('./utils/appError');
const morgan =  require('morgan');
const bodyParser = require('body-parser');
const userRouter = require('./routes/users')
const sequelize = require('./database/db')

const app = express()


sequelize.sync()
    .then()
    .catch((e) => console.log(e) )



if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))


// parse application/json
app.use(bodyParser.json())

app.use('/api/v1/users', userRouter)



//Handle 404 routes
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404))
});


module.exports =  app;

