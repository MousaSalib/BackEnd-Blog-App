const asyncHandler = require("express-async-handler");
const { validateCreateCategory, Category } = require("../models/Category.js");

module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
    let {error} = validateCreateCategory(req.body);
    if(error) {
        return res.status(400).json({message: error.details[0].message})
    }

    const category = await Category.create({
        title: req.body.title,
        user: req.user._id
    });
    res.status(201).json(category)
});

module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    if(!categories) {
        return res.status(404).json({message: "No catgories found"})
    }else {
        res.status(200).json(categories)
    }
});

module.exports.deleteCategoryCtrl = asyncHandler(async(req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category) {
        return res.status(404).json({message: "No category found"})
    }else {
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Category has been deleted successfully", categoryId: category._id})
    }
})