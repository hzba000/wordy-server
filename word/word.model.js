const mongoose = require('mongoose');
const Joi = require('joi');

const wordSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    words: {type: Array},
    definitions: {type: Array},
    images: {type: Array},
    audio: {type: Array},
    listenhighscore: {type: Number},
    imagehighscore: {type: Number},
    definitionhighscore: {type: Number}
});

wordSchema.methods.serialize = function () {
    let user;
    if (typeof this.user.serialize === 'function') {
        user = this.user.serialize();
    } else {
        user = this.user;
    }

    return {
        id: this._id,
        user: user,
        words: this.words,
        definitions: this.definitions,
        images: this.images,
        audio: this.audio,
        listenhighscore: this.listenhighscore,
        imagehighscore: this.imagehighscore,
        definitionhighscore: this.definitionhighscore
    };
};


//Validation
// const WordJoiSchema = Joi.object().keys({
//     user: Joi.string().optional(),
//     title: Joi.string().min(1).required(),
//     content: Joi.string().min(1).required(),
//     createDate: Joi.date().timestamp()
// });

const Word = mongoose.model('word', wordSchema);

module.exports = { Word };