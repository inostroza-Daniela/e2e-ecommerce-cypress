const PACED_COMMANDS = ['visit', 'click', 'type', 'select'];

const demoDelay = Number(Cypress.expose('demoDelay')) || 0;

if (demoDelay > 0) {
  PACED_COMMANDS.forEach((command) => {
    Cypress.Commands.overwrite(command, (originalFn, ...args) => {
      const result = originalFn(...args);
      return new Promise((resolve) => {
        setTimeout(() => resolve(result), demoDelay);
      });
    });
  });
}
