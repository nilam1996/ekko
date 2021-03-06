'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn(
            'Pages',
            'ThemeId',
            Sequelize.INTEGER
        )
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn('Pages', 'ThemeId')
    }
};
