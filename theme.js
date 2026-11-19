// Тема з Telegram: світла чи темна
(function(){var t=window.Telegram&&Telegram.WebApp;var d=t&&t.colorScheme==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.setAttribute('data-theme',d?'dark':'light');
if(t){try{t.setHeaderColor(d?'#171412':'#f6f2ec');t.setBackgroundColor(d?'#171412':'#f6f2ec');}catch(e){}}})();
