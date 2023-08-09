const express = require("express");
const {
  getUser, 
  follow, 
  editProfile,
  recommendedUsers, 
  acceptFriendRequest, 
  declineFriendRequest, 
  cancelFollowRequest, 
  friendRequests, 
  followRequests, 
  unfollow,
  followingUsers,
  followerUsers,
  getSearchUserNames,
} = require("../controllers/user");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const imageUpload = require("../middlewares/libraries/imageUpload");
const router = express.Router();

router.get("/profile", getAccessToRoute, getUser);
router.post("/:id/follow",[getAccessToRoute],follow);
router.get("/:id/followingusers",[getAccessToRoute],followingUsers);
router.get("/:id/followerusers",[getAccessToRoute],followerUsers);
router.post("/:id/unfollow",[getAccessToRoute],unfollow);
router.get("/friendrequests",[getAccessToRoute],friendRequests);
router.get("/followrequests",[getAccessToRoute],followRequests);
router.post("/:id/accept",[getAccessToRoute],acceptFriendRequest);
router.post("/:id/decline",[getAccessToRoute],declineFriendRequest);
router.post("/:id/cancel",[getAccessToRoute],cancelFollowRequest);
router.get("/recommendedusers",[getAccessToRoute],recommendedUsers);
router.post("/edit",[getAccessToRoute,imageUpload.single("profile_image")],editProfile);
router.get("/getusers/:search",getAccessToRoute,getSearchUserNames);
module.exports = router;
