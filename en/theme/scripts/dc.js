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
                if (da === db) {
                    // одна дата начала: раньше стоит то, что раньше кончилось
                    da = a.getAttribute('data-end') || ''; db = b.getAttribute('data-end') || '';
                    if (da === db) return 0;
                }
                if (!da) return 1;
                if (!db) return -1;
                return (da > db ? 1 : -1) * (newest ? -1 : 1);
            }).forEach(function (row) { box.appendChild(row); });
        });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.dc-list'), initList);

    // ---- матрица
    // На телефоне шапка столбцов - отдельная полоса над таблицей: прилипает под шапкой сайта, а вбок едет вместе
    // с таблицей. Её сдвиг привязывает к прокрутке таблицы сам браузер (style-dc.css, scroll-driven animation).
    // Где браузер этого не умеет, полосу двигает этот скрипт: она может запаздывать на кадр.
    var mxNative = !!(window.CSS && CSS.supports && CSS.supports('timeline-scope', '--a') && CSS.supports('animation-timeline', '--a'));
    Array.prototype.forEach.call(document.querySelectorAll('.dc-mx-wrap'), function (wrap) {
        var tools = wrap.querySelector('.dc-mx-tools');
        if (tools) tools.hidden = false;
        if (mxNative) return;
        Array.prototype.forEach.call(wrap.querySelectorAll('.dc-mx-pair'), function (pair) {
            var box = pair.querySelector('.dc-mx-box');
            var row = pair.querySelector('.dc-mx-hd-in');
            if (!box || !row) return;
            function sync() { row.style.transform = 'translate3d(' + (-box.scrollLeft) + 'px,0,0)'; }
            pair.classList.add('dc-mx-sync');
            box.addEventListener('scroll', sync, { passive: true });
            window.addEventListener('pageshow', sync);
            sync();
        });
    });

    // ---- матрица: переносы
    // Слово переносится по слогам, только если не помещается в строку ячейки целиком: такое слово скрипт
    // оборачивает в span.dc-hy (у него hyphens: auto). Остальные слова уходят на новую строку целыми.
    // Ширина столбца зависит от окна, поэтому замер повторяется при смене ширины и после загрузки шрифтов.
    var mxCells = Array.prototype.slice.call(document.querySelectorAll('.dc-mx-name, .dc-mx-t, .dc-mx-sub a'));
    if (mxCells.length) {
        var mxText = mxCells.map(function (el) { return el.textContent; });
        var mxPen = document.createElement('canvas').getContext('2d');
        var fitWords = function () {
            // сначала все замеры, потом вся запись: раскладка пересчитывается один раз
            var plan = mxCells.map(function (el, i) {
                if (!el.offsetParent) return null;   // скрытая копия шапки столбца
                var cs = getComputedStyle(el);
                var room = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 1;
                mxPen.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
                var any = false;
                var parts = mxText[i].split(/(\s+)/).map(function (word) {
                    if (!word.trim()) return { t: word };
                    // слово с дефисом браузер разрывает после дефиса и сам: мерим его части
                    var pieces = word.split('-');
                    var wide = pieces.some(function (p, k) {
                        return mxPen.measureText(k < pieces.length - 1 ? p + '-' : p).width > room;
                    });
                    if (wide) any = true;
                    return { t: word, hy: wide };
                });
                return any ? parts : false;
            });
            mxCells.forEach(function (el, i) {
                var parts = plan[i];
                if (parts === null) return;
                if (!parts) { if (el.firstElementChild) el.textContent = mxText[i]; return; }
                // одна обёртка на весь текст: в ячейке, где текст выровнен по высоте, он остаётся одним блоком
                var box = document.createElement('span');
                parts.forEach(function (p) {
                    if (!p.hy) { box.appendChild(document.createTextNode(p.t)); return; }
                    var s = document.createElement('span');
                    s.className = 'dc-hy';
                    s.textContent = p.t;
                    box.appendChild(s);
                });
                el.textContent = '';
                el.appendChild(box);
            });
        };
        Array.prototype.forEach.call(document.querySelectorAll('.dc-mx-wrap'), function (wrap) { wrap.classList.add('dc-mx-words'); });
        fitWords();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWords);
        // на телефоне resize приходит и от панели адреса, которая прячется при прокрутке: ширина при этом та же
        var mxWidth = window.innerWidth, mxFrame = 0;
        window.addEventListener('resize', function () {
            if (window.innerWidth === mxWidth) return;
            mxWidth = window.innerWidth;
            if (mxFrame) return;
            mxFrame = requestAnimationFrame(function () { mxFrame = 0; fitWords(); });
        });
    }
})();
