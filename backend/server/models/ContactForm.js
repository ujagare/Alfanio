import mongoose from 'mongoose';

const contactFormSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    submitDate: {
        type: Date,
        default: Date.now
    }
});

const ContactForm = mongoose.model('ContactForm', contactFormSchema);

export default ContactForm;