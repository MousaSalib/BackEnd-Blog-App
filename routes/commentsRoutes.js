const { createCommentCtrl, getAllCommentsCtrl, deleteCommentCtrl, updateCommentCtrl } = require('../controllers/commentsController.js');
const validateObjectId = require('../middleWares/validateObjectId.js');
const { verifyToken, verifyTokenAndAdmin } = require('../middleWares/verifyToken.js');

const router = require('express').Router();

router.route("/").post(verifyToken, createCommentCtrl).get(verifyToken, verifyTokenAndAdmin, getAllCommentsCtrl);
router.route("/:id")
    .delete(validateObjectId, verifyToken, deleteCommentCtrl)
    .put(validateObjectId, verifyToken, updateCommentCtrl)

module.exports = router;