const express   = require("express");
const router    = express.Router();
const request   = require(`request`);
const config    = require(`config`);
require('dotenv').config();
const auth      = require(`../../middleware/auth`);
const {check, validationResult} = require(`express-validator/check`);

const User      = require(`../../models/User`);
const Profile   = require(`../../models/Profile`);
const Post   = require(`../../models/Post`);



// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
// @middleware auth

router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id}).populate(`user`, [`name`, `avatar`])
        if (!profile) {
            return res.status(400).json({msg: `There is no profile for this user`})
        }
        res.json(profile);
    } catch(err) {
        console.error(error.message)
        res.status(500).send(`Server Error`);
    }
});


// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get("/", async (req, res) => {
    try {
        const profiles = await Profile.find().populate(`user`, [`name`, `avatar`])
        if (!profiles) {
            return res.status(400).json({msg: `There are no profiles in the database`})
        }
        res.json(profiles);
    } catch(err) {
        console.error(err.message)
        res.status(500).send(`Server Error`);
    }
});



// @route   POST api/profile
// @desc    Create or update a user's profile
// @access  
// two middlewares -auth and check - put middleware in []

router.post("/", 
    [
        auth,
        [
            check(`status`, `status is required`).not().isEmpty(),
            check(`skills`, `skills is required`).not().isEmpty()
        ]
    ],
    async (req,res) => {
        const errors=validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }
        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
        }   = (req.body);

        // build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;
        if (skills) {
            // convert to array and trim the spaces out for ex if user enters "html,   css, java"
            profileFields.skills = skills.toString().split(",").map(skill => skill.trim());
            // profileFields.skills = skills;
        }

        // Build a social

        // if you dont initialize profileFields.social = {}, then profileFields.social will come out as undefined in next line
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (facebook) profileFields.social.facebook = facebook;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (instagram) profileFields.social.instagram = instagram;

        try {
            let profile = await Profile.findOne({ user: req.user.id})
            if (profile) {
                // Update
                profile = await Profile.findOneAndUpdate(
                    { user: req.user.id}, 
                    { $set: profileFields},
                    { new: true}
                    );
                return res.json(profile);
            }

            //if profile not found then create a new one
            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);

        } catch(err) {
            console.error(err.message);
            res.status(500).send(`Server Error`)
        }

})

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user_id
// @access  Public

router.get("/user/:user_id", async (req, res) =>{
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate("user", [`name`, `avatar`]);

        if (!profile) return res.status(400).json({ msg: "profile not found"});
        res.json(profile);
    } catch (err) {
      console.error(err.message)
      if (err.kind == `ObjectId`) {
        return res.status(400).json({ msg: "profile not found"});
      }
      res.status(500).send("Server Error")
    }
})

// @route   DELETE api/profile
// @desc    Delete profile, user and posts
// @access  Private
// one middlewares -auth 

router.delete("/", auth, async (req, res) =>{
    try {
        // Remove User Posts
        await Post.deleteMany({ user: req.user.id })
        // Remove Profile
        await Profile.findOneAndRemove({ user: req.user.id });

        // Remove Uesr
        await User.findOneAndRemove({ _id: req.user.id });

        res.json({msg: "User Deleted"});
    } catch (err) {
      console.error(err.message)
      if (err.kind == `ObjectId`) {
        return res.status(400).json({ msg: "profile not found"});
      }
      res.status(500).send("Server Error")
    }
})

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private

router.put("/experience", [auth, [
    check(`title`,  `title is required`)
    .not()
    .isEmpty(),
    check(`company`,  `company is required`)
    .not()
    .isEmpty(),
    check(`from`,  `From Date is required`)
    .not()
    .isEmpty()
        ]
    ],   
    async (req, res) => {
        const errors=validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        };
        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }   = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({user: req.user.id});
            profile.experience.unshift(newExp);
            await profile.save();

            res.json(profile);
        } catch (err) {
          console.error(err.message);
          res.status(500).send(`Server Error`)
        }

});

// @route   DELETE api/profile/experience/exp_id
// @desc    Delete experience from profile
// @access  Private

router.delete("/experience/:exp_id", auth, async (req, res) =>{
    try {
        const profile = await Profile.findOne({user: req.user.id});

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1);

        await profile.save()
        res.json(profile);
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
})


// @route   PUT api/profile/education
// @desc    Add profile education
// @access  Private

router.put("/education", [auth, [
    check(`school`,  `school is required`)
    .not()
    .isEmpty(),
    check(`degree`,  `degree is required`)
    .not()
    .isEmpty(),
    check(`fieldofstudy`,  `Field of Study is required`)
    .not()
    .isEmpty(),
    check(`from`,  `From Date is required`)
    .not()
    .isEmpty()
        ]
    ],   
    async (req, res) => {
        const errors=validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        };
        const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }   = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        }
        try {
            const profile = await Profile.findOne({user: req.user.id});
            profile.education.unshift(newEdu);
            await profile.save();

            res.json(profile);
        } catch (err) {
          console.error(err.message);
          res.status(500).send(`Server Error`)
        }

});

// @route   DELETE api/profile/education
// @desc    Delete education from profile
// @access  Private

router.delete("/education/:edu_id", auth, async (req, res) =>{
    try {
        const profile = await Profile.findOne({user: req.user.id});

        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);
            
        profile.education.splice(removeIndex, 1);

        await profile.save()
        res.json(profile);
    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
})

// @route   GET api/profile/github/:username
// @desc    Get user repos from Github
// @access  public

router.get("/github/:username", async (req, res) =>{
    try {
    // note: uri below is split into multiple lines by using \ at the end of each line. make sure there are no
    // trailing spaces after \
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.githubClientId}&client_secret=${process.env.githubClientSecret}`,method: `GET`,headers: { "user-agent" : "node-js"}
        }

        request(options, (error, response, body) => {
            if (error) console.error(error);
            if (response.statusCode !== 200) {
                console.log("response from github : " + response.Status)
                return res.status(404).json({ msg: "No Github profile found"})
            }
            res.json(JSON.parse(body));
        })

    } catch (err) {
      console.error(err.message)
      res.status(500).send("Server Error")
    }
})


module.exports = router;