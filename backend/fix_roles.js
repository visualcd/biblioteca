const { User, sequelize } = require('./models');
require('dotenv').config();

(async () => {
    try {
        const users = await User.findAll();
        console.log(`Found ${users.length} users.`);

        for (const user of users) {
            const currentRole = user.role;
            const lowerRole = currentRole.toLowerCase();

            if (currentRole !== lowerRole) {
                console.log(`Updating user ${user.email}: ${currentRole} -> ${lowerRole}`);
                await user.update({ role: lowerRole });
            } else {
                console.log(`User ${user.email} is already ${currentRole}`);
            }
        }
        console.log('Done normalizing roles.');
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
})();
