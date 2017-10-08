export const UserAccount = new SimpleSchema({
    login: {
        type: String,
        optional: true,
        autoform: {
            type: "secureInput",
            afFieldInput: {
                defaultType: "text"
            }
        }
    },
    password: {
        type: String,
        optional: true,
        autoform: {
            type: "secureInput"
        }
    }
});

export const AccountForm = new SimpleSchema({
    name: {
        type: String,
        label: mf("AccountForm.name", "Name"),
        index: true
    },
    description: {
        type: String,
        label: mf("AccountForm.description", "Description"),
        optional: true,
        autoform: {
            type: "textarea"
        }
    },
    host: {
        type: String,
        label: mf("AccountForm.host", "Host"),
        optional: true
    },
    users: {
        type: [UserAccount],
        label: mf("AccountForm.users", "Users"),
        optional: true
    }
});
