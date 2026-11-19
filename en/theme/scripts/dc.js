/* Поведение каркаса: меню телефона, списки (поиск, народ, порядок, остальные фильтры), матрица.
   Без скрипта страницы читаются целиком: меню, процедуры и столбцы матрицы раскрываются сами (<details>). */
(function () {
    // ---- меню телефона: Escape и нажатие мимо закрывают
    var menu = document.querySelector('.dc-menu');
    if (menu) {
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
        });
        document.addEventListener('click', function (e) {
            if (menu.open && !menu.contains(e.target)) menu.open = false;
        });
    }

    // ---- списки
    function initList(root) {
        var rows = Array.prototype.slice.call(root.querySelectorAll('[data-row]'));
        if (!rows.length) return;
        var box = rows[0].parentNode;
        var find = root.querySelector('.dc-find input');
        var sort = root.querySelector('.dc-sort');
        var peoplesBox = root.querySelector('.dc-peoples');
        var selGroup = root.querySelector('.dc-f-group'), selTool = root.querySelector('.dc-f-tool');
        var yFrom = root.querySelector('.dc-f-from'), yTo = root.querySelector('.dc-f-to');
        var empty = root.querySelector('.dc-empty');
        var count = root.getAttribute('data-count') ? document.getElementById(root.getAttribute('data-count')) : null;
        var people = '';

        function list(row, name) {
            return (row.getAttribute(name) || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        }
        function year(row) {
            var y = parseInt((row.getAttribute('data-date') || '').slice(0, 4), 10);
            return isNaN(y) ? null : y;
        }

        function apply() {
            var q = find ? find.value.trim().toLowerCase() : '';
            var g = selGroup ? selGroup.value : '', t = selTool ? selTool.value : '';
            var lo = yFrom && yFrom.value ? parseInt(yFrom.value, 10) : null;
            var hi = yTo && yTo.value ? parseInt(yTo.value, 10) : null;
            var shown = 0;
            rows.forEach(function (row) {
                var ok = !q || (row.getAttribute('data-search') || '').indexOf(q) >= 0;
                if (ok && people) { var p = list(row, 'data-people'); ok = !p.length || p.indexOf(people) >= 0; }
                if (ok && g) ok = list(row, 'data-groups').indexOf(g) >= 0;
                if (ok && t) ok = list(row, 'data-tools').indexOf(t) >= 0;
                if (ok && (lo !== null || hi !== null)) {
                    var y = year(row);
                    ok = y === null || ((lo === null || y >= lo) && (hi === null || y <= hi));
                }
                row.hidden = !ok;
                if (ok) shown++;
            });
            if (empty) empty.hidden = shown > 0;
            if (count) count.textContent = shown;
        }

        if (find) find.addEventListener('input', apply);
        [selGroup, selTool].forEach(function (el) { if (el) el.addEventListener('change', apply); });
        [yFrom, yTo].forEach(function (el) { if (el) el.addEventListener('input', apply); });

        // народы: кнопки строит скрипт, без него мёртвых кнопок на странице нет
        if (peoplesBox) {
            var names = [];
            rows.forEach(function (row) { list(row, 'data-people').forEach(function (p) { if (names.indexOf(p) < 0) names.push(p); }); });
            if (names.length < 2) {
                peoplesBox.remove();
            } else {
                var buttons = [];
                [''].concat(names.sort()).forEach(function (name) {
                    var b = document.createElement('button');
                    b.type = 'button';
                    b.className = 'dc-people';
                    b.textContent = name || peoplesBox.getAttribute('data-all');
                    b.setAttribute('aria-pressed', name === people ? 'true' : 'false');
                    b.addEventListener('click', function () { choose(name); });
                    b.dcName = name;
                    peoplesBox.appendChild(b);
                    buttons.push(b);
                });
                var choose = function (name) {
                    people = name;
                    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.dcName === name ? 'true' : 'false'); });
                    apply();
                };
                // пришли с матрицы народа - сразу показываем его
                var paths = null;
                try { paths = JSON.parse(root.getAttribute('data-people-paths') || 'null'); } catch (e) {}
                if (paths) {
                    var ref = document.referrer || '';
                    Object.keys(paths).forEach(function (name) {
                        if (ref.indexOf('/matrices/' + paths[name]) >= 0 && names.indexOf(name) >= 0) choose(name);
                    });
                }
            }
        }

        if (sort) sort.addEventListener('click', function () {
            var newest = !sort.hasAttribute('data-new');
            sort.toggleAttribute('data-new', newest);
            sort.querySelector('.dc-sort-v').textContent = newest ? sort.getAttribute('data-newest') : sort.getAttribute('data-oldest');
            rows.slice().sort(function (a, b) {
                var da = a.getAttribute('data-date') || '', db = b.getAttribute('data-date') || '';
                if (da === db) return 0;
                if (!da) return 1;
                if (!db) return -1;
                return (da > db ? 1 : -1) * (newest ? -1 : 1);
            }).forEach(function (row) { box.appendChild(row); });
        });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.dc-list'), initList);

    // ---- матрица
    Array.prototype.forEach.call(document.querySelectorAll('.dc-mx-wrap'), function (wrap) {
        var mx = wrap.querySelector('.dc-mx');
        var tools = wrap.querySelector('.dc-mx-tools');
        if (tools) tools.hidden = false;
        var narrow = window.matchMedia('(max-width: 767px)');
        var cols = Array.prototype.slice.call(mx.querySelectorAll('.dc-mx-col'));
        function fit() { cols.forEach(function (c) { c.open = !narrow.matches; }); }
        fit();
        if (narrow.addEventListener) narrow.addEventListener('change', fit);
        // в широком окне столбцы всегда раскрыты: нажатие по заголовку их не сворачивает;
        // на телефоне столбец раскрывает вся строка тактики, и её название тоже
        cols.forEach(function (c) {
            c.querySelector('summary').addEventListener('click', function (e) {
                var link = e.target.closest('a');
                if (!narrow.matches) { if (!link) e.preventDefault(); return; }
                if (link) { e.preventDefault(); c.open = !c.open; }
            });
        });
    });
})();
