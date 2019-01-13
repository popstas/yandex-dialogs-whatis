module.exports = {
  matcher: ['забывать', 'как забывать', 'как забыть', 'забыть'],

  async handler(ctx) {
    ctx.chatbase.setIntent('helpForget');
    ctx.logMessage(`> ${ctx.message} (helpForget)`);

    const buttons = ['удали последнее', 'удали на дворе', 'забудь все'];
    return ctx.replySimple(
      [
        'Можно удалить последний ответ, сказав "удали последнее".',
        'Если надо удалить что-то другое, скажите что, например, "удали на дворе".',
        'Если надо очистить память, скажите: "забудь все".'
      ],
      buttons
    );
  }
};
