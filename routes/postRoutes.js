const router = require("express").Router();
const { createPostCtrl, getAllPostCtrl, getSinglePostCtrl, getPostCountCtrl, deletePostCtrl, updatePostCtrl, updatePostImageCtrl, toggleLikesCtrl } = require("../controllers/postController");
const photoUpload = require("../middleWares/photoUpload.js");
const validateObjectId = require("../middleWares/validateObjectId.js");
const { verifyToken } = require("../middleWares/verifyToken.js");

router.route("/")
.post(verifyToken, photoUpload.single("image"), createPostCtrl)
.get(getAllPostCtrl)

router.route("/count").get(getPostCountCtrl);

router.route("/post/:id")
    .get(validateObjectId, getSinglePostCtrl)
    .delete(validateObjectId, verifyToken, deletePostCtrl)
    .put(validateObjectId, verifyToken, updatePostCtrl);
router.route("/updateImagePost/:id").put(validateObjectId, verifyToken, photoUpload.single("image"), updatePostImageCtrl);
router.route("/like/:id").put(validateObjectId, verifyToken, toggleLikesCtrl)    


module.exports = router