const express = require("express");
const Note = require("../models/Note");
const router = express.Router();
const fetchuser = require("./../middleware/fetchuser");

router.get("/fetchallnotes", fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})
router.post("/addnote", fetchuser,
// [body('title', 'Enter a valid title').isLength({ min: 3 }),
// body('description', "Description must be atleast 5 length").isLength({ min: 5 })],
    async (req, res) => {
        try {
            // const errors = validationResult(req);
            // if (!errors.isEmpty()) {
            //     return res.status(400).json({ errors: errors.array() });

            // }
            const {title,description,tag} = req.body;
            const note = new Note({
                title, description, tag, user: req.user.id
            });

            const savedNote = await note.save();
            res.status(200).json(savedNote);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    })
    router.put("/updatenote/:id", fetchuser,async (req, res) => {
        const {title, description, tag} = req.body;
        try {
            const newNote = {};
            if(title){newNote.title = title};
            if(description){newNote.description= description};
            if(tag){newNote.tag = tag};

            let note = await Note.findById(req.params.id);
            if(!note){
                return res.status(404).send("Not found");
            }
            if(note.user.toString()!== req.user.id)
            {
                return res.status(401).send("Not allowed");
            }
            note = await Note.findByIdAndUpdate(req.params.id,{$set : newNote},{new: true});
            res.json(note);
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    });
    router.delete("/deletenote/:id", fetchuser,async (req, res) => {
        try {
            let note = await Note.findById(req.params.id);
            if(!note){
                return res.status(404).send("Not found");
            }
            if(note.user.toString()!== req.user.id)
            {
                return res.status(401).send("Not allowed");
            }
            note = await Note.findByIdAndDelete(req.params.id);
            res.status(200).send("deleted successfully");
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }

    });
module.exports = router;