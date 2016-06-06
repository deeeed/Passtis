// Global scope to share data between client pages.
const ClientScope = {
    slideout: null // slideout menu
};

// DEBUG Only to use in the window scope
if(Meteor.isDevelopment) {
    window.scope = ClientScope;
}

export default ClientScope;