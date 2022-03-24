const  dotenv =  require('dotenv')

const globalErrorHandler = require('./utils/errorHandler');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message, err.stack);
    process.exit(1);
});


dotenv.config({path: './.env'});

const  app  = require("./app")

app.use(globalErrorHandler);


const port = process.env.PORT ||  5009;



const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});


process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message, err.stack);
    server.close(() => {
        process.exit(1);
    });
});


//Heroku Specific
process.on('SIGTERM', () => {
    console.log('SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    })
});




