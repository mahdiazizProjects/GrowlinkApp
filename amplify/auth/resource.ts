import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
    loginWith: {
        email: true,
    },
    // Add a user to ADMIN in the Cognito console to let them review mentor applications,
    // read contact messages and manage venues and events (see the /admin page).
    groups: ['ADMIN'],
});
