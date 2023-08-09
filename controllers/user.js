const CustomError = require("../helpers/error/CustomError");
const User = require("../models/User");


const getUser = (async (req, res, next) => {
  try {
      const { id } = req.user;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const user = await User.findById(id).populate({
        path: 'stories',
        match: { createdAt: { $gte: oneDayAgo } },
        select: 'image createdAt viewers',
        populate: {
            path: 'viewers', // Burada stories'ın viewers alanını populate ediyoruz
            select: 'name profilePicture', // viewers alanından hangi alanları çekmek istediğinizi belirtin
        }
    }).populate({
        path: 'followings',
        select: 'name profilePicture stories private followers followings',
        populate: {
            path: 'stories',
            match: { createdAt: { $gte: oneDayAgo } },
            select: 'image createdAt viewers',
            populate: {
                path: 'viewers', // Burada viewers alanını populate ediyoruz
                select: 'username fullName', // viewers alanından hangi alanları çekmek istediğinizi belirtin
            }
        },
    });
    
      res.status(200).json({
          user
      });
  } catch (error) {
    next(error);
  }
});
const follow = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return next(new CustomError("You cannot follow yourself.", 400)); 
    }     
      
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const user = await User.findById(id)
    .populate(
      {
        path: 'stories',
        match: { createdAt: { $gte: oneDayAgo } },
        select: 'image createdAt viewers',
      }
      );
      if (user.friendRequests.includes(req.user.id) || user.followers.includes(req.user.id)) {
        return next(new CustomError("You have already sent a follow request to this user.", 400)); 
      }
      
      if (user.private) {
        user.friendRequests.push(req.user.id); 
        await user.save();
  
        const requestingUser = await User.findById(req.user.id);
        requestingUser.followRequests.push(user._id);
        await requestingUser.save();
        
        return res.status(200).json({
          success: true,
          user: {
            _id: user.id,
            private: user.private,
          }
        });
      }
  
      const requestingUser = await User.findById(req.user.id);
      requestingUser.followings.push(user._id);
      await requestingUser.save();
      user.followers.push(req.user.id);
      await user.save();
      return res.status(200).json({
        success: true,
        user: {
          _id: user.id,
          private: user.private,
          name: user.name,
          profilePicture: user.profilePicture,
          stories: user.stories,
          private: user.private,
          followers: user.followers,
        }
        });
    } catch (error) {
      next(error);
    }
  };
  const unfollow = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId  = req.user.id;
  
      if (id === userId) {
        return next(new CustomError("You cannot unfollow yourself.", 400)); 
      }
  
      const user = await User.findById(id);
  
      if (!user) {
        return next(new CustomError("User not found.", 404));
      }
      if (!user.followers.includes(userId)) {
        return next(new CustomError("You are not following this user.", 400)); 
      }
  
      user.followers.pull(userId);
      await user.save();
  
      const userToUnfollow = await User.findById(userId);
      userToUnfollow.followings.pull(id);
      await userToUnfollow.save();
  
      res.json({ message: "Unfollowed successfully." });
    } catch (error) {
      next(error);
    }
  };
  
  
  const acceptFriendRequest = async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log(id)
      const user = await User.findById(req.user.id);
  
      if (!user.friendRequests.includes(id)) {
        return next(new CustomError("Friend request not found.", 400));
      }
  
      const friend = await User.findById(id)
  
      user.followers.push(friend._id);
      const friendRequestIndex = user.friendRequests.indexOf(id);
      console.log(friendRequestIndex)
      if (friendRequestIndex !== -1) {
        user.friendRequests.splice(friendRequestIndex, 1);
      }
      await user.save();
  
      friend.followings.push(req.user.id);
      const followRequestIndex = friend.followRequests.indexOf(req.user.id);
      if (followRequestIndex !== -1) {
        friend.followRequests.splice(followRequestIndex, 1);
      }
      await friend.save();
  
      return res.status(200).json({
        success: true,
        friendRequests: user.friendRequests,
        followers: user.followers
      });
    } catch (error) {
      next(error);
    }
  };

  const declineFriendRequest = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(req.user.id);
  
      if (!user.friendRequests.includes(id)) {
        return next(new CustomError("Friend request not found.", 400));
      }
      const friend = await User.findById(id)

      const friendRequestIndex = user.friendRequests.indexOf(id);
      if (friendRequestIndex !== -1) {
        user.friendRequests.splice(friendRequestIndex, 1);
      }
      await user.save();
  
      const followRequestIndex = friend.followRequests.indexOf(req.user.id);
      if (followRequestIndex !== -1) {
        friend.followRequests.splice(followRequestIndex, 1);
      }
      await friend.save();
  
      return res.status(200).json({
        success: true,
        friendRequests: user.friendRequests
      });
    } catch (error) {
      next(error);
    }
  };
  const cancelFollowRequest = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await User.findById(req.user.id);
      if (!user.followRequests.includes(id)) {
        return next(new CustomError("Follow request not found.", 400));
      }
      const friend = await User.findById(id)

      const followRequestIndex = user.followRequests.indexOf(id);
      if (followRequestIndex !== -1) {
        user.followRequests.splice(followRequestIndex, 1);
      }
      await user.save();
      
      const friendRequestIndex = friend.friendRequests.indexOf(req.user.id);
      if (friendRequestIndex !== -1) {
        friend.friendRequests.splice(friendRequestIndex, 1);
      }
      await friend.save();
  
      return res.status(200).json({
        success: true,
        followRequests: user.followRequests
      });
    } catch (error) {
      next(error);
    }
  };
  
  
  
  const recommendedUsers = async (req, res, next) => {
    try {
      const { id } = req.user;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const user = await User.findById(id);
  
      const followingUsers = user.followings;
      const friendsOfFollowingUsers = await User.find({
        _id: { $in: followingUsers },
        followings: user._id,
      });
  
      const recommendedUsers = await User.find({
        _id: { $nin: [...followingUsers, user._id] },
      })
        .select('name profilePicture stories private followers friendRequests followRequests')
        .populate({
          path: 'stories',
          match: { createdAt: { $gte: oneDayAgo } },
          select: 'image createdAt viewers',
        })
        .exec();
  
      const mergedUsers = [...friendsOfFollowingUsers, ...followingUsers];
  
      const remainingRecommendedUsers = recommendedUsers.filter(
        (user) => !mergedUsers.some(mergedUser => mergedUser._id.equals(user._id))
      );
  
      const randomRecommendedUsers = [];
      while (randomRecommendedUsers.length < 6 && remainingRecommendedUsers.length > 0) {
        const randomIndex = Math.floor(Math.random() * remainingRecommendedUsers.length);
        const randomUser = remainingRecommendedUsers.splice(randomIndex, 1)[0];
        randomRecommendedUsers.push(randomUser);
      }
  
      return res.status(200).json({
        recommendedUsers: randomRecommendedUsers, // randomRecommendedUsers ile değiştirildi
      });
    } catch (error) {
      next(error);
    }
  };
  const followingUsers = async (req, res, next) => {
    try {
      const { id } = req.params;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const followingUsers = await User.findById(id).populate({
        path: 'followings',
        select: '_id name profilePicture stories private followers friendRequests followRequests',
        populate:{
          path: 'stories',
          match: { createdAt: { $gte: oneDayAgo } },
          select: 'image createdAt viewers _id',
        }
      });
  
      return res.status(200).json({
        followingUsers: followingUsers.followings,
      });
    } catch (error) {
      next(error);
    }
  };
  const followerUsers = async (req, res, next) => {
    try {
      const { id } = req.params;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const followerUsers = await User.findById(id).populate({
        path: 'followers',
        select: '_id name profilePicture stories private followers friendRequests followRequests',
        populate:{
          path: 'stories',
          match: { createdAt: { $gte: oneDayAgo } },
          select: 'image createdAt viewers _id',
        }
      });
  
      return res.status(200).json({
        followerUsers: followerUsers.followers,
      });
    } catch (error) {
      next(error);
    }
  };

  const friendRequests = async (req, res, next) => {
    try {
      const { id } = req.user;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const user = await User.findById(id)
      .populate({
        path: "friendRequests",
        select: 'name profilePicture stories private followers friendRequests followRequests',
        populate: {
          path: 'stories',
          match: { createdAt: { $gte: oneDayAgo } },
          select: 'image createdAt viewers',
        }
      })
      .exec();
        
  
      return res.status(200).json({
        friendRequests: user.friendRequests, 
      });
    } catch (error) {
      next(error);
    }
  };
  const followRequests = async (req, res, next) => {
    try {
      const { id } = req.user;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const user = await User.findById(id)
      .populate({
        path: "followRequests",
        select: 'name profilePicture stories private followers friendRequests followRequests',
        populate: {
          path: 'stories',
          match: { createdAt: { $gte: oneDayAgo } },
          select: 'image createdAt viewers',
        }
      })
      .exec();
  
      return res.status(200).json({
        followRequests: user.followRequests, 
      });
    } catch (error) {
      next(error);
    }
  };
  
  const editProfile = async (req, res, next) => {
    try {
        const info = JSON.parse(req.body.info);
        const id = req.user.id;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        if (info.name) {
            user.name = info.name;
        }
        if (info.place) {
            user.place = info.place;
        }
        if (info.githubURL) {
            user.githubURL = info.githubURL;
        }

        if (req.savedImages && req.savedImages[0]) {
            user.profilePicture = req.savedImages[0]; 
        }
          user.private = info.private;

        await user.save();

        return res.json({
            name: user.name,
            place: user.place,
            githubURL: user.githubURL,
            profilePicture: user.profilePicture,
            private: user.private,
        });
    } catch (error) {
        next(error);
    }
};


const Fuse = require('fuse.js');

const getSearchUserNames = async (req, res, next) => {
  try {
      const searchTerm = req.params.search;
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const users = await User.find().select('_id name profilePicture stories private followers friendRequests followRequests')
      .populate({
        path: 'stories',
        match: { createdAt: { $gte: oneDayAgo } },
        select: 'image createdAt viewers',
      })
      .exec();

      const fuseOptions = {
          keys: ['name'], 
          includeScore: true, 
          threshold: 0.65, 
      };

      const fuse = new Fuse(users, fuseOptions);
      const searchResults = fuse.search(searchTerm);
      const filteredResults = searchResults.map(result => result.item);

      // Filter out the user with your own ID
      const userId = req.user.id;
      const filteredWithoutCurrentUser = filteredResults.filter(user => user._id.toString() !== userId);

      res.json(filteredWithoutCurrentUser);
  } catch (error) {
      next(error);
  }
};






module.exports = {
  getUser,
  follow,
  follow,
  unfollow,
  editProfile,
  followerUsers,
  followingUsers,
  friendRequests,
  followRequests,
  recommendedUsers,
  getSearchUserNames,
  cancelFollowRequest,
  acceptFriendRequest,
  declineFriendRequest,
  
};
