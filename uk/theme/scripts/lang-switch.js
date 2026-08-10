//Переключалка языка в навбаре: пункты помечены data-lang-switch="ru|en|uk".
//Ссылки строятся на клиенте — переписыватель subdirectory не должен их трогать,
//и локальный предпросмотр (http.server) работает без правок.
(function () {
    var LANG_PREFIX_RE = /^\/(en|uk|ce)(?=\/|$)/;

    document.addEventListener("click", function (ev) {
        var el = ev.target.closest ? ev.target.closest("[data-lang-switch]") : null;
        if (!el) return;
        ev.preventDefault();
        var target = el.getAttribute("data-lang-switch");
        try { localStorage.setItem("dclst-lang", target); } catch (e) {}
        var path = window.location.pathname.replace(LANG_PREFIX_RE, "");
        if (!path) path = "/";
        var prefix = target === "ru" ? "" : "/" + target;
        window.location.href = prefix + path + window.location.search + window.location.hash;
    });
})();
