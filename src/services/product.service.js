
const productRepository = require('../repositories/product.repository')
const materialRepository = require('../repositories/material.repository')
const AppError = require('../utils/AppError')


const isNumber = (value) => typeof value === 'number' && Number.isFinite(value);
const isText = (value) => typeof value === 'string' && value.trim() !== '';


const validateComposition = async (composition) => {

    if (!Array.isArray(composition) || composition.length === 0) {
        throw new AppError('A product needs at least one material', 400)
    }
    for (const line of composition) {
        if (!line || typeof line.material !== 'string' || !isNumber(line.quantity) || line.quantity <= 0) {
            throw new AppError('Each composition line needs a material id and quantity greater than 0', 400)
        }
    }
}

const ids = composition.map((line) => line.material)
if(new Set(ids).size !== ids.length){
    throw new AppError('A material can appear only once in the composition' , 400)
}

const materials = await materialRepository.findById(ids)
if(materials.length !== ids.length){
    throw new AppError('One or more materials do not exist' , 400)
}

return composition.map(({ material, quantity}) => ({material, quantity}))