const installationService  = require('../services/installation.service')




exports.getStatus = async (req, res, next) => {

    try{
        res.json(await installationService.getStatus())
    }
    catch(error){
        next(error)
    }

}

