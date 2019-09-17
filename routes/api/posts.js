const express = require("express");
const router = express.Router();
const auth      = require(`../../middleware/auth`);
const {check, validationResult} = require(`express-validator/check`);

const User      = require(`../../models/User`);
const Profile   = require(`../../models/Profile`);
const Post      = require(`../../models/Post`);

// @route   POST api/posts
// @desc    Add a post
// @access  Private

router.post("/", [auth, 
    [check(`text`, `text is required`).not().isEmpty()]], 
    async (req, res) => {
        const errors=validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
            }

            try {
                const user = await User.findById(req.user.id).select(`-password`);
                const newPost = new Post({
                    text: req.body.text,
                    name: user.name,
                    avatar: user.avatar,
                    user: req.user.id,
                    date: Date.now()
                })
                // In the below line, post will store values that are saved using newPost.save();
                const post = await newPost.save();
                res.json(post);
            }
            catch(err) {
                console.error(err.message)
                res.status(500).send(`Server Error`);
            }
            
        }
    )

// @route   GET api/posts
// @desc    Get all posts
// @access  Private

router.get("/", auth, async (req, res) =>{
    try {
        const posts = await Post.find().sort({ date:-1 });
        res.json(posts);
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
})

// @route   GET api/posts/:id
// @desc    Get one post by id
// @access  Private

router.get("/:id", auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "post not found"})
        }
        res.json(post);
    } catch (err) {
    // if what is passed is not a valid objectID, control will go below
      console.error(err.message)
      if (err.kind === `ObjectId`) {
        return res.status(404).json({ msg: "post not found"})
        }   
      res.status(500).send("Server Error")
    }
})

// @route   DELETE api/posts/:id
// @desc    Delete one post by id
// @access  Private

router.delete("/:id", auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "post not found"})
        }
        // check to make sure user is deleting own posts and not posts of others
        // post.user is an object. convert to string before checking.
        if (post.user.toString() != req.user.id) {
            return res.status(401).json({ msg: "User not authorized to delete post"})
        }
        await post.remove();
        res.json({msg: "Post removed"});
    } catch (err) {
    // if what is passed is not a valid objectID, control will go below
    // for example instead of passing the full string similar to post id, if you just pass say abc or 55 etc
      console.error(err.message)
      if (err.kind === `ObjectId`) {
        return res.status(404).json({ msg: "post not found - not a valid object id"})
        }   
      res.status(500).send("Server Error")
    }
})

// @route   PUT api/posts/like/:id
// @desc    Add like to a post
// @access  Private

router.put("/like/:id", auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id)
        // check if the post has already been liked by this user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length>0) {
            return res.status(400).json({ "msg": "Post already liked"})
        }
        post.likes.unshift({ user: req.user.id});
        await post.save();
        res.json(post.likes);
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
})


// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private

router.put("/unlike/:id", auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id)
        // check if the post has already been liked by this user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({ "msg": "Post has not yet been liked"})
        }
        
        // Get remove index. This is similar to what was done with education and experience
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex, 1);

        await post.save();
        res.json(post.likes);
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
})

// @route   GET api/posts/comment/:id
// @desc    Comment on a post
// @access  Private


router.post("/comment/:id", [auth, 
    [check(`text`, `text is required`).not().isEmpty()]], 
    async (req, res) => {
        const errors=validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
            }

            try {
                const user = await User.findById(req.user.id).select(`-password`);
                const post = await Post.findById(req.params.id)

                const newComment = {
                    text: req.body.text,
                    name: user.name,
                    avatar: user.avatar,
                    user: req.user.id,
                    date: Date.now()
                }
                
                // unshift adds at the beginning
                post.comments.unshift(newComment);

                await post.save();
                res.json(post.comments);
            }
            catch(err) {
                console.error(err.message)
                res.status(500).send(`Server Error`);
            }
            
        }
    )

// @route   GET api/posts/comment/:id/:comment_id
// @desc    Delete Comment
// @access  Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        // pull out a comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        // the above will either give a comment or false
        // below make sure comment exists
        if (!comment) {
            return res.status(404).json({msg: 'Comment does not exist'})
        }
        // check to make sure the comment is being deleted by the user who made it
        if (comment.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'User not authorized'})
        } 
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex, 1);

        await post.save();
        res.json(post.comments);
    } catch (err) {
        console.error(err.message)
        res.status(500).send(`Server Error`);
    }
})




module.exports = router;