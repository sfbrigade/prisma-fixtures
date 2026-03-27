export default {
    entity: 'User',
    locale: 'pl',
    processor: '/foo/boo',
    items: {
        user2: {
            firstName: '{{person.firstName}}',
            lastName: '{{person.lastName}}',
            email: '{{internet.email}}',
        },
    },
};
