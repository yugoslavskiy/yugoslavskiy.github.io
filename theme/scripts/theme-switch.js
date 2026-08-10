/* Переключатель темы: три состояния — «как в системе» (дефолт, атрибута нет),
   «светлая», «тёмная». Выбор хранится в localStorage (dclst-theme) — только на
   устройстве пользователя, как и выбор языка; никаких кук. Анти-мигание:
   инлайн-скрипт в <head> ставит data-theme до загрузки CSS, здесь — только
   кнопка. Подписи берутся из i18n_strings (settings.js), ключи js.theme.* */
(function () {
    var KEY = "dclst-theme";
    var STATES = ["system", "light", "dark"];
    var ICONS = {
        system: "fa-circle-half-stroke",
        light: "fa-sun",
        dark: "fa-moon"
    };

    function current() {
        var v = null;
        try { v = localStorage.getItem(KEY); } catch (e) {}
        return STATES.indexOf(v) > 0 ? v : "system";
    }

    function label(state) {
        var key = "js.theme." + state;
        if (typeof i18n_strings !== "undefined" && i18n_strings[key]) return i18n_strings[key];
        return { system: "тема: как в системе", light: "тема: светлая", dark: "тема: тёмная" }[state];
    }

    function apply(state) {
        if (state === "light" || state === "dark") {
            document.documentElement.setAttribute("data-theme", state);
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
    }

    function render(btn, state) {
        var icon = btn.querySelector("i");
        if (icon) icon.className = "fa-solid " + ICONS[state];
        btn.title = label(state);
        btn.setAttribute("aria-label", label(state));
    }

    var btn = document.getElementById("theme-toggle");
    if (!btn) return;

    render(btn, current());

    btn.addEventListener("click", function () {
        var next = STATES[(STATES.indexOf(current()) + 1) % STATES.length];
        try {
            if (next === "system") localStorage.removeItem(KEY);
            else localStorage.setItem(KEY, next);
        } catch (e) {}
        apply(next);
        render(btn, next);
    });
})();
