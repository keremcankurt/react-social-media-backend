const Comment = require("../models/Comment");
const Post = require("../models/Post");

const addComment = async (req, res, next) => {
  try {
    const content = req.body.content;
    const comment = await Comment.create({
      author: req.user.id,
      postId: req.params.id,
      content
    });
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    await comment.populate({
      path: 'author',
      select: '_id name stories private',
      populate: {
        path: 'stories',
        match: { createdAt: { $gte: oneDayAgo } },
        select: 'image createdAt viewers',
      },
    })

    await comment.save();

    await Post.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: comment._id } },
      { new: true }
    );

    return res.status(201).json({
      message: "Comment added successfully!",
      comment
    });
  } catch (error) {
    next(error);
  }
};
const deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.id;

    // Find the comment by its ID in the Comment model
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get the postId from the comment
    const postId = comment.postId;

    // Find the post by its ID in the Post model
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Remove the comment ID from the comments array of the post
    post.comments = post.comments.filter((commentId) => commentId.toString() !== commentId);

    // Save the updated post
    await post.save();

    // Delete the comment using the deleteOne() method
    await Comment.deleteOne({ _id: commentId });

    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
};




  module.exports = {
    addComment,
    deleteComment
  };