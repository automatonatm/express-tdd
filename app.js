const express = require('express')
const  AppError = require('./utils/appError');
const morgan =  require('morgan');
const i18next = require('i18next')
const Backend = require('i18next-fs-backend')
const middleware = require('i18next-http-middleware')
const bodyParser = require('body-parser');
const userRouter = require('./routes/users')
const sequelize = require('./config/db')


i18next.use(Backend).use(middleware.LanguageDetector).init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
        loadPath: './locales/{{lng}}/{{ns}}.json'
    },
    detection: {
        lookupHeader: 'accept-language'
    }
})

const app = express()

app.use(middleware.handle(i18next))


sequelize.sync()




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

