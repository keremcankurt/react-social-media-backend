const CustomError = require("../helpers/error/CustomError");
const Story = require("../models/Story");
const User = require("../models/User");

const addStory = async (req, res, next) => {
  try {
    const story = await Story.create({
      author: req.user.id,
      image: req.savedImages[0],
    });

    story.viewers.push(req.user.id);
    await story.save();

    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { stories: story._id, viewedStories: story._id } },
      { new: true }
    );

    const { createdAt, image, viewers, _id } = story;

    return res.status(201).json({
      message: "Story added successfully!",
      story: {
        createdAt,
        image,
        viewers,
        _id,
      },
    });
  } catch (error) {
    next(error);
  }
};

  

const getOwnStories = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const ownStories = await User.findById(userId)
            .populate({
                path: 'stories',
                match: { createdAt: { $gte: oneDayAgo } },
                populate: {
                    path: 'author',
                    select: 'name profilePicture', // Sadece "name" ve "profilePicture" alanlarını çekin
                },
            })
            .select('stories');

        return res.status(200).json(ownStories.stories);
    } catch (error) {
        next(error);
    }
};
const addStoryViewer = async (req, res, next) => {
  try {
      const userId = req.user.id;
      const { storyId } = req.params;

      const user = await User.findByIdAndUpdate(
          userId,
          { $addToSet: { viewedStories: storyId } },
          { new: true }
      );
      const story = await Story.findByIdAndUpdate(
          storyId,
          { $addToSet: { viewers: userId } },
          { new: true }
      );
      return res.status(200).json({ authorId: story.author, storyId: story.id });
  } catch (error) {
      next(error);
  }
};
const deleteStory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { storyId } = req.params;

    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { stories: storyId } 
      },
      { new: true }
    );

    await Story.findByIdAndRemove(storyId);

    res.status(200).json({ message: "Story deleted successfully." });
  } catch (error) {
    return next(error);
  }
};





module.exports = {
    addStory,
    deleteStory,
    getOwnStories,
    addStoryViewer
  };
  