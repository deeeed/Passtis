const SetupForm = new SimpleSchema({
    passphrase: {
        type: String,
        label: mf("SetupForm.passphrase", "Choose a passphrase"),
        min: 8,
        autoform: {
            type: 'password'
        }
    },
    passphraseConfirmation: {
        type: String,
        min: 8,
        label: mf("SetupForm.passphrase_confirm", "Confirm your passphrase"),
        custom: function() {
            if (this.value !== this.field('passphrase').value) {
                return "passwordMissmatch";
            }
        },
        autoform: {
            type: 'password'
        }
    }
});

export default SetupForm;