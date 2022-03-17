const appError =  require('./AppError')

const sendDevError =  (err, res) => {
    console.log(err);
    res.status(err.statusCode)
        .json({
            status: err.status,
            message: err.message,
            err: err,
            stack: err.stack
        });


};

const sendProdError =  (err, res) => {

    // console.log((err))

    if(err.isOperational) {
        res.status(err.statusCode)
            .json({
                status: err.status,
                message: err.message,
            });
    }else{
        res.status(500).json({
            status: true,
            message: "Operation Failed!, Please Try Again",
        })
    }
};


const handleAuthError = (err) =>  new appError(err.message, 401);

const handleBadRequest = (err) =>  new appError(err.message, 400);

const handleForbidden = (err) =>  new appError(err.message, 403);

const handle404NotFound = (err) =>  new appError(err.message, 404);



module.exports =   async (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.status = err.status || false;

    if(process.env.NODE_ENV === 'development') {

        sendDevError(err, res)

    }else if(process.env.NODE_ENV === 'production') {

        let error = { ...err };

        if(err.statusCode === 401) error = handleAuthError(err);

        if(err.statusCode === 400) error = handleBadRequest(err);

        if(err.statusCode === 403) error = handleForbidden(err);

        if(err.statusCode === 404) error = handle404NotFound(err);


        sendProdError(error, res)
    }


};