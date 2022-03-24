class CreateTransportClass {
    sendMail(){
    }
}

const createTransport = ()=>{
    return new CreateTransportClass()
}


module.exports = {
    createTransport
}