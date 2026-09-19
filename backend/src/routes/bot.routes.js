// Bot handlerlari — bot instansiyasiga ulanadi
import {
  onStart,
  onLanguageChosen,
  onContact,
  onText,
  onAdminCommand,
  onPanelCommand,
} from '../controllers/botController.js';

export function registerBotHandlers(bot) {
  if (!bot) return;

  bot.command('start', onStart);

  bot.command('admin', onAdminCommand);

  bot.command('panel', onPanelCommand);

  bot.callbackQuery(/^lang:(uz|ru)$/, onLanguageChosen);

  bot.on('message:contact', onContact);

  bot.on('message:text', onText);

  bot.catch((err) => {
    console.error('🤖 Bot xatosi:', err.message);
  });
}

export default registerBotHandlers;
