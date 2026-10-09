const installationService  = require('../services/installation.service')




exports.getStatus = async (req, res, next) => {

    try{
        res.json(await installationService.getStatus())
    }
    catch(error){
        next(error)
    }

}


exports.install = async (req, res, next) => {

    try{
        const admin = await installationService.install(req.body);
        res.status(201).json({ message: 'Application installed', admin})
    }catch (error) {
        next(error)
    }
}