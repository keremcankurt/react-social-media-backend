const express = require("express");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const imageUpload = require("../middlewares/libraries/imageUpload");
const { 
    savePost,
    createPost, 
    deletePost, 
    updatePost,
    likePost,
    getFollowingPosts,
    getUserPosts,
    getLikePosts,
    getSavedPosts,
 } = require("../controllers/post");
const { checkPostExists } = require("../middlewares/database/databaseErrorHelpers");


const router = express.Router();
router.post("/create",[getAccessToRoute,imageUpload.array("post_image")],createPost);
router.get("/followingposts",[getAccessToRoute],getFollowingPosts);
router.get("/likeposts",[getAccessToRoute],getLikePosts);
router.get("/savedposts",[getAccessToRoute],getSavedPosts);
router.get("/userposts/:id",[getAccessToRoute],getUserPosts);
router.delete("/:id", getAccessToRoute, checkPostExists, deletePost);
router.put("/:id", getAccessToRoute, checkPostExists, imageUpload.array("post_image"), updatePost);
router.post("/:id/save", getAccessToRoute, checkPostExists, savePost);
router.post("/:id/like", getAccessToRoute, checkPostExists, likePost);
module.exports = router;
