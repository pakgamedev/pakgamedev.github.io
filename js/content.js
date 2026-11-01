/* Shared catalogue loader for PakGameDev pages.
 * Data lives in data/content-data.js (window.__PAK_CONTENT__).
 * Loaded via <script> so it works on file:// and HTTP. */
(function (global) {
    let cache = null;

    function sortByDateDesc(items) {
        return items.slice().sort(function (a, b) {
            return String(b.dateISO || '').localeCompare(String(a.dateISO || ''));
        });
    }

    function getItems(data) {
        return (data && data.items) ? data.items : [];
    }

    const PakContent = {
        load: function () {
            if (cache) {
                return Promise.resolve(cache);
            }
            if (global.__PAK_CONTENT__) {
                cache = global.__PAK_CONTENT__;
                return Promise.resolve(cache);
            }
            return Promise.reject(new Error('Catalogue missing. Include data/content-data.js before js/content.js.'));
        },

        byType: function (data, type) {
            return sortByDateDesc(
                getItems(data).filter(function (item) {
                    return item.type === type;
                })
            );
        },

        featured: function (data, type) {
            var active = this.byType(data, type).filter(function (item) {
                return item.status === 'upcoming' || item.status === 'live';
            });
            return active[0] || null;
        },

        past: function (data, type) {
            return this.byType(data, type).filter(function (item) {
                return item.status !== 'upcoming' && item.status !== 'live';
            });
        },

        latest: function (data) {
            var items = getItems(data);
            var pinned = items.filter(function (item) {
                return item.homeFeatured === true;
            });
            if (pinned.length) {
                return sortByDateDesc(pinned)[0];
            }
            return sortByDateDesc(items)[0] || null;
        },

        news: function (data, excludeId) {
            return this.byType(data, 'news').filter(function (item) {
                return !excludeId || item.id !== excludeId;
            });
        },

        labelFor: function (item) {
            if (!item) return '';
            if (item.category) return item.category;
            if (item.type === 'jam') return 'GAME JAM';
            if (item.type === 'event') return 'EVENT';
            return String(item.type || '').toUpperCase();
        }
    };

    global.PakContent = PakContent;
})(typeof window !== 'undefined' ? window : this);
