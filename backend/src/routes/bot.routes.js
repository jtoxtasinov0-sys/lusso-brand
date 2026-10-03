// Bot handlerlari — bot instansiyasiga ulanadi
import {
  onStart,
  onLanguageChosen,
  onContact,
  onText,
  onMenuAction,
  onAdminCommand,
  onPanelCommand,
  onPricesCommand,
  onIdCommand,
} from '../controllers/botController.js';

export function registerBotHandlers(bot) {
  if (!bot) return;

  bot.command('start', onStart);

  bot.command('admin', onAdminCommand);

  bot.command('panel', onPanelCommand);

  bot.command('narxlar', onPricesCommand);

  bot.command('id', onIdCommand);
  // Oddiy "id" deb yozilsa ham (slashsiz)
  bot.hears(/^\s*(id|айди|ид)\s*[.!?]*\s*$/i, onIdCommand);

  bot.callbackQuery(/^lang:(uz|ru)$/, onLanguageChosen);

  bot.callbackQuery(/^menu:(orders|contact|about|lang)$/, onMenuAction);

  bot.on('message:contact', onContact);

  bot.on('message:text', onText);

  bot.catch((err) => {
    console.error('🤖 Bot xatosi:', err.message);
  });
}

export default registerBotHandlers;
