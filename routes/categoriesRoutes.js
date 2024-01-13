const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require("../controllers/categoriesController.js");
const validateObjectId = require("../middleWares/validateObjectId.js");
const { verifyTokenAndAdmin } = require("../middleWares/verifyToken.js");

const router = require("express").Router();

router.route('/').post(verifyTokenAndAdmin, createCategoryCtrl).get(getAllCategoriesCtrl);
router.route("/:id").delete(validateObjectId, verifyTokenAndAdmin, deleteCategoryCtrl)

module.exports = router