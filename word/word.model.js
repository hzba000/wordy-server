const mongoose = require('mongoose');
const Joi = require('joi');

const wordSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    words: {type: Array, required:true, default: []},
    definitions: {type: Array, default:[]},
    images: {type: Array, default:[]},
    audio: {type: Array, default:[]},
    listenhighscore: {type: Number, default:0},
    imagehighscore: {type: Number, default:0},
    definitionhighscore: {type: Number, default:0}
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

const Word = mongoose.model('word', wordSchema);

module.exports = { Word };