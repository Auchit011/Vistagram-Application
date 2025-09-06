exports.makeShareLink = (postId) => {
    const { v4: uuidv4 } = require('uuid');
    return `s_${uuidv4().slice(0,8)}_${postId}`;
  };
  