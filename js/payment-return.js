// Page de retour Mollie : vérifier le statut puis rediriger vers succès ou échec
// Priorité : ?t= token (URL) → sessionStorage / cookie / ?id=
(function () {
    const API_BASE = 'https://delicorner-whatsapp.onrender.com';
    const SUCCESS_URL = window.location.origin + '/payment-success.html';
    const FAILURE_URL = window.location.origin + '/payment-failure.html';
    const FETCH_TIMEOUT_MS = 90000;
    const COOKIE_NAME = 'mollie_payment_id';

    function getPaymentIdFromStorage() {
        var id = null;
        try { id = sessionStorage.getItem('mollie_payment_id'); } catch (_) {}
        if (id) return id;
        try {
            var cs = document.cookie.split(';');
            for (var i = 0; i < cs.length; i++) {
                var p = cs[i].trim().split('=');
                if (p[0] === COOKIE_NAME && p[1]) return decodeURIComponent(p[1]);
            }
        } catch (_) {}
        var q = new URLSearchParams(window.location.search);
        return q.get('id') || null;
    }

    function clearPaymentId() {
        try { sessionStorage.removeItem('mollie_payment_id'); } catch (_) {}
        try {
            document.cookie = COOKIE_NAME + '=; path=/; domain=.delicornerhalle.be; max-age=0';
        } catch (_) {}
    }

    function redirectTo(url) {
        clearPaymentId();
        window.location.href = url;
    }

    function fetchWithTimeout(url) {
        return new Promise(function (resolve, reject) {
            var done = false;
            function finish() { if (done) return; done = true; clearTimeout(t); }
            var t = setTimeout(function () { finish(); reject(new Error('timeout')); }, FETCH_TIMEOUT_MS);
            fetch(url)
                .then(function (r) { finish(); return r.json(); })
                .then(resolve)
                .catch(function (e) { finish(); reject(e); });
        });
    }

    function resolvePaymentId(cb) {
        var q = new URLSearchParams(window.location.search);
        var token = q.get('t');
        if (token) {
            console.log('[payment-return] Token ?t= présent → appel payment-by-token');
            fetchWithTimeout(API_BASE + '/api/payment-by-token?t=' + encodeURIComponent(token))
                .then(function (data) {
                    var id = data.payment_id || null;
                    console.log('[payment-return] payment_id (token):', id ? 'ok' : 'MANQUANT');
                    if (id) { cb(id); return; }
                    cb(getPaymentIdFromStorage());
                })
                .catch(function (err) {
                    console.warn('[payment-return] Erreur payment-by-token:', err.message || err, '→ fallback storage');
                    cb(getPaymentIdFromStorage());
                });
            return;
        }
        var id = getPaymentIdFromStorage();
        console.log('[payment-return] payment_id (storage):', id ? 'ok' : 'MANQUANT', '| origin:', window.location.origin);
        cb(id);
    }

    function run(retry) {
        resolvePaymentId(function (paymentId) {
            if (!paymentId) {
                console.warn('[payment-return] Pas de payment_id → échec');
                redirectTo(FAILURE_URL);
                return;
            }
            fetchWithTimeout(API_BASE + '/api/payment-status?id=' + encodeURIComponent(paymentId))
                .then(function (data) {
                    var status = (data.status || '').toLowerCase();
                    console.log('[payment-return] status:', status, '| paid?', status === 'paid');
                    if (status === 'paid') {
                        redirectTo(SUCCESS_URL);
                    } else {
                        redirectTo(FAILURE_URL);
                    }
                })
                .catch(function (err) {
                    console.warn('[payment-return] Erreur API payment-status:', err.message || err);
                    if (retry) {
                        console.log('[payment-return] Retry...');
                        run(false);
                    } else {
                        redirectTo(FAILURE_URL);
                    }
                });
        });
    }

    run(true);
})();
