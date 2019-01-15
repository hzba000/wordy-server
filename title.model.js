const mongoose = require('mongoose');

const titleSchema = new mongoose.Schema({
    title: {type: String}
});

titleSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title
    };
};

const Title = mongoose.model('Title', titleSchema);

module.exports = { Title, titleSchema };