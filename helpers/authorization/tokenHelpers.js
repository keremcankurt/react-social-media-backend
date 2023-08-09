const sendJwtToClient = (user, res) => {
    const token = user.generateJwtFromUser();
    const { JWT_COOKIE, NODE_ENV } = process.env;
    return res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        sameSite: "none",
        expires: new Date(Date.now() + parseInt(JWT_COOKIE) * 1000),
        secure: NODE_ENV === "development" ? false : true,
      })
      .json({
        name: user.name,
        profilePicture: user.profilePicture,
        
      })
  };
  
  const getAccessTokenFromHeader = (req) => {
    return req.headers["authorization"];
  };
  module.exports = {
    sendJwtToClient,
    getAccessTokenFromHeader,
  };
  
