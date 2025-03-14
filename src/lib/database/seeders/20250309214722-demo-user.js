'use strict';

/** @type {import('sequelize-cli').Migration} */
export function up(queryInterface, Sequelize) {
  return queryInterface.bulkInsert('Users', [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'example@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}
export function down(queryInterface, Sequelize) {
  return queryInterface.bulkDelete('Users', null, {});
}
