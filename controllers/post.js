const Post = require("../models/Post");
const User = require("../models/User");

const createPost = async (req, res, next) => {
    try {
        const content = (req.body.content);
        const post = await Post.create({
            author: req.user.id,
            images: req.savedImages || [],
            content
        });
  
        await post.save();
  
        await User.findByIdAndUpdate(
        req.user.id,
        { $push: { posts: post._id } },
        { new: true }
      );
  
  
      return res.status(201).json({
        message: "Post added successfully!",
        post
      });
    } catch (error) {
      next(error);
    }
  };
  const deletePost = async (req, res, next) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
  
      await Post.findByIdAndDelete(postId);
  
      await User.findByIdAndUpdate(userId, { $pull: { posts: postId } });
  
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
  const updatePost = async (req, res, next) => {
    try {
      const postId = req.params.id;
      const content = req.body.content;
      const images = req.savedImages || [];
  
      const post = await Post.findByIdAndUpdate(
        { _id: postId },
        { images, content },
        { new: true }
      );
  
      res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
      next(error);
    }
  };
  
  
  module.exports = { deletePost };
  


  const getFollowingPosts = async (req, res, next) => {
    try {
      const userId = req.user.id;
  
      const user = await User.findById(userId).exec();
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const followingIds = user.followings;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const userPosts = await Post.find({ author: userId }).populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: '_id name stories private',
          populate: {
            path: 'stories',
            select: 'image createdAt viewers',
            match: { createdAt: { $gte: oneDayAgo } },
          },
        },
      }).exec();
  
      
      const followingPosts = await Post.find({ author: { $in: followingIds } })
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: '_id name stories private',
          populate: {
            path: 'stories',
            select: 'image createdAt viewers',
            match: { createdAt: { $gte: oneDayAgo } },
          },
        },
      })
      .exec();
      const allPosts = [...userPosts, ...followingPosts];
  
      allPosts.forEach(post => {
        post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
  
      allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
      res.json({ posts: allPosts });
    } catch (error) {
      next(error);
    }
  };
  const getUserPosts = async (req, res, next) => {
    try {
      const userId = req.params.id;
      
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const user = await User.findById(userId)
      .populate({
        path: 'stories',
        select: 'image createdAt viewers',
        match: { createdAt: { $gte: oneDayAgo } },
      })
      .exec();

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if(user.private && !user.followers.includes(req.user.id)){
        return res.json({
          user: {
            _id: user.id,
            name: user.name,
            private: user.private,
            profilePicture: user.profilePicture,
            postsCount: user.posts.length,
            place: user.place,
            githubURL: user.githubURL,
            followingsCount: user.followings.length,
            followersCount: user.followers.length,
          },
        });
      }else{

      }
      
      const userPosts = await Post.find({ author: userId }).populate({
        path: "comments",
        populate: {
          path: 'author',
          select: '_id name stories private',
          populate: {
            path: 'stories',
            select: 'image createdAt viewers',
            match: { createdAt: { $gte: oneDayAgo } },
          },
        },
      }).populate({
          path: 'author',
          select: '_id name stories private',
          populate: {
            path: 'stories',
            select: 'image createdAt viewers',
            match: { createdAt: { $gte: oneDayAgo } },
          },
      }).exec();
      userPosts?.forEach(post => {
        post.comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      });
  
      userPosts?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json({ posts: userPosts, user: {
        name: user.name,
        private: user.private,
        profilePicture: user.profilePicture,
        stories: user.stories,
        posts: user.posts,
        place: user.place,
        githubURL: user.githubURL,
        followings: user.followings,
        followers: user.followers,
      }, });
    } catch (error) {
      next(error);
    }
  };
  const getLikePosts = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
      const user = await User.findById(userId).populate({
        path: 'likePosts',
        populate: [
          {
            path: 'author',
            select: '_id name stories private',
            populate: {
              path: 'stories',
              select: 'image createdAt viewers',
              match: { createdAt: { $gte: oneDayAgo } },
            },
          },
          {
            path: 'comments',
            populate: {
              path: 'author',
              select: '_id name stories private',
              populate: {
                path: 'stories',
                select: 'image createdAt viewers',
                match: { createdAt: { $gte: oneDayAgo } },
              },
            },
          },
        ],
      });
      const filteredLikePosts = await Promise.all(
        user.likePosts.map(async post => {
          const authorId = post.author.id;
          const author = await User.findById(authorId);
          if (!author.private || user.followings.includes(authorId) || user?.id === author.id) {
            return post;
          }
          return null;
        })
      );
  
      const validLikePosts = filteredLikePosts.filter(post => post !== null);
  
      res.status(200).json({ likePosts: validLikePosts });
    } catch (error) {
      next(error);
    }
  };
  const getSavedPosts = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  
      const user = await User.findById(userId).populate({
        path: 'savedPosts',
        populate: [
          {
            path: 'author',
            select: '_id name stories private',
            populate: {
              path: 'stories',
              select: 'image createdAt viewers',
              match: { createdAt: { $gte: oneDayAgo } },
            },
          },
          {
            path: 'comments',
            populate: {
              path: 'author',
              select: '_id name stories private',
              populate: {
                path: 'stories',
                select: 'image createdAt viewers',
                match: { createdAt: { $gte: oneDayAgo } },
              },
            },
          },
        ],
      });
      const filteredSavedPosts = await Promise.all(
        user.savedPosts.map(async post => {
          const authorId = post.author.id;
          const author = await User.findById(authorId);
          if (!author.private || user.followings.includes(authorId) || user?.id === author.id) {
            return post;
          }
          return null;
        })
      );
  
      const validSavedPosts = filteredSavedPosts.filter(post => post !== null);
  
      res.status(200).json({ savedPosts: validSavedPosts });
    } catch (error) {
      next(error);
    }
  };
  
  
  

const likePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const user = await User.findById(userId);

    const isPostLiked = user.likePosts.includes(postId);

    if (isPostLiked) {
      user.likePosts.pull(postId);
      await user.save();

      const post = await Post.findById(postId);

      post.likes.pull(userId);
      await post.save();

      return res.status(200).json({ message: 'Post unliked successfully.' });
    } else {
      user.likePosts.push(postId);
      await user.save();

      const post = await Post.findById(postId);

      post.likes.push(userId);
      await post.save();

      return res.status(200).json({ message: 'Post liked successfully.' });
    }
  } catch (error) {
    next(error);
  }
};

const savePost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const user = await User.findById(userId);

    const isPostSaved = user.savedPosts.includes(postId);

    if (isPostSaved) {
      user.savedPosts.pull(postId);
      await user.save();

      return res.status(200).json({ message: 'Post unsaved successfully.' });
    } else {
      user.savedPosts.push(postId);
      await user.save();

      return res.status(200).json({ message: 'Post saved successfully.' });
    }
  } catch (error) {
      next(error);
  }
};




  module.exports = {
    savePost,
    createPost,
    deletePost,
    updatePost,
    likePost,
    getFollowingPosts,
    getSavedPosts,
    getLikePosts,
    getUserPosts
  };
  