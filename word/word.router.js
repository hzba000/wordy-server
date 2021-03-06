//word refers to word data
const express = require('express');
const wordRouter = express.Router();

const { jwtPassportMiddleware } = require('../auth/auth.strategy');
const { Word } = require('./word.model.js');

//SUBMIT A WORD
wordRouter.post('/', jwtPassportMiddleware, (request, response) => {
    const newWord = {
        user: request.user.id,
        words: request.body.words,
        definitions: request.body.definitions,
        images: request.body.images,
        audio: request.body.audio,
        listenhighscore: request.body.listenhighscore,
        imagehighscore: request.body.imagehighscore,
        definitionhighscore: request.body.definitionhighscore
    };

    Word.create(newWord)
        .then(createdUser => {
            return response.status(201).json(createdUser.serialize());
        })
        .catch(error => {
            return response.status(500).json(error);
        });
});

//GET ALL WORDS
wordRouter.get('/', jwtPassportMiddleware, (request, response) => {
    Word.find({ user: request.user.id })
        .populate('user')
        .then(words => {
            return response.status(200).json(
                words.map(word => word.serialize())
            );
        })
        .catch(error => {
            return response.status(500).json(error);
        });
});

// RETRIEVE ONE WORD BY ID
wordRouter.get('/:wordid', (request, response) => {
    Word.findById(request.params.wordid)
        .populate('user')
        .then(word => {
            return response.status(200).json(word.serialize());
        })
        .catch(error => {
            return response.status(500).json(error);
        });
});

// UPDATE WORD BY ID
wordRouter.put('/:wordid', jwtPassportMiddleware, (request, response) => {
    const wordUpdate = {
        words: request.body.words,
        definitions: request.body.definitions,
        images: request.body.images,
        audio: request.body.audio,
        listenhighscore: request.body.listenhighscore,
        imagehighscore: request.body.imagehighscore,
        definitionhighscore: request.body.definitionhighscore
    };

    Word.findByIdAndUpdate(request.params.wordid, wordUpdate)
        .then(() => {
            return response.status(204).end();
        })
        .catch(error => {
            return response.status(500).json(error);
        });
});

wordRouter.patch('/:wordid', jwtPassportMiddleware, (request, response) => {
    const wordUpdate = {
        words: request.body.words,
        definitions: request.body.definitions,
        images: request.body.images,
        audio: request.body.audio,
        listenhighscore: request.body.listenhighscore,
        imagehighscore: request.body.imagehighscore,
        definitionhighscore: request.body.definitionhighscore
    };

    Word.findByIdAndUpdate(request.params.wordid, wordUpdate)
        .then(() => {
            return response.status(204).end();
        })
        .catch(error => {
            return response.status(500).json(error);
        });
});

// REMOVE Word BY ID
wordRouter.delete('/:wordid', jwtPassportMiddleware, (request, response) => {
    Word.findByIdAndDelete(request.params.wordid)
        .then(() => {
            return response.status(204).end();
        })
        .catch(error => {
            return response.status(500).json(error);
        });
});

module.exports = { wordRouter };