const express = require('express');
const router = express.Router();
// const config = require('config');
// const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

// Post model
const Post = require('../../models/Post');
// Profile model
const Profile = require('../../models/Profile');

// Validation
const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: 'Posts Works' }));

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }));
});

// @route   GET api/posts/:_id
// @desc    Get post by id
// @access  Public
router.get('/:_id', (req, res) => {
  Post.findById(req.params._id)
    .then(post => {
      if (post) {
        res.json(post);
      } else {
        res.status(404).json({ nopostfound: `No post found with ID: ${req.params._id}` })
      }
    })
    .catch(err =>
      res.status(404).json({ nopostfound: `No post found with ID: ${req.params._id}` })
    );
});

// @route   POST api/posts
// @desc    Create post
// @access  Private
router.post(
  '/',
  auth,
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user._id
    });

    newPost.save().then(post => res.json(post));
  }
);

// @route   DELETE api/posts/:_id
// @desc    Delete post
// @access  Private
router.delete(
  '/:_id',
  auth,
  (req, res) => {
    Profile.findOne({ user: req.user._id }).then(profile => {
      Post.findById(req.params._id)
        .then(post => {
          // Check for post owner
          if (post.user.toString() !== req.user._id) {
            return res
              .status(401)
              .json({ notauthorized: 'User not authorized' });
          }

          // Delete
          post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

// @route   POST api/posts/like/:_id
// @desc    Like post
// @access  Private
router.post(
  '/like/:_id',
  auth,
  (req, res) => {
    Profile.findOne({ user: req.user._id }).then(profile => {
      Post.findById(req.params._id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user._id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: 'User already liked this post' });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.user._id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

// @route   POST api/posts/unlike/:_id
// @desc    Unlike post
// @access  Private
router.post(
  '/unlike/:_id',
  auth,
  (req, res) => {
    Profile.findOne({ user: req.user._id }).then(profile => {
      Post.findById(req.params._id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user._id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: 'You have not yet liked this post' });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user._id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    });
  }
);

// @route   POST api/posts/comment/:_id
// @desc    Add comment to post
// @access  Private
router.post(
  '/comment/:_id',
  auth,
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    // Check Validation
    if (!isValid) {
      // If any errors, send 400 with errors object
      return res.status(400).json(errors);
    }

    Post.findById(req.params._id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user._id
        };

        // Add to comments array
        post.comments.unshift(newComment);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  }
);

// @route   DELETE api/posts/comment/:_id/:comment_id
// @desc    Remove comment from post
// @access  Private
router.delete('/comment/:_id/:comment_id', auth, (req, res) => {
  Post.findById(req.params._id)
    .then(post => {
      return res
        .status(404)
        .json({ commentnotexists: 'Comment does not exist' });

      // Check to see if comment exists
      if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
        return res
          .status(404)
          .json({ commentnotexists: 'Comment does not exist' });
      }

      // Get remove index
      const removeIndex = post.comments
        .map(item => item._id.toString())
        .indexOf(req.params.comment_id);

      // Splice comment out of array
      post.comments.splice(removeIndex, 1);

      post.save().then(post => res.json(post));
    })
    .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
}
);

module.exports = router;
