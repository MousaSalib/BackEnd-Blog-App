const router = require("express").Router();
const { getAllUsersCtrl, getUserCtrl, updateUserProfileCtrl, getUsersCountCtrl, uploadUserProfilePhoto, uploadUserProfilePhotoCtrl, deleteUserProfileCtrl } = require("../controllers/usersController.js");
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken, verifyTokenAndAuthorization } = require("../middleWares/verifyToken.js");
const validateObjectId = require("../middleWares/validateObjectId.js");
const photoUpload = require("../middleWares/photoUpload.js");


router.route("/getAllUsers").get(verifyTokenAndAdmin, getAllUsersCtrl);
router.route("/getUser/:id").get(validateObjectId, getUserCtrl);
router.route("/updateUser/:id").put(validateObjectId, verifyTokenAndOnlyUser,updateUserProfileCtrl);
router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);
router.route("/uploadPhoto").post(verifyToken, photoUpload.single("image"), uploadUserProfilePhotoCtrl)    
router.route("/deleteProfile/:id").delete(validateObjectId, verifyTokenAndAuthorization, deleteUserProfileCtrl)

module.exports = router