export const SetupForm = new SimpleSchema({
    pincode: {
        type: String,
        regEx:/^\d{6}$/,
        min: 6,
        max: 6,
        optional: true,
        label: mf("SetupForm.pincode", "Choose a pincode"),
        autoform: {
            type: 'password'
        }
    },
    pincodeConfirmation: {
        type: String,
        regEx:/^\d{6}$/,
        optional: true,
        min: 6,
        max: 6,
        label: mf("SetupForm.pincode_confirm", "Confirm your pincode"),
        custom: function() {
            if (this.value !== this.field('pincode').value) {
                return "passwordMissmatch";
            }
        },
        autoform: {
            type: 'password'
        }
    },
    passphrase: {
        type: String,
        optional: true,
        label: mf("SetupForm.passphrase", "Choose a passphrase"),
        min: 8,
        autoform: {
            type: 'password'
        }
    },
    passphraseConfirmation: {
        type: String,
        min: 8,
        optional: true,
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
