const {validationResult} =  require('express-validator')

const  globalValidator = (req, res, next) => {

    const errors = validationResult(req);

    if  (!errors.isEmpty())  {
        const validationErrors = {}
        errors.array().forEach(error => (validationErrors[error.param]  = req.t(error.msg )))
        return res.status(400).json({
            status: false,
            validationErrors
        })

    }
    next()
}

module.exports = globalValidator