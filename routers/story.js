const express = require("express");
const {
    addStory,
    deleteStory,
    getOwnStories,
    addStoryViewer,
    
} = require("../controllers/story");
const { getAccessToRoute } = require("../middlewares/authorization/auth");
const imageUpload = require("../middlewares/libraries/imageUpload");


const router = express.Router();
router.post("/add",[getAccessToRoute,imageUpload.single("story_image")],addStory);
router.get("/getStories",[getAccessToRoute],getOwnStories);
router.post("/:storyId/viewers",[getAccessToRoute],addStoryViewer);
router.delete("/:storyId",[getAccessToRoute],deleteStory);

module.exports = router;
