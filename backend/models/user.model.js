const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const userSchema = new Schema( {
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3

    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8
    },
    beginMonth: {
        type: String,
        required: true,
        trim: true
    },
    latestMonth: {
        type: String,
        required: true,
        trim: true
    },
    viewingMonth: {
        type: String,
        required: true,
        trim: true
    },
} );

const User = mongoose.model( 'User', userSchema );
module.exports = User;